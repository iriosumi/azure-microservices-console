package com.azure.poc.dto;

import java.util.List;

/**
 * Real JVM metrics + per-service execution stats.
 * CPU% and Heap are REAL values from ManagementFactory — not simulated.
 */
public record MetricsResponse(
        // ── Real JVM-wide metrics (shared across all running services) ──
        double cpuPercent,      // Process CPU load %
        double heapUsedMb,      // Current heap usage in MB
        double heapMaxMb,       // JVM max heap in MB
        int    activeThreads,   // Total JVM thread count

        // ── Per-service execution state ──
        boolean serviceRunning,
        long    totalIterations,   // Work units completed since START
        double  iterationsPerSec,  // Current throughput (ops/sec)
        long    uptimeSeconds,     // Seconds since START was pressed

        // ── Chart history (sampled every 2s, last 20 points) ──
        List<Double> cpuHistory,
        List<Double> ipsHistory,   // iterations/sec history
        List<Double> heapHistory,
        List<String> timestamps,

        // ── Execution log from the running loop ──
        List<LogEntry> recentLogs
) {}
