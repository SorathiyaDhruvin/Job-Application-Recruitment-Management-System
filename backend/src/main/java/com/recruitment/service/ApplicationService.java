package com.recruitment.service;

import com.recruitment.dto.ApplicationHistoryDto;
import com.recruitment.dto.ApplicationRequest;
import com.recruitment.dto.ApplicationResponse;
import com.recruitment.dto.ApplicationStatusUpdateRequest;
import com.recruitment.entity.*;
import com.recruitment.exception.BadRequestException;
import com.recruitment.exception.DuplicateResourceException;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.exception.UnauthorizedException;
import com.recruitment.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final JobRepository jobRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final AuthService authService;
    private final EmailService emailService;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            ApplicationStatusHistoryRepository statusHistoryRepository,
            JobRepository jobRepository,
            CandidateProfileRepository candidateProfileRepository,
            RecruiterProfileRepository recruiterProfileRepository,
            AuthService authService,
            EmailService emailService
    ) {
        this.applicationRepository = applicationRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.jobRepository = jobRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.authService = authService;
        this.emailService = emailService;
    }

    @Transactional
    public ApplicationResponse applyForJob(ApplicationRequest request) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != Role.CANDIDATE) {
            throw new UnauthorizedException("Only registered candidates can apply for jobs.");
        }

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + request.getJobId()));

        if (job.getStatus() != JobStatus.ACTIVE) {
            throw new BadRequestException("This job is no longer accepting applications.");
        }

        if (job.getDeadline() != null && job.getDeadline().isBefore(LocalDate.now())) {
            throw new BadRequestException("The application deadline for this job has passed (" + job.getDeadline() + ").");
        }

        if (applicationRepository.existsByJobIdAndCandidateId(job.getId(), currentUser.getId())) {
            throw new DuplicateResourceException("You have already applied for this job position.");
        }

        CandidateProfile profile = candidateProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new BadRequestException("Please complete your candidate profile before applying."));

        String resumeToUse = request.getResumeFileName();
        if (resumeToUse == null || resumeToUse.isBlank()) {
            resumeToUse = profile.getResumeFileName();
        }

        Application application = new Application();
        application.setJob(job);
        application.setCandidate(currentUser);
        application.setCoverLetter(request.getCoverLetter());
        application.setResumeFileName(resumeToUse);
        application.setStatus(ApplicationStatus.APPLIED);

        Application saved = applicationRepository.save(application);

        // Record initial status in history
        ApplicationStatusHistory history = new ApplicationStatusHistory(
                saved,
                null,
                ApplicationStatus.APPLIED,
                currentUser,
                "Application submitted successfully by candidate."
        );
        statusHistoryRepository.save(history);

        emailService.sendApplicationConfirmation(saved);

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications() {
        User currentUser = authService.getCurrentUser();
        return applicationRepository.findByCandidateIdOrderByAppliedAtDesc(currentUser.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        User currentUser = authService.getCurrentUser();
        boolean isCandidateOwner = application.getCandidate().getId().equals(currentUser.getId());
        boolean isJobRecruiter = application.getJob().getRecruiter().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isCandidateOwner && !isJobRecruiter && !isAdmin) {
            throw new UnauthorizedException("You are not authorized to view this application.");
        }

        return mapToDto(application);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsForJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != Role.ADMIN && !job.getRecruiter().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You do not have permission to view applicants for this job.");
        }

        return applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getAllApplicationsForRecruiter() {
        User currentUser = authService.getCurrentUser();
        return applicationRepository.findByJobRecruiterIdOrderByAppliedAtDesc(currentUser.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse updateApplicationStatus(Long applicationId, ApplicationStatusUpdateRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        User currentUser = authService.getCurrentUser();
        boolean isJobRecruiter = application.getJob().getRecruiter().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isJobRecruiter && !isAdmin) {
            throw new UnauthorizedException("Only the hiring recruiter or admin can update application status.");
        }

        ApplicationStatus previousStatus = application.getStatus();
        application.setStatus(request.getStatus());
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            application.setRecruiterNotes(request.getNotes());
        }

        Application updated = applicationRepository.save(application);

        ApplicationStatusHistory history = new ApplicationStatusHistory(
                updated,
                previousStatus,
                request.getStatus(),
                currentUser,
                request.getNotes() != null ? request.getNotes() : "Status updated to " + request.getStatus()
        );
        statusHistoryRepository.save(history);

        emailService.sendStatusUpdate(updated);

        return mapToDto(updated);
    }

    public ApplicationResponse mapToDto(Application app) {
        ApplicationResponse dto = new ApplicationResponse();
        dto.setId(app.getId());
        dto.setResumeFileName(app.getResumeFileName());
        dto.setCoverLetter(app.getCoverLetter());
        dto.setStatus(app.getStatus());
        dto.setRecruiterNotes(app.getRecruiterNotes());
        dto.setAppliedAt(app.getAppliedAt());
        dto.setUpdatedAt(app.getUpdatedAt());

        if (app.getJob() != null) {
            dto.setJobId(app.getJob().getId());
            dto.setJobTitle(app.getJob().getTitle());
            dto.setJobLocation(app.getJob().getLocation());
            dto.setJobType(app.getJob().getJobType());

            if (app.getJob().getCompany() != null) {
                dto.setCompanyId(app.getJob().getCompany().getId());
                dto.setCompanyName(app.getJob().getCompany().getName());
                dto.setCompanyLogoUrl(app.getJob().getCompany().getLogoUrl());
            }
        }

        if (app.getCandidate() != null) {
            dto.setCandidateId(app.getCandidate().getId());
            dto.setCandidateEmail(app.getCandidate().getEmail());

            candidateProfileRepository.findByUserId(app.getCandidate().getId()).ifPresent(p -> {
                dto.setCandidateName(p.getFullName());
                dto.setCandidatePhone(p.getPhone());
                dto.setCandidateSkills(p.getSkills());
                dto.setCandidateEducation(p.getEducation());
                dto.setCandidateExperienceYears(p.getExperienceYears());
                dto.setCandidateHeadline(p.getHeadline());
            });
        }

        List<ApplicationStatusHistory> histories = statusHistoryRepository.findByApplicationIdOrderByChangedAtAsc(app.getId());
        List<ApplicationHistoryDto> historyDtos = histories.stream().map(h -> {
            String changedByName = "System";
            if (h.getChangedBy() != null) {
                var rp = recruiterProfileRepository.findByUserId(h.getChangedBy().getId());
                var cp = candidateProfileRepository.findByUserId(h.getChangedBy().getId());
                if (rp.isPresent()) changedByName = rp.get().getFullName();
                else if (cp.isPresent()) changedByName = cp.get().getFullName();
                else changedByName = h.getChangedBy().getEmail();
            }
            return new ApplicationHistoryDto(h.getId(), h.getFromStatus(), h.getToStatus(), changedByName, h.getNotes(), h.getChangedAt());
        }).collect(Collectors.toList());

        dto.setStatusHistory(historyDtos);
        return dto;
    }
}
