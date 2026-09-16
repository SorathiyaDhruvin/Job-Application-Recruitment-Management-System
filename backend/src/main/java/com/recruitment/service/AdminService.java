package com.recruitment.service;

import com.recruitment.dto.AdminStatsDto;
import com.recruitment.dto.CompanyDto;
import com.recruitment.dto.JobResponse;
import com.recruitment.dto.UserDto;
import com.recruitment.entity.*;
import com.recruitment.exception.BadRequestException;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final JobService jobService;
    private final CompanyService companyService;
    private final AuthService authService;

    public AdminService(
            UserRepository userRepository,
            CandidateProfileRepository candidateProfileRepository,
            RecruiterProfileRepository recruiterProfileRepository,
            CompanyRepository companyRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            JobService jobService,
            CompanyService companyService,
            AuthService authService
    ) {
        this.userRepository = userRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.jobService = jobService;
        this.companyService = companyService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public AdminStatsDto getAdminStats() {
        AdminStatsDto stats = new AdminStatsDto();
        stats.setTotalUsers(userRepository.count());
        stats.setTotalCandidates(userRepository.countByRole(Role.CANDIDATE));
        stats.setTotalRecruiters(userRepository.countByRole(Role.RECRUITER));
        stats.setTotalCompanies(companyRepository.count());
        stats.setTotalJobs(jobRepository.count());
        stats.setActiveJobs(jobRepository.countByStatus(JobStatus.ACTIVE));
        stats.setTotalApplications(applicationRepository.count());
        stats.setShortlistedApplications(applicationRepository.countByStatus(ApplicationStatus.SHORTLISTED));
        stats.setSelectedApplications(applicationRepository.countByStatus(ApplicationStatus.SELECTED));

        stats.setRecentUsers(getAllUsers().stream().limit(6).collect(Collectors.toList()));
        stats.setRecentJobs(jobService.getAllJobsAdmin().stream().limit(6).collect(Collectors.toList()));

        return stats;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            String name = u.getEmail();
            if (u.getRole() == Role.CANDIDATE) {
                name = candidateProfileRepository.findByUserId(u.getId()).map(CandidateProfile::getFullName).orElse(u.getEmail());
            } else if (u.getRole() == Role.RECRUITER) {
                name = recruiterProfileRepository.findByUserId(u.getId()).map(RecruiterProfile::getFullName).orElse(u.getEmail());
            } else {
                name = "Administrator";
            }
            return new UserDto(u.getId(), u.getEmail(), name, u.getRole(), u.isActive(), u.getCreatedAt());
        }).collect(Collectors.toList());
    }

    @Transactional
    public UserDto toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        User currentUser = authService.getCurrentUser();
        if (user.getId().equals(currentUser.getId())) {
            throw new BadRequestException("You cannot deactivate your own admin account.");
        }

        user.setActive(!user.isActive());
        User saved = userRepository.save(user);

        return new UserDto(saved.getId(), saved.getEmail(), saved.getEmail(), saved.getRole(), saved.isActive(), saved.getCreatedAt());
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        User currentUser = authService.getCurrentUser();
        if (user.getId().equals(currentUser.getId())) {
            throw new BadRequestException("You cannot delete your own admin account.");
        }

        userRepository.delete(user);
    }

    @Transactional
    public JobResponse updateJobStatus(Long jobId, JobStatus status) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        job.setStatus(status);
        Job saved = jobRepository.save(job);
        return jobService.mapToDto(saved, null);
    }

    @Transactional
    public CompanyDto toggleCompanyVerification(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        company.setVerified(!company.isVerified());
        Company saved = companyRepository.save(company);
        return companyService.mapToDto(saved);
    }
}
