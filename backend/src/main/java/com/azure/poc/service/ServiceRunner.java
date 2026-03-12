package com.azure.poc.service;

import com.azure.poc.dto.InstanceSummary;
import com.azure.poc.dto.LogEntry;
import com.azure.poc.dto.MetricsResponse;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Manages real execution loops per microservice instance.
 *
 * Each call to start() spawns a new daemon Thread with a unique instanceId (short UUID).
 * The same service can have multiple concurrent instances running simultaneously.
 * stop(instanceId) interrupts a specific instance.
 * stopAllForService(serviceId) interrupts every instance of a service.
 *
 * A @Scheduled job samples real JVM metrics every 2 seconds.
 */
@Service
public class ServiceRunner {

    private static final int HISTORY_SIZE = 20;
    private static final int MAX_LOGS     = 40;
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final DateTimeFormatter LOG_FMT  = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    // ── Internal task record ──────────────────────────────────
    private record WorkTask(
        String serviceId,
        String serviceName,
        String iconName,
        Thread thread,
        AtomicLong iterations,
        long startTimeMs,
        ConcurrentLinkedDeque<LogEntry> logs
    ) {}

    // key = instanceId (short UUID), NOT serviceId
    private final Map<String, WorkTask>       tasks    = new ConcurrentHashMap<>();
    private final Map<String, Deque<Double>>  cpuHist  = new ConcurrentHashMap<>();
    private final Map<String, Deque<Double>>  ipsHist  = new ConcurrentHashMap<>();
    private final Map<String, Deque<Double>>  heapHist = new ConcurrentHashMap<>();
    private final Map<String, Deque<String>>  tsHist   = new ConcurrentHashMap<>();

    private final OperatingSystemMXBean osMXBean  = ManagementFactory.getOperatingSystemMXBean();
    private final MemoryMXBean          memMXBean = ManagementFactory.getMemoryMXBean();

    // ── Public API ────────────────────────────────────────────

    /**
     * Starts a new execution loop for the given service.
     * Returns an InstanceSummary with the unique instanceId.
     * Multiple calls create multiple independent instances.
     */
    public InstanceSummary start(String serviceId, String serviceName, String iconName) {
        String instanceId = UUID.randomUUID().toString().replace("-", "").substring(0, 8);

        AtomicLong counter = new AtomicLong(0);
        ConcurrentLinkedDeque<LogEntry> logs = new ConcurrentLinkedDeque<>();

        cpuHist.put(instanceId, new ArrayDeque<>());
        ipsHist.put(instanceId, new ArrayDeque<>());
        heapHist.put(instanceId, new ArrayDeque<>());
        tsHist.put(instanceId, new ArrayDeque<>());

        Thread t = new Thread(() -> runLoop(instanceId, iconName, counter, logs));
        t.setName("svc-" + serviceId + "-" + instanceId);
        t.setDaemon(true);

        tasks.put(instanceId, new WorkTask(serviceId, serviceName, iconName, t, counter, System.currentTimeMillis(), logs));
        t.start();

        appendLog(logs, "INFO", t.getName(), serviceName,
            "Instance [" + instanceId + "] started — loop running until STOP.");

        return new InstanceSummary(instanceId, serviceId, serviceName, iconName, 0L, 0L, 0.0, readCpuPercent());
    }

    /** Stops a specific instance by its instanceId. */
    public void stop(String instanceId) {
        WorkTask wt = tasks.remove(instanceId);
        if (wt != null) {
            wt.thread().interrupt();
        }
        cpuHist.remove(instanceId);
        ipsHist.remove(instanceId);
        heapHist.remove(instanceId);
        tsHist.remove(instanceId);
    }

    /** Stops all running instances that belong to a given serviceId. */
    public void stopAllForService(String serviceId) {
        tasks.entrySet().stream()
            .filter(e -> serviceId.equals(e.getValue().serviceId()))
            .map(Map.Entry::getKey)
            .toList()
            .forEach(this::stop);
    }

    public boolean isRunning(String instanceId) {
        WorkTask wt = tasks.get(instanceId);
        return wt != null && wt.thread().isAlive();
    }

    /** Returns live summaries for all currently alive instances (across all services). */
    public List<InstanceSummary> getRunningInstances() {
        double cpu = readCpuPercent();
        return tasks.entrySet().stream()
            .filter(e -> e.getValue().thread().isAlive())
            .map(e -> {
                String   iid = e.getKey();
                WorkTask wt  = e.getValue();
                long elapsed = Math.max(System.currentTimeMillis() - wt.startTimeMs(), 1);
                double ips   = wt.iterations().get() * 1000.0 / elapsed;
                return new InstanceSummary(
                    iid,
                    wt.serviceId(),
                    wt.serviceName(),
                    wt.iconName(),
                    elapsed / 1000,
                    wt.iterations().get(),
                    ips,
                    cpu
                );
            })
            .sorted(Comparator.comparingLong(InstanceSummary::uptimeSeconds).reversed())
            .collect(Collectors.toList());
    }

