package com.recruitment.dto;

import java.time.LocalDateTime;

public class CompanyDto {
    private Long id;
    private String name;
    private String description;
    private String website;
    private String location;
    private String logoUrl;
    private boolean verified;
    private LocalDateTime createdAt;
    private long activeJobsCount;

    public CompanyDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public long getActiveJobsCount() {
        return activeJobsCount;
    }

    public void setActiveJobsCount(long activeJobsCount) {
        this.activeJobsCount = activeJobsCount;
    }
}
