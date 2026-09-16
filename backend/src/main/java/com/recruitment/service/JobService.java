package com.recruitment.service;

import com.recruitment.dto.JobRequest;
import com.recruitment.dto.JobResponse;
import com.recruitment.entity.*;
import com.recruitment.exception.BadRequestException;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.exception.UnauthorizedException;
import com.recruitment.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final ApplicationRepository applicationRepository;
    private final SavedJobRepository savedJobRepository;
    private final AuthService authService;

    public JobService(
            JobRepository jobRepository,
            CompanyRepository companyRepository,
            RecruiterProfileRepository recruiterProfileRepository,
            ApplicationRepository applicationRepository,
            SavedJobRepository savedJobRepository,
            AuthService authService
    ) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.applicationRepository = applicationRepository;
        this.savedJobRepository = savedJobRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<JobResponse> searchJobs(
            String keyword,
            String location,
            JobType jobType,
            ExperienceLevel experienceLevel,
            JobStatus status
    ) {
        JobStatus effectiveStatus = status != null ? status : JobStatus.ACTIVE;
        List<Job> jobs = jobRepository.searchJobs(
                keyword != null && !keyword.isBlank() ? keyword.trim() : null,
                location != null && !location.isBlank() ? location.trim() : null,
                jobType,
                experienceLevel,
                effectiveStatus
        );

        Long currentCandidateId = getCurrentCandidateUserIdOrNull();

        return jobs.stream()
                .map(job -> mapToDto(job, currentCandidateId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobResponse getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));

        Long currentCandidateId = getCurrentCandidateUserIdOrNull();
        return mapToDto(job, currentCandidateId);
    }

    @Transactional
    public JobResponse createJob(JobRequest request) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != Role.RECRUITER && currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only recruiters can post jobs.");
        }

        Company company = null;
        if (request.getCompanyId() != null) {
            company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));
        } else {
            var recruiterOpt = recruiterProfileRepository.findByUserId(currentUser.getId());
            if (recruiterOpt.isPresent() && recruiterOpt.get().getCompany() != null) {
                company = recruiterOpt.get().getCompany();
            } else {
                throw new BadRequestException("Recruiter must be associated with a company to post jobs.");
            }
        }

        if (!company.isVerified()) {
            throw new UnauthorizedException("Your company has not been verified yet. Only verified companies can post jobs.");
        }

        if (request.getDeadline() != null && request.getDeadline().isBefore(LocalDate.now())) {
            throw new BadRequestException("Job application deadline cannot be in the past.");
        }

        if (request.getSalaryMin() != null && request.getSalaryMax() != null && request.getSalaryMin() > request.getSalaryMax()) {
            throw new BadRequestException("Minimum salary cannot be greater than maximum salary.");
        }

        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setResponsibilities(request.getResponsibilities());
        job.setRequirements(request.getRequirements());
        job.setCompany(company);
        job.setRecruiter(currentUser);
        job.setLocation(request.getLocation());
        job.setJobType(request.getJobType() != null ? request.getJobType() : JobType.FULL_TIME);
        job.setExperienceLevel(request.getExperienceLevel() != null ? request.getExperienceLevel() : ExperienceLevel.MID);
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setDeadline(request.getDeadline());
        job.setStatus(request.getStatus() != null ? request.getStatus() : JobStatus.ACTIVE);
        job.setSkills(request.getSkills());

        Job saved = jobRepository.save(job);
        return mapToDto(saved, null);
    }

    @Transactional
    public JobResponse updateJob(Long id, JobRequest request) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));

        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != Role.ADMIN && !job.getRecruiter().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You do not have permission to modify this job posting.");
        }

        if (request.getSalaryMin() != null && request.getSalaryMax() != null && request.getSalaryMin() > request.getSalaryMax()) {
            throw new BadRequestException("Minimum salary cannot be greater than maximum salary.");
        }

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setResponsibilities(request.getResponsibilities());
        job.setRequirements(request.getRequirements());
        job.setLocation(request.getLocation());
        if (request.getJobType() != null) job.setJobType(request.getJobType());
        if (request.getExperienceLevel() != null) job.setExperienceLevel(request.getExperienceLevel());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setDeadline(request.getDeadline());
        if (request.getStatus() != null) job.setStatus(request.getStatus());
        job.setSkills(request.getSkills());

        Job updated = jobRepository.save(job);
        return mapToDto(updated, null);
    }

    @Transactional
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));

        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != Role.ADMIN && !job.getRecruiter().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You do not have permission to delete this job posting.");
        }

        jobRepository.delete(job);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getMyJobs() {
        User currentUser = authService.getCurrentUser();
        return jobRepository.findByRecruiterIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(j -> mapToDto(j, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getAllJobsAdmin() {
        return jobRepository.findAll().stream()
                .map(j -> mapToDto(j, null))
                .collect(Collectors.toList());
    }

    private Long getCurrentCandidateUserIdOrNull() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !(auth.getPrincipal() instanceof String)) {
                User user = authService.getCurrentUser();
                if (user.getRole() == Role.CANDIDATE) {
                    return user.getId();
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    public JobResponse mapToDto(Job job, Long currentCandidateId) {
        JobResponse dto = new JobResponse();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setResponsibilities(job.getResponsibilities());
        dto.setRequirements(job.getRequirements());
        dto.setLocation(job.getLocation());
        dto.setJobType(job.getJobType());
        dto.setExperienceLevel(job.getExperienceLevel());
        dto.setSalaryMin(job.getSalaryMin());
        dto.setSalaryMax(job.getSalaryMax());
        dto.setDeadline(job.getDeadline());
        dto.setStatus(job.getStatus());
        dto.setSkills(job.getSkills());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setUpdatedAt(job.getUpdatedAt());

        if (job.getCompany() != null) {
            dto.setCompanyId(job.getCompany().getId());
            dto.setCompanyName(job.getCompany().getName());
            dto.setCompanyLogoUrl(job.getCompany().getLogoUrl());
            dto.setCompanyWebsite(job.getCompany().getWebsite());
        }

        if (job.getRecruiter() != null) {
            dto.setRecruiterId(job.getRecruiter().getId());
            var rp = recruiterProfileRepository.findByUserId(job.getRecruiter().getId());
            dto.setRecruiterName(rp.map(RecruiterProfile::getFullName).orElse(job.getRecruiter().getEmail()));
        }

        dto.setApplicantCount(applicationRepository.findByJobIdOrderByAppliedAtDesc(job.getId()).size());

        if (currentCandidateId != null) {
            dto.setAppliedByCurrentUser(applicationRepository.existsByJobIdAndCandidateId(job.getId(), currentCandidateId));
            dto.setSavedByCurrentUser(savedJobRepository.existsByCandidateIdAndJobId(currentCandidateId, job.getId()));
        }

        return dto;
    }
}
