package com.azure.poc.dto;

/**
 * Snapshot of a single running execution instance.
 * One service can have multiple concurrent instances.
 */
public record InstanceSummary(
    String instanceId,       // UUID (short 8-char)
    String serviceId,        // Parent service ID
    String serviceName,      // Human-readable name
    String iconName,         // Lucide icon name
    long   uptimeSeconds,    // Seconds since this instance started
    long   totalIterations,  // Work units completed
    double iterationsPerSec, // Current throughput
    double cpuPercent        // JVM-wide CPU % at time of snapshot
) {}
