package com.recruitment.controller;

import com.recruitment.dto.*;
import com.recruitment.service.ApplicationService;
import com.recruitment.service.JobService;
import com.recruitment.service.RecruiterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recruiters")
@PreAuthorize("hasRole('RECRUITER')")
public class RecruiterController {

    private final RecruiterService recruiterService;
    private final JobService jobService;
    private final ApplicationService applicationService;

    public RecruiterController(RecruiterService recruiterService, JobService jobService, ApplicationService applicationService) {
        this.recruiterService = recruiterService;
        this.jobService = jobService;
        this.applicationService = applicationService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<RecruiterProfileDto>> getProfile() {
        RecruiterProfileDto profile = recruiterService.getProfile();
        return ResponseEntity.ok(ApiResponse.ok("Recruiter profile retrieved", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<RecruiterProfileDto>> updateProfile(@RequestBody RecruiterProfileDto dto) {
        RecruiterProfileDto updated = recruiterService.updateProfile(dto);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<RecruiterDashboardDto>> getDashboardStats() {
        RecruiterDashboardDto stats = recruiterService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok("Recruiter dashboard statistics retrieved", stats));
    }

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getMyJobs() {
        List<JobResponse> jobs = jobService.getMyJobs();
        return ResponseEntity.ok(ApiResponse.ok("Recruiter jobs retrieved", jobs));
    }

    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getApplicationsForJob(@PathVariable Long jobId) {
        List<ApplicationResponse> applications = applicationService.getApplicationsForJob(jobId);
        return ResponseEntity.ok(ApiResponse.ok("Applicants retrieved successfully", applications));
    }

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getAllApplications() {
        List<ApplicationResponse> applications = applicationService.getAllApplicationsForRecruiter();
        return ResponseEntity.ok(ApiResponse.ok("All recruiter applicants retrieved", applications));
    }

    @PutMapping("/company")
    public ResponseEntity<ApiResponse<CompanyDto>> updateMyCompany(@RequestBody CompanyDto dto) {
        CompanyDto updated = recruiterService.updateMyCompany(dto);
        return ResponseEntity.ok(ApiResponse.ok("Company profile updated successfully", updated));
    }
}
