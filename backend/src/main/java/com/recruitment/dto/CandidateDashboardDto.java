package com.recruitment.dto;

import java.util.List;

public class CandidateDashboardDto {
    private long totalApplied;
    private long underReview;
    private long shortlisted;
    private long interview;
    private long selected;
    private long rejected;
    private long savedJobsCount;
    private List<ApplicationResponse> recentApplications;

    public CandidateDashboardDto() {}

    public long getTotalApplied() {
        return totalApplied;
    }

    public void setTotalApplied(long totalApplied) {
        this.totalApplied = totalApplied;
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

    public long getSavedJobsCount() {
        return savedJobsCount;
    }

    public void setSavedJobsCount(long savedJobsCount) {
        this.savedJobsCount = savedJobsCount;
    }

    public List<ApplicationResponse> getRecentApplications() {
        return recentApplications;
    }

    public void setRecentApplications(List<ApplicationResponse> recentApplications) {
        this.recentApplications = recentApplications;
    }
}
