package com.recruitment.dto;

import java.util.List;

public class RecruiterDashboardDto {
    private long totalJobs;
    private long activeJobs;
    private long totalApplicants;
    private long underReview;
    private long shortlisted;
    private long interview;
    private long selected;
    private long rejected;
    private List<ApplicationResponse> recentApplications;
    private List<JobResponse> recentJobs;

    public RecruiterDashboardDto() {}

    public long getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(long totalJobs) {
        this.totalJobs = totalJobs;
    }

    public long getActiveJobs() {
        return activeJobs;
    }

    public void setActiveJobs(long activeJobs) {
        this.activeJobs = activeJobs;
    }

    public long getTotalApplicants() {
        return totalApplicants;
    }

    public void setTotalApplicants(long totalApplicants) {
        this.totalApplicants = totalApplicants;
    }

    public long getUnderReview() {
        return underReview;
    }

    public void setUnderReview(long underReview) {
        this.underReview = underReview;
    }

    public long getShortlisted() {
        return shortlisted;
    }

    public void setShortlisted(long shortlisted) {
        this.shortlisted = shortlisted;
    }

    public long getInterview() {
        return interview;
    }

    public void setInterview(long interview) {
        this.interview = interview;
    }

    public long getSelected() {
        return selected;
    }

    public void setSelected(long selected) {
        this.selected = selected;
    }

    public long getRejected() {
        return rejected;
    }

    public void setRejected(long rejected) {
        this.rejected = rejected;
    }

    public List<ApplicationResponse> getRecentApplications() {
        return recentApplications;
    }

    public void setRecentApplications(List<ApplicationResponse> recentApplications) {
        this.recentApplications = recentApplications;
    }

    public List<JobResponse> getRecentJobs() {
        return recentJobs;
    }

    public void setRecentJobs(List<JobResponse> recentJobs) {
        this.recentJobs = recentJobs;
    }
}
