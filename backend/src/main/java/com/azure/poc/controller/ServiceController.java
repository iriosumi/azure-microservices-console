package com.azure.poc.controller;

import com.azure.poc.dto.InstanceSummary;
import com.azure.poc.dto.MetricsResponse;
import com.azure.poc.dto.ServiceActionRequest;
import com.azure.poc.model.MicroService;
import com.azure.poc.service.MicroServiceService;
import com.azure.poc.service.ServiceRunner;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ServiceController {

    private final MicroServiceService serviceService;
    private final ServiceRunner serviceRunner;

    public ServiceController(MicroServiceService serviceService, ServiceRunner serviceRunner) {
        this.serviceService = serviceService;
        this.serviceRunner = serviceRunner;
    }

    // ── Service catalog CRUD ──────────────────────────────────

    @GetMapping("/services")
    public List<MicroService> getAll() {
        return serviceService.getAll();
    }

    @PostMapping("/services")
    public ResponseEntity<MicroService> create(@RequestBody MicroService service) {
        return ResponseEntity.status(201).body(serviceService.create(service));
    }

    @PutMapping("/services/{id}")
    public MicroService update(@PathVariable String id, @RequestBody MicroService service) {
        return serviceService.update(id, service);
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        serviceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Backward-compat action endpoint (used by ServiceDetails START/STOP/RESTART buttons).
     * START → creates a new instance (same as /run).
     * STOP  → stops all instances for this service.
     */
    @PostMapping("/services/{id}/action")
    public MicroService action(@PathVariable String id, @RequestBody ServiceActionRequest request) {
        return serviceService.applyAction(id, request.action());
    }

    /** Returns metrics for the most recently started alive instance of a service. */
    @GetMapping("/services/{id}/metrics")
    public MetricsResponse getServiceMetrics(@PathVariable String id) {
        return serviceRunner.getMetricsForService(id);
    }

    // ── Instance management ───────────────────────────────────

    /**
     * Spawns a NEW execution loop for the given service.
     * Calling this multiple times creates multiple concurrent instances.
     */
    @PostMapping("/services/{id}/run")
    public InstanceSummary run(@PathVariable String id) {
        MicroService svc = serviceService.findById(id);
        return serviceRunner.start(svc.getId(), svc.getName(), svc.getIconName());
    }

    /** Lists all currently alive instances across all services. */
    @GetMapping("/instances")
    public List<InstanceSummary> getInstances() {
        return serviceRunner.getRunningInstances();
    }

    /** Stops a specific instance. */
    @PostMapping("/instances/{instanceId}/stop")
    public ResponseEntity<Void> stopInstance(@PathVariable String instanceId) {
        serviceRunner.stop(instanceId);
        return ResponseEntity.noContent().build();
    }

    /** Full metrics + logs for a specific instance (used by ServiceDetails when opened from InstanceCard). */
    @GetMapping("/instances/{instanceId}/metrics")
    public MetricsResponse getInstanceMetrics(@PathVariable String instanceId) {
        return serviceRunner.getMetrics(instanceId);
    }

    /** Simple ping — used by Azure health probes */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "azure-poc-console"));
    }
}
