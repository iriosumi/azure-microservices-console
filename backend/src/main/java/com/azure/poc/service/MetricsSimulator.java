package com.azure.poc.service;

import com.azure.poc.dto.LogEntry;
import com.azure.poc.dto.MetricsResponse;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @deprecated Replaced by ServiceRunner which uses real execution loops.
 * Kept for reference only — no longer a Spring bean.
 */
// @Service  ← intentionally disabled
public class MetricsSimulator {

    private static final int HISTORY_SIZE = 20;
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final DateTimeFormatter LOG_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    private final Map<String, ArrayDeque<Double>> cpuHistory = new ConcurrentHashMap<>();
    private final Map<String, ArrayDeque<Double>> memHistory = new ConcurrentHashMap<>();
    private final Map<String, ArrayDeque<Double>> rtHistory = new ConcurrentHashMap<>();
    private final Map<String, ArrayDeque<String>> tsHistory = new ConcurrentHashMap<>();

    // Base values [cpu, memory, responseTime] — each service gets a distinct profile
    private final Map<String, double[]> baseValues = new ConcurrentHashMap<>();

    private final Random random = new Random();

    public void initService(String id) {
        if (cpuHistory.containsKey(id)) return;

        double[] base = {
            10 + random.nextDouble() * 35,   // CPU 10-45%
            256 + random.nextDouble() * 512, // Memory 256-768 MB
            30 + random.nextDouble() * 200   // Response time 30-230ms
        };
        baseValues.put(id, base);
        cpuHistory.put(id, new ArrayDeque<>());
        memHistory.put(id, new ArrayDeque<>());
        rtHistory.put(id, new ArrayDeque<>());
        tsHistory.put(id, new ArrayDeque<>());

        // Pre-fill history so the chart is not empty on first render
        for (int i = 0; i < HISTORY_SIZE; i++) {
            addDataPoint(id);
        }
    }

    public void removeService(String id) {
        cpuHistory.remove(id);
        memHistory.remove(id);
        rtHistory.remove(id);
        tsHistory.remove(id);
        baseValues.remove(id);
    }

    // @Scheduled(fixedDelay = 5000)  ← disabled; no longer a bean
    public void tick() {
        cpuHistory.keySet().forEach(this::addDataPoint);
    }

    private void addDataPoint(String id) {
        double[] base = baseValues.getOrDefault(id, new double[]{20, 512, 100});
        double cpu = clamp(base[0] + random.nextGaussian() * 6, 1, 99);
        double mem = clamp(base[1] + random.nextGaussian() * 25, 64, 2048);
        double rt  = clamp(base[2] + random.nextGaussian() * 20, 5, 3000);
        String ts  = LocalDateTime.now().format(TIME_FMT);

        push(cpuHistory.get(id), cpu);
        push(memHistory.get(id), mem);
        push(rtHistory.get(id), rt);
        push(tsHistory.get(id), ts);
    }

    private <T> void push(ArrayDeque<T> deque, T value) {
        if (deque == null) return;
        if (deque.size() >= HISTORY_SIZE) deque.pollFirst();
        deque.addLast(value);
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    // Replaced by ServiceRunner.getMetrics() — kept for reference only
    public MetricsResponse getMetrics(String id) {
        throw new UnsupportedOperationException("MetricsSimulator is deprecated. Use ServiceRunner.");
    }

    private List<LogEntry> generateLogs(String id) {
        String[] levels = {"INFO", "INFO", "INFO", "DEBUG", "WARN", "INFO"};
        String[][] messages = {
            {"INFO",  "Request processed in %dms on endpoint /api/v1/%s"},
            {"INFO",  "Health check: DB pool %d/%d connections active"},
            {"DEBUG", "Cache hit ratio: %.1f%% — key: %s"},
            {"INFO",  "JWT validated for user session #%d"},
            {"WARN",  "Slow query detected: %dms on table transactions"},
            {"INFO",  "Scheduled task completed in %dms"},
        };

        List<LogEntry> logs = new ArrayList<>();
        String[] endpoints = {"users", "orders", "health", "metrics", "auth", "tokens"};

        for (int i = 0; i < 10; i++) {
            String[] tmpl = messages[random.nextInt(messages.length)];
            String level  = tmpl[0];
            String msg    = String.format(tmpl[1],
                random.nextInt(300), endpoints[random.nextInt(endpoints.length)],
                random.nextInt(20), random.nextInt(20),
                50 + random.nextDouble() * 50, endpoints[random.nextInt(endpoints.length)],
                random.nextInt(10000), random.nextInt(400), random.nextInt(200)
            );

            logs.add(new LogEntry(
                LocalDateTime.now().minusSeconds((long) i * 12).format(LOG_FMT),
                level,
                "nio-8080-exec-" + (random.nextInt(10) + 1),
                "com.azure.poc." + id.replace("-", "."),
                msg.substring(0, Math.min(msg.length(), 80))
            ));
        }
        return logs;
    }
}
