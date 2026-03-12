package com.azure.poc.service;

import com.azure.poc.model.MicroService;
import com.azure.poc.repository.MicroServiceRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class MicroServiceService {

    private final MicroServiceRepository repository;
    private final ServiceRunner serviceRunner;

    public MicroServiceService(MicroServiceRepository repository, ServiceRunner serviceRunner) {
        this.repository = repository;
        this.serviceRunner = serviceRunner;
    }

    @PostConstruct
    public void seedData() {
        if (repository.count() > 0) return;

        // All services start STOPPED — user presses Run to spawn execution instances
        List<MicroService> initial = List.of(
            new MicroService("1", "auth-service",        "Centralized Identity Provider",  "STOPPED", "East US 2", "Never", "Database",     "prod-us-east-001", "Spring Boot v3.2.1", null),
            new MicroService("2", "order-api",           "Transaction Management",         "STOPPED", "East US 2", "Never", "ShoppingCart", "prod-us-east-002", "Spring Boot v3.2.1", null),
            new MicroService("3", "inventory-service",   "Real-time Stock Tracking",       "STOPPED", "East US 2", "Never", "Package",      "prod-us-east-003", "Spring Boot v3.2.1", null),
            new MicroService("4", "notification-worker", "Async Email & SMS",              "STOPPED", "East US 2", "Never", "Mail",         "prod-us-east-004", "Spring Boot v3.2.1", null),
            new MicroService("5", "payment-gateway",     "Stripe Integration Service",     "STOPPED", "East US 2", "Never", "CreditCard",   "prod-us-east-005", "Spring Boot v3.2.1", null)
        );
        repository.saveAll(initial);
    }

    public List<MicroService> getAll() {
        return repository.findAll();
    }

    public MicroService findById(String id) {
        return repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Service not found: " + id));
    }

    public MicroService create(MicroService service) {
        service.setId(UUID.randomUUID().toString().substring(0, 9));
        service.setStatus("STOPPED");
        service.setLastDeployed("Never");
        service.setVersion("Spring Boot v3.2.1");
        String regionSlug = service.getRegion() != null
            ? service.getRegion().toLowerCase().replace(" ", "-") : "us-east";
        service.setInstance("prod-" + regionSlug + "-" + service.getId().substring(0, 3));
        return repository.save(service);
    }

    public MicroService update(String id, MicroService updated) {
        return repository.findById(id).map(s -> {
            s.setName(updated.getName());
            s.setDescription(updated.getDescription());
            s.setRegion(updated.getRegion());
            s.setIconName(updated.getIconName());
            s.setCredentials(updated.getCredentials());
            return repository.save(s);
        }).orElseThrow(() -> new IllegalArgumentException("Service not found: " + id));
    }

    public MicroService applyAction(String id, String action) {
        return repository.findById(id).map(s -> {
            switch (action) {
                case "STOP" -> {
                    serviceRunner.stopAllForService(id);
                    s.setStatus("STOPPED");
                }
                case "START" -> {
                    serviceRunner.start(id, s.getName(), s.getIconName());
                    s.setStatus("RUNNING");
                    s.setLastDeployed("Just now");
                }
                case "RESTART" -> {
                    serviceRunner.stopAllForService(id);
                    serviceRunner.start(id, s.getName(), s.getIconName());
                    s.setStatus("RUNNING");
                    s.setLastDeployed("Just now");
                }
            }
            return repository.save(s);
        }).orElseThrow(() -> new IllegalArgumentException("Service not found: " + id));
    }

    public void delete(String id) {
        serviceRunner.stopAllForService(id);
        repository.deleteById(id);
    }
}
