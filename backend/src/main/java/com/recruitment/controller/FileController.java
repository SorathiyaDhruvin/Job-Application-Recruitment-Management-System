package com.recruitment.controller;

import com.recruitment.dto.ApiResponse;
import com.recruitment.entity.CandidateProfile;
import com.recruitment.entity.Role;
import com.recruitment.entity.User;
import com.recruitment.exception.BadRequestException;
import com.recruitment.exception.UnauthorizedException;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.CandidateProfileRepository;
import com.recruitment.service.AuthService;
import com.recruitment.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileStorageService;
    private final CandidateProfileRepository candidateProfileRepository;
    private final ApplicationRepository applicationRepository;
    private final AuthService authService;

    public FileController(
            FileStorageService fileStorageService,
            CandidateProfileRepository candidateProfileRepository,
            ApplicationRepository applicationRepository,
            AuthService authService
    ) {
        this.fileStorageService = fileStorageService;
        this.candidateProfileRepository = candidateProfileRepository;
        this.applicationRepository = applicationRepository;
        this.authService = authService;
    }

    @PostMapping("/upload-resume")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadResume(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Please select a valid PDF resume to upload.");
        }

        User currentUser = authService.getCurrentUser();
        String storedFileName = fileStorageService.storeFile(file);

        // Update candidate profile
        CandidateProfile profile = candidateProfileRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> new CandidateProfile(currentUser, currentUser.getEmail()));

        profile.setResumeFileName(storedFileName);
        profile.setResumeOriginalName(file.getOriginalFilename());
        candidateProfileRepository.save(profile);

        Map<String, String> data = new HashMap<>();
        data.put("fileName", storedFileName);
        data.put("originalName", file.getOriginalFilename());
        data.put("fileUrl", "/api/files/resume/" + storedFileName);

        return ResponseEntity.ok(ApiResponse.ok("Resume uploaded successfully", data));
    }

    @GetMapping("/resume/{fileName:.+}")
    public ResponseEntity<Resource> downloadResume(@PathVariable String fileName) {
        User currentUser = authService.getCurrentUser();
        
        if (currentUser.getRole() == Role.CANDIDATE) {
            CandidateProfile profile = candidateProfileRepository.findByUserId(currentUser.getId())
                    .orElseThrow(() -> new UnauthorizedException("Profile not found."));
            if (!fileName.equals(profile.getResumeFileName())) {
                throw new UnauthorizedException("You can only access your own resume.");
            }
        } else if (currentUser.getRole() == Role.RECRUITER) {
            boolean hasAppliedToRecruiter = applicationRepository.existsByResumeFileNameAndJobRecruiterId(fileName, currentUser.getId());
            if (!hasAppliedToRecruiter) {
                throw new UnauthorizedException("You can only access resumes of candidates who applied to your jobs.");
            }
        } else if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Unauthorized to access this resume.");
        }

        Resource resource = fileStorageService.loadFileAsResource(fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
