package com.recruitment.dto;

import java.time.LocalDateTime;

public class CandidateProjectDto {
    private Long id;
    private Long candidateId;
    private String title;
    private String description;
    private String projectUrl;
    private String githubUrl;
    private LocalDateTime createdAt;

    public CandidateProjectDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getProjectUrl() { return projectUrl; }
    public void setProjectUrl(String projectUrl) { this.projectUrl = projectUrl; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
