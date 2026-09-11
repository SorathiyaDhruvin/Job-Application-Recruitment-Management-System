package com.recruitment.controller;

import com.recruitment.dto.ApiResponse;
import com.recruitment.dto.ApplicationRequest;
import com.recruitment.dto.ApplicationResponse;
import com.recruitment.dto.ApplicationStatusUpdateRequest;
import com.recruitment.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> apply(@Valid @RequestBody ApplicationRequest request) {
        ApplicationResponse response = applicationService.applyForJob(request);
        return new ResponseEntity<>(ApiResponse.ok("Application submitted successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications() {
        List<ApplicationResponse> applications = applicationService.getMyApplications();
        return ResponseEntity.ok(ApiResponse.ok("Applications retrieved successfully", applications));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApplicationResponse>> getApplicationById(@PathVariable Long id) {
        ApplicationResponse response = applicationService.getApplicationById(id);
        return ResponseEntity.ok(ApiResponse.ok("Application details retrieved", response));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationStatusUpdateRequest request
    ) {
        ApplicationResponse response = applicationService.updateApplicationStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Application status updated successfully", response));
    }
}
