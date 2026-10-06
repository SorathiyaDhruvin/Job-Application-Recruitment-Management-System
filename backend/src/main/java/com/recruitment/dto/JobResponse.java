package com.recruitment.dto;

import com.recruitment.entity.ExperienceLevel;
import com.recruitment.entity.JobStatus;
import com.recruitment.entity.JobType;
import com.recruitment.entity.WorkMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class JobResponse {
    private Long id;
    private String title;
    private String description;
    private String responsibilities;
    private String requirements;

    // Company info
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
    private String companyWebsite;
    private String companyIndustry;
    private String companyHeadquarters;
    private String companySize;
    private String companyDomain;

    // Recruiter info
    private Long recruiterId;
    private String recruiterName;

    // Location (structured)
    private String location;
    private String country;
    private String state;
    private String city;
    private WorkMode workMode;

    // Computed display fields
    private String formattedLocation;
    private String formattedSalary;
    private String workModeDisplay;

    // Employment & experience
    private JobType jobType;
    private ExperienceLevel experienceLevel;

    // Salary (real data only — never generated)
    private Double salaryMin;
    private Double salaryMax;
    private String salaryCurrency;
    private String salaryText;
    private Boolean salaryDisclosed;

    // Source info
    private String sourceUrl;
    private String sourceName;
    private String sourceType;
    private LocalDateTime sourcePublishedAt;
    private LocalDateTime lastVerifiedAt;

    // Dates & status
    private LocalDate deadline;
    private JobStatus status;
    private String skills;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Engagement
    private long applicantCount;
    private boolean appliedByCurrentUser;
    private boolean savedByCurrentUser;

    public JobResponse() {}

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getResponsibilities() { return responsibilities; }
    public void setResponsibilities(String responsibilities) { this.responsibilities = responsibilities; }

    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyLogoUrl() { return companyLogoUrl; }
    public void setCompanyLogoUrl(String companyLogoUrl) { this.companyLogoUrl = companyLogoUrl; }

    public String getCompanyWebsite() { return companyWebsite; }
    public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }

    public String getCompanyIndustry() { return companyIndustry; }
    public void setCompanyIndustry(String companyIndustry) { this.companyIndustry = companyIndustry; }

    public String getCompanyHeadquarters() { return companyHeadquarters; }
    public void setCompanyHeadquarters(String companyHeadquarters) { this.companyHeadquarters = companyHeadquarters; }

    public String getCompanySize() { return companySize; }
    public void setCompanySize(String companySize) { this.companySize = companySize; }

    public String getCompanyDomain() { return companyDomain; }
    public void setCompanyDomain(String companyDomain) { this.companyDomain = companyDomain; }

    public Long getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Long recruiterId) { this.recruiterId = recruiterId; }

    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public WorkMode getWorkMode() { return workMode; }
    public void setWorkMode(WorkMode workMode) { this.workMode = workMode; }

    public String getFormattedLocation() { return formattedLocation; }
    public void setFormattedLocation(String formattedLocation) { this.formattedLocation = formattedLocation; }

    public String getFormattedSalary() { return formattedSalary; }
    public void setFormattedSalary(String formattedSalary) { this.formattedSalary = formattedSalary; }

    public String getWorkModeDisplay() { return workModeDisplay; }
    public void setWorkModeDisplay(String workModeDisplay) { this.workModeDisplay = workModeDisplay; }

    public JobType getJobType() { return jobType; }
    public void setJobType(JobType jobType) { this.jobType = jobType; }

    public ExperienceLevel getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(ExperienceLevel experienceLevel) { this.experienceLevel = experienceLevel; }

    public Double getSalaryMin() { return salaryMin; }
    public void setSalaryMin(Double salaryMin) { this.salaryMin = salaryMin; }

    public Double getSalaryMax() { return salaryMax; }
    public void setSalaryMax(Double salaryMax) { this.salaryMax = salaryMax; }

    public String getSalaryCurrency() { return salaryCurrency; }
    public void setSalaryCurrency(String salaryCurrency) { this.salaryCurrency = salaryCurrency; }

    public String getSalaryText() { return salaryText; }
    public void setSalaryText(String salaryText) { this.salaryText = salaryText; }

    public Boolean getSalaryDisclosed() { return salaryDisclosed; }
    public void setSalaryDisclosed(Boolean salaryDisclosed) { this.salaryDisclosed = salaryDisclosed; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getSourceName() { return sourceName; }
    public void setSourceName(String sourceName) { this.sourceName = sourceName; }

    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }

    public LocalDateTime getSourcePublishedAt() { return sourcePublishedAt; }
    public void setSourcePublishedAt(LocalDateTime sourcePublishedAt) { this.sourcePublishedAt = sourcePublishedAt; }

    public LocalDateTime getLastVerifiedAt() { return lastVerifiedAt; }
    public void setLastVerifiedAt(LocalDateTime lastVerifiedAt) { this.lastVerifiedAt = lastVerifiedAt; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public long getApplicantCount() { return applicantCount; }
    public void setApplicantCount(long applicantCount) { this.applicantCount = applicantCount; }

    public boolean isAppliedByCurrentUser() { return appliedByCurrentUser; }
    public void setAppliedByCurrentUser(boolean appliedByCurrentUser) { this.appliedByCurrentUser = appliedByCurrentUser; }

    public boolean isSavedByCurrentUser() { return savedByCurrentUser; }
    public void setSavedByCurrentUser(boolean savedByCurrentUser) { this.savedByCurrentUser = savedByCurrentUser; }
}