    // ── Execution loop ────────────────────────────────────────

    private void runLoop(String instanceId, String iconName,
                         AtomicLong counter, ConcurrentLinkedDeque<LogEntry> logs) {
        long batchStart = System.currentTimeMillis();

        while (!Thread.currentThread().isInterrupted()) {
            try {
                doWork(iconName);
                long iter = counter.incrementAndGet();

                if (iter % 500 == 0) {
                    long elapsed = Math.max(System.currentTimeMillis() - batchStart, 1);
                    double batchIps = 500_000.0 / elapsed;
                    appendLog(logs, "INFO", Thread.currentThread().getName(), instanceId,
                        buildLogMsg(iconName, iter, batchIps));
                    batchStart = System.currentTimeMillis();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                appendLog(logs, "WARN", Thread.currentThread().getName(), instanceId,
                    "Exception in work loop: " + e.getMessage());
            }
        }
        appendLog(logs, "INFO", Thread.currentThread().getName(), instanceId,
            "Loop terminated — instance [" + instanceId + "] stopped.");
    }

    // ── Real work per service type ────────────────────────────

    private void doWork(String iconName) throws Exception {
        switch (iconName) {

            case "Database" -> {
                String payload = "sub:usr_" + Thread.currentThread().getId()
                                + ":iat:" + System.nanoTime();
                MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
                byte[] hash = sha256.digest(payload.getBytes());
                Base64.getEncoder().encodeToString(hash);
            }

            case "ShoppingCart" -> {
                double[] prices = new double[300];
                for (int i = 0; i < prices.length; i++) prices[i] = Math.random() * 9_999.99;
                Arrays.sort(prices);
                double total = 0;
                for (double p : prices) total += p * 1.16;
                if (total < 0) throw new ArithmeticException("negative total");
            }

            case "Package" -> {
                int n = 25;
                double[][] a = new double[n][n];
                double[][] b = new double[n][n];
                double[][] c = new double[n][n];
                for (int i = 0; i < n; i++)
                    for (int j = 0; j < n; j++) {
                        a[i][j] = Math.random();
                        b[i][j] = Math.random();
                    }
                for (int i = 0; i < n; i++)
                    for (int j = 0; j < n; j++)
                        for (int k = 0; k < n; k++)
                            c[i][j] += a[i][k] * b[k][j];
            }

            case "Mail" -> {
                StringBuilder sb = new StringBuilder(2048);
                for (int i = 0; i < 80; i++) {
                    sb.append("Estimado {{name}}, su orden #{{orderId}} "
                            + "de ${{amount}} MXN ha sido confirmada. ");
                }
                String rendered = sb.toString()
                    .replace("{{name}}", "Cliente_" + System.nanoTime())
                    .replace("{{orderId}}", "ORD-" + System.currentTimeMillis())
                    .replace("{{amount}}", String.format("%.2f", Math.random() * 50_000));
                rendered.matches(".*confirmada.*MXN.*");
            }

            case "CreditCard" -> {
                BigDecimal subtotal = BigDecimal.valueOf(Math.random() * 100_000);
                BigDecimal iva      = subtotal.multiply(new BigDecimal("0.16"))
                                             .setScale(2, RoundingMode.HALF_UP);
                BigDecimal total    = subtotal.add(iva);
                String payload      = "pay:" + total.toPlainString() + ":nonce:" + System.nanoTime();
                MessageDigest sha512 = MessageDigest.getInstance("SHA-512");
                sha512.digest(payload.getBytes());
            }

            default -> {
                long a = 0, b = 1;
                for (int i = 0; i < 3_000; i++) {
                    long t = a + b;
                    a = b;
                    b = t;
                }
            }
        }
    }

    // ── @Scheduled: sample real JVM metrics every 2 seconds ──

    @Scheduled(fixedDelay = 2000)
    public void sampleMetrics() {
        if (tasks.isEmpty()) return;

        double cpu  = readCpuPercent();
        double heap = memMXBean.getHeapMemoryUsage().getUsed() / (1024.0 * 1024.0);
        String ts   = LocalDateTime.now().format(TIME_FMT);

        for (Map.Entry<String, WorkTask> entry : tasks.entrySet()) {
            String   instanceId = entry.getKey();
            WorkTask wt         = entry.getValue();
            if (!wt.thread().isAlive()) continue;

            long elapsed = Math.max(System.currentTimeMillis() - wt.startTimeMs(), 1);
            double ips   = wt.iterations().get() * 1000.0 / elapsed;

            push(cpuHist.get(instanceId), cpu);
            push(ipsHist.get(instanceId), ips);
            push(heapHist.get(instanceId), heap);
            push(tsHist.get(instanceId), ts);
        }
    }

    // ── getMetrics — by instanceId ────────────────────────────

    public MetricsResponse getMetrics(String instanceId) {
        WorkTask wt      = tasks.get(instanceId);
        boolean  running = wt != null && wt.thread().isAlive();

        double cpu      = readCpuPercent();
        double heapUsed = memMXBean.getHeapMemoryUsage().getUsed()  / (1024.0 * 1024.0);
        double heapMax  = memMXBean.getHeapMemoryUsage().getMax()   / (1024.0 * 1024.0);
        int    threads  = ManagementFactory.getThreadMXBean().getThreadCount();

        long   totalIter = 0;
        double ips       = 0;
        long   uptime    = 0;

        if (wt != null) {
            totalIter = wt.iterations().get();
            long elapsed = Math.max(System.currentTimeMillis() - wt.startTimeMs(), 1);
            ips    = totalIter * 1000.0 / elapsed;
            uptime = elapsed / 1000;
        }

        List<Double> cpuH  = new ArrayList<>(cpuHist.getOrDefault(instanceId,  new ArrayDeque<>()));
        List<Double> ipsH  = new ArrayList<>(ipsHist.getOrDefault(instanceId,  new ArrayDeque<>()));
        List<Double> heapH = new ArrayList<>(heapHist.getOrDefault(instanceId, new ArrayDeque<>()));
        List<String> tsH   = new ArrayList<>(tsHist.getOrDefault(instanceId,   new ArrayDeque<>()));

        List<LogEntry> logs = wt != null
            ? wt.logs().stream().limit(MAX_LOGS).toList()
            : List.of();

        return new MetricsResponse(
            cpu, heapUsed, heapMax, threads,
            running, totalIter, ips, uptime,
            cpuH, ipsH, heapH, tsH, logs
        );
    }

    /**
     * Returns metrics for the most recently started alive instance of a service.
     * Used by GET /api/services/{id}/metrics (ServiceDetails view).
     */
    public MetricsResponse getMetricsForService(String serviceId) {
        return tasks.entrySet().stream()
            .filter(e -> serviceId.equals(e.getValue().serviceId()) && e.getValue().thread().isAlive())
            .max(Comparator.comparingLong(e -> e.getValue().startTimeMs()))
            .map(e -> getMetrics(e.getKey()))
            .orElseGet(() -> getMetrics("__none__")); // returns zero/stopped metrics
    }

    // ── Helpers ───────────────────────────────────────────────

    private double readCpuPercent() {
        if (osMXBean instanceof com.sun.management.OperatingSystemMXBean sun) {
            double load = sun.getProcessCpuLoad();
            return load < 0 ? 0 : Math.min(load * 100, 100);
        }
        double avg = osMXBean.getSystemLoadAverage();
        int    cpus = osMXBean.getAvailableProcessors();
        return avg < 0 ? 0 : Math.min((avg / cpus) * 100, 100);
    }

    private <T> void push(Deque<T> deque, T value) {
        if (deque == null) return;
        if (deque.size() >= HISTORY_SIZE) deque.pollFirst();
        deque.addLast(value);
    }

    private void appendLog(ConcurrentLinkedDeque<LogEntry> logs, String level,
                           String thread, String cls, String msg) {
        if (logs.size() >= MAX_LOGS) logs.pollFirst();
        logs.addLast(new LogEntry(
            LocalDateTime.now().format(LOG_FMT),
            level, thread,
            "com.azure.poc." + cls.replace("-", "."),
            msg
        ));
    }

    private String buildLogMsg(String iconName, long iter, double ips) {
        return switch (iconName) {
            case "Database"     -> String.format("JWT batch #%,d completed | SHA-256+Base64 | %.0f ops/sec", iter, ips);
            case "ShoppingCart" -> String.format("Order batch #%,d processed | 300-item sort+tax | %.0f ops/sec", iter, ips);
            case "Package"      -> String.format("Stock iteration #%,d | 25x25 matrix multiply | %.0f ops/sec", iter, ips);
            case "Mail"         -> String.format("Template #%,d rendered | 80-msg replace+regex | %.0f ops/sec", iter, ips);
            case "CreditCard"   -> String.format("Payment #%,d processed | BigDecimal+SHA-512 | %.0f ops/sec", iter, ips);
            default             -> String.format("Iteration #%,d completed | %.0f ops/sec", iter, ips);
        };
    }
}
