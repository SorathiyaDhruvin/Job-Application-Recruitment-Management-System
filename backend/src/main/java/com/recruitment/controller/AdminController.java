package com.recruitment.controller;

import com.recruitment.dto.*;
import com.recruitment.entity.JobStatus;
import com.recruitment.service.AdminService;
import com.recruitment.service.CompanyService;
import com.recruitment.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final JobService jobService;
    private final CompanyService companyService;

    public AdminController(AdminService adminService, JobService jobService, CompanyService companyService) {
        this.adminService = adminService;
        this.jobService = jobService;
        this.companyService = companyService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getStats() {
        AdminStatsDto stats = adminService.getAdminStats();
        return ResponseEntity.ok(ApiResponse.ok("Platform statistics retrieved", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved successfully", users));
    }

    @PatchMapping("/users/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(@PathVariable Long userId) {
        UserDto user = adminService.toggleUserStatus(userId);
        return ResponseEntity.ok(ApiResponse.ok("User status updated", user));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.ok("User deleted successfully"));
    }

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getAllJobs() {
        List<JobResponse> jobs = jobService.getAllJobsAdmin();
        return ResponseEntity.ok(ApiResponse.ok("All platform jobs retrieved", jobs));
    }

    @PatchMapping("/jobs/{jobId}/status")
    public ResponseEntity<ApiResponse<JobResponse>> updateJobStatus(
            @PathVariable Long jobId,
            @RequestParam JobStatus status
    ) {
        JobResponse job = adminService.updateJobStatus(jobId, status);
        return ResponseEntity.ok(ApiResponse.ok("Job status updated", job));
    }

    @DeleteMapping("/jobs/{jobId}")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long jobId) {
        jobService.deleteJob(jobId);
        return ResponseEntity.ok(ApiResponse.ok("Job deleted by admin"));
    }

    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<List<CompanyDto>>> getAllCompanies() {
        List<CompanyDto> companies = companyService.getAllCompanies();
        return ResponseEntity.ok(ApiResponse.ok("Companies retrieved", companies));
    }

    @PatchMapping("/companies/{companyId}/toggle-verify")
    public ResponseEntity<ApiResponse<CompanyDto>> toggleCompanyVerification(@PathVariable Long companyId) {
        CompanyDto company = adminService.toggleCompanyVerification(companyId);
        return ResponseEntity.ok(ApiResponse.ok("Company verification status updated", company));
    }
}
