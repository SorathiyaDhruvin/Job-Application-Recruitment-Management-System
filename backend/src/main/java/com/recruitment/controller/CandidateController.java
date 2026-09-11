package com.recruitment.controller;

import com.recruitment.dto.ApiResponse;
import com.recruitment.dto.CandidateDashboardDto;
import com.recruitment.dto.CandidateProfileDto;
import com.recruitment.dto.JobResponse;
import com.recruitment.service.CandidateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CandidateProfileDto>> getProfile() {
        CandidateProfileDto profile = candidateService.getProfile();
        return ResponseEntity.ok(ApiResponse.ok("Candidate profile retrieved", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CandidateProfileDto>> updateProfile(@RequestBody CandidateProfileDto dto) {
        CandidateProfileDto updated = candidateService.updateProfile(dto);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<CandidateDashboardDto>> getDashboardStats() {
        CandidateDashboardDto stats = candidateService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok("Candidate dashboard statistics retrieved", stats));
    }

    @PostMapping("/saved-jobs/{jobId}")
    public ResponseEntity<ApiResponse<Void>> saveJob(@PathVariable Long jobId) {
        candidateService.saveJob(jobId);
        return ResponseEntity.ok(ApiResponse.ok("Job saved successfully"));
    }

    @DeleteMapping("/saved-jobs/{jobId}")
    public ResponseEntity<ApiResponse<Void>> unsaveJob(@PathVariable Long jobId) {
        candidateService.unsaveJob(jobId);
        return ResponseEntity.ok(ApiResponse.ok("Job removed from saved list"));
    }

    @GetMapping("/saved-jobs")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getSavedJobs() {
        List<JobResponse> savedJobs = candidateService.getSavedJobs();
        return ResponseEntity.ok(ApiResponse.ok("Saved jobs retrieved", savedJobs));
    }
}
