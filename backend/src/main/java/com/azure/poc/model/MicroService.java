package com.azure.poc.model;

import jakarta.persistence.*;

@Entity
@Table(name = "services")
public class MicroService {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private String status; // RUNNING | STOPPED

    private String region;
    private String lastDeployed;
    private String iconName;
    private String instance;
    private String version;
    private String credentials;

    // ── Constructors ───────────────────────────────────────────
    public MicroService() {}

    public MicroService(String id, String name, String description, String status,
                        String region, String lastDeployed, String iconName,
                        String instance, String version, String credentials) {
        this.id           = id;
        this.name         = name;
        this.description  = description;
        this.status       = status;
        this.region       = region;
        this.lastDeployed = lastDeployed;
        this.iconName     = iconName;
        this.instance     = instance;
        this.version      = version;
        this.credentials  = credentials;
    }

    // ── Getters ────────────────────────────────────────────────
    public String getId()           { return id; }
    public String getName()         { return name; }
    public String getDescription()  { return description; }
    public String getStatus()       { return status; }
    public String getRegion()       { return region; }
    public String getLastDeployed() { return lastDeployed; }
    public String getIconName()     { return iconName; }
    public String getInstance()     { return instance; }
    public String getVersion()      { return version; }
    public String getCredentials()  { return credentials; }

    // ── Setters ────────────────────────────────────────────────
    public void setId(String id)                    { this.id = id; }
    public void setName(String name)                { this.name = name; }
    public void setDescription(String description)  { this.description = description; }
    public void setStatus(String status)            { this.status = status; }
    public void setRegion(String region)            { this.region = region; }
    public void setLastDeployed(String lastDeployed){ this.lastDeployed = lastDeployed; }
    public void setIconName(String iconName)        { this.iconName = iconName; }
    public void setInstance(String instance)        { this.instance = instance; }
    public void setVersion(String version)          { this.version = version; }
    public void setCredentials(String credentials)  { this.credentials = credentials; }
}
