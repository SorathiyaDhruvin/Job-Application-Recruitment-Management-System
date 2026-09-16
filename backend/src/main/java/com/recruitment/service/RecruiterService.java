package com.recruitment.service;

import com.recruitment.dto.CompanyDto;
import com.recruitment.dto.RecruiterDashboardDto;
import com.recruitment.dto.RecruiterProfileDto;
import com.recruitment.entity.*;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.exception.UnauthorizedException;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.CompanyRepository;
import com.recruitment.repository.JobRepository;
import com.recruitment.repository.RecruiterProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class RecruiterService {

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationService applicationService;
    private final JobService jobService;
    private final CompanyService companyService;
    private final AuthService authService;

    public RecruiterService(
            RecruiterProfileRepository recruiterProfileRepository,
            CompanyRepository companyRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            ApplicationService applicationService,
            JobService jobService,
            CompanyService companyService,
            AuthService authService
    ) {
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.applicationService = applicationService;
        this.jobService = jobService;
        this.companyService = companyService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public RecruiterProfileDto getProfile() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != Role.RECRUITER && currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("User is not a recruiter");
        }

        RecruiterProfile profile = recruiterProfileRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> {
                    RecruiterProfile rp = new RecruiterProfile(currentUser, currentUser.getEmail(), null, "Talent Recruiter");
                    return recruiterProfileRepository.save(rp);
                });

        return mapToDto(profile);
    }

    @Transactional
    public RecruiterProfileDto updateProfile(RecruiterProfileDto dto) {
        User currentUser = authService.getCurrentUser();
        RecruiterProfile profile = recruiterProfileRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> new RecruiterProfile(currentUser, currentUser.getEmail(), null, "Talent Recruiter"));

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            profile.setFullName(dto.getFullName().trim());
        }
        if (dto.getPhone() != null) profile.setPhone(dto.getPhone());
        if (dto.getDesignation() != null) profile.setDesignation(dto.getDesignation());

        if (dto.getCompanyId() != null) {
            Company comp = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + dto.getCompanyId()));
            profile.setCompany(comp);
        }

        RecruiterProfile updated = recruiterProfileRepository.save(profile);
        return mapToDto(updated);
    }

    @Transactional
    public CompanyDto updateMyCompany(CompanyDto dto) {
        User currentUser = authService.getCurrentUser();
        RecruiterProfile profile = recruiterProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));

        Company company = profile.getCompany();
        if (company == null) {
            company = new Company();
            company.setName(dto.getName() != null ? dto.getName() : "My Company");
            company.setDescription(dto.getDescription());
            company.setWebsite(dto.getWebsite());
            company.setLocation(dto.getLocation());
            company.setLogoUrl(dto.getLogoUrl());
            company.setVerified(true);
            company = companyRepository.save(company);
            profile.setCompany(company);
            recruiterProfileRepository.save(profile);
        } else {
            company = companyRepository.save(company);
            return companyService.updateCompany(company.getId(), dto);
        }

        return companyService.mapToDto(company);
    }

    @Transactional(readOnly = true)
    public RecruiterDashboardDto getDashboardStats() {
        User currentUser = authService.getCurrentUser();
        Long recruiterId = currentUser.getId();

        RecruiterDashboardDto dto = new RecruiterDashboardDto();
        dto.setTotalJobs(jobRepository.countByRecruiterId(recruiterId));
        dto.setActiveJobs(jobRepository.countByRecruiterIdAndStatus(recruiterId, JobStatus.ACTIVE));
        dto.setTotalApplicants(applicationRepository.countByJobRecruiterId(recruiterId));
        dto.setUnderReview(applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.UNDER_REVIEW));
        dto.setShortlisted(applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.SHORTLISTED));
        dto.setInterview(applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.INTERVIEW));
        dto.setSelected(applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.SELECTED));
        dto.setRejected(applicationRepository.countByJobRecruiterIdAndStatus(recruiterId, ApplicationStatus.REJECTED));

        dto.setRecentApplications(applicationService.getAllApplicationsForRecruiter().stream().limit(6).collect(Collectors.toList()));
        dto.setRecentJobs(jobService.getMyJobs().stream().limit(4).collect(Collectors.toList()));

        return dto;
    }

    public RecruiterProfileDto mapToDto(RecruiterProfile profile) {
        RecruiterProfileDto dto = new RecruiterProfileDto();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUser().getId());
        dto.setEmail(profile.getUser().getEmail());
        dto.setFullName(profile.getFullName());
        dto.setPhone(profile.getPhone());
        dto.setDesignation(profile.getDesignation());
        if (profile.getCompany() != null) {
            dto.setCompanyId(profile.getCompany().getId());
            dto.setCompanyName(profile.getCompany().getName());
            dto.setCompanyLogoUrl(profile.getCompany().getLogoUrl());
        }
        return dto;
    }
}
