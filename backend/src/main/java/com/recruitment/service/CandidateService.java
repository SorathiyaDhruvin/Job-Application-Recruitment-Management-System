package com.recruitment.service;

import com.recruitment.dto.CandidateDashboardDto;
import com.recruitment.dto.CandidateProfileDto;
import com.recruitment.dto.JobResponse;
import com.recruitment.dto.CandidateProjectDto;
import com.recruitment.entity.*;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.exception.UnauthorizedException;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.CandidateProfileRepository;
import com.recruitment.repository.CandidateProjectRepository;
import com.recruitment.repository.JobRepository;
import com.recruitment.repository.SavedJobRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CandidateService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateProjectRepository candidateProjectRepository;
    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationService applicationService;
    private final JobService jobService;
    private final AuthService authService;

    public CandidateService(
            CandidateProfileRepository candidateProfileRepository,
            CandidateProjectRepository candidateProjectRepository,
            SavedJobRepository savedJobRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            ApplicationService applicationService,
            JobService jobService,
            AuthService authService
    ) {
        this.candidateProfileRepository = candidateProfileRepository;
        this.candidateProjectRepository = candidateProjectRepository;
        this.savedJobRepository = savedJobRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.applicationService = applicationService;
        this.jobService = jobService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public CandidateProfileDto getProfile() {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != Role.CANDIDATE) {
            throw new UnauthorizedException("User is not a candidate");
        }

        CandidateProfile profile = candidateProfileRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile(currentUser, currentUser.getEmail());
                    return candidateProfileRepository.save(newProfile);
                });

        return mapToDto(profile);
    }

    @Transactional
    public CandidateProfileDto updateProfile(CandidateProfileDto dto) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != Role.CANDIDATE) {
            throw new UnauthorizedException("User is not a candidate");
        }

        CandidateProfile profile = candidateProfileRepository.findByUserId(currentUser.getId())
                .orElseGet(() -> new CandidateProfile(currentUser, currentUser.getEmail()));

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            profile.setFullName(dto.getFullName().trim());
        }
        if (dto.getPhone() != null) profile.setPhone(dto.getPhone());
        if (dto.getLocation() != null) profile.setLocation(dto.getLocation());
        if (dto.getHeadline() != null) profile.setHeadline(dto.getHeadline());
        if (dto.getBio() != null) profile.setBio(dto.getBio());
        if (dto.getSkills() != null) profile.setSkills(dto.getSkills());
        if (dto.getSoftSkills() != null) profile.setSoftSkills(dto.getSoftSkills());
        if (dto.getEducation() != null) profile.setEducation(dto.getEducation());
        if (dto.getCgpa() != null) profile.setCgpa(dto.getCgpa());
        if (dto.getGraduationYear() != null) profile.setGraduationYear(dto.getGraduationYear());
        if (dto.getExperienceYears() != null) profile.setExperienceYears(dto.getExperienceYears());
        if (dto.getWorkExperienceDetails() != null) profile.setWorkExperienceDetails(dto.getWorkExperienceDetails());
        if (dto.getInternships() != null) profile.setInternships(dto.getInternships());
        if (dto.getGithubUrl() != null) profile.setGithubUrl(dto.getGithubUrl());
        if (dto.getLinkedinUrl() != null) profile.setLinkedinUrl(dto.getLinkedinUrl());
        if (dto.getPortfolioUrl() != null) profile.setPortfolioUrl(dto.getPortfolioUrl());
        if (dto.getResumeFileName() != null) profile.setResumeFileName(dto.getResumeFileName());
        if (dto.getResumeOriginalName() != null) profile.setResumeOriginalName(dto.getResumeOriginalName());

        List<CandidateProject> projects = candidateProjectRepository.findByCandidateId(currentUser.getId());
        profile.setProfileCompletionPercentage(calculateCompletionPercentage(profile, projects));

        CandidateProfile updated = candidateProfileRepository.save(profile);
        return mapToDto(updated);
    }

    @Transactional
    public void saveJob(Long jobId) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != Role.CANDIDATE) {
            throw new UnauthorizedException("Only candidates can save jobs.");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        if (!savedJobRepository.existsByCandidateIdAndJobId(currentUser.getId(), job.getId())) {
            SavedJob savedJob = new SavedJob(currentUser, job);
            savedJobRepository.save(savedJob);
        }
    }

    @Transactional
    public void unsaveJob(Long jobId) {
        User currentUser = authService.getCurrentUser();
        savedJobRepository.deleteByCandidateIdAndJobId(currentUser.getId(), jobId);
    }

    @Transactional(readOnly = true)
    public List<JobResponse> getSavedJobs() {
        User currentUser = authService.getCurrentUser();
        return savedJobRepository.findByCandidateIdOrderBySavedAtDesc(currentUser.getId()).stream()
                .map(sj -> jobService.mapToDto(sj.getJob(), currentUser.getId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CandidateDashboardDto getDashboardStats() {
        User currentUser = authService.getCurrentUser();
        Long candidateId = currentUser.getId();

        CandidateDashboardDto dto = new CandidateDashboardDto();
        dto.setTotalApplied(applicationRepository.countByCandidateId(candidateId));
        dto.setUnderReview(applicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.UNDER_REVIEW));
        dto.setShortlisted(applicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.SHORTLISTED));
        dto.setInterview(applicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.INTERVIEW));
        dto.setSelected(applicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.SELECTED));
        dto.setRejected(applicationRepository.countByCandidateIdAndStatus(candidateId, ApplicationStatus.REJECTED));
        dto.setSavedJobsCount(savedJobRepository.findByCandidateIdOrderBySavedAtDesc(candidateId).size());
        dto.setRecentApplications(applicationService.getMyApplications().stream().limit(5).collect(Collectors.toList()));

        return dto;
    }

    public CandidateProfileDto mapToDto(CandidateProfile profile) {
        CandidateProfileDto dto = new CandidateProfileDto();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUser().getId());
        dto.setEmail(profile.getUser().getEmail());
        dto.setFullName(profile.getFullName());
        dto.setPhone(profile.getPhone());
        dto.setLocation(profile.getLocation());
        dto.setHeadline(profile.getHeadline());
        dto.setBio(profile.getBio());
        dto.setSkills(profile.getSkills());
        dto.setSoftSkills(profile.getSoftSkills());
        dto.setEducation(profile.getEducation());
        dto.setCgpa(profile.getCgpa());
        dto.setGraduationYear(profile.getGraduationYear());
        dto.setExperienceYears(profile.getExperienceYears());
        dto.setWorkExperienceDetails(profile.getWorkExperienceDetails());
        dto.setInternships(profile.getInternships());
        dto.setGithubUrl(profile.getGithubUrl());
        dto.setLinkedinUrl(profile.getLinkedinUrl());
        dto.setPortfolioUrl(profile.getPortfolioUrl());
        dto.setResumeFileName(profile.getResumeFileName());
        dto.setResumeOriginalName(profile.getResumeOriginalName());
        dto.setProfileCompletionPercentage(profile.getProfileCompletionPercentage());
        dto.setUpdatedAt(profile.getUpdatedAt());

        List<CandidateProject> projects = candidateProjectRepository.findByCandidateId(profile.getUser().getId());
        dto.setProjects(projects.stream().map(this::mapProjectToDto).collect(Collectors.toList()));
        return dto;
    }

    private CandidateProjectDto mapProjectToDto(CandidateProject project) {
        CandidateProjectDto dto = new CandidateProjectDto();
        dto.setId(project.getId());
        dto.setCandidateId(project.getCandidate().getId());
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setProjectUrl(project.getProjectUrl());
        dto.setGithubUrl(project.getGithubUrl());
        dto.setCreatedAt(project.getCreatedAt());
        return dto;
    }

    private int calculateCompletionPercentage(CandidateProfile profile, List<CandidateProject> projects) {
        int score = 0;
        if (profile.getFullName() != null && !profile.getFullName().isBlank()) score += 10;
        if (profile.getPhone() != null && !profile.getPhone().isBlank()) score += 5;
        if (profile.getLocation() != null && !profile.getLocation().isBlank()) score += 5;
        if (profile.getHeadline() != null && !profile.getHeadline().isBlank()) score += 10;
        if (profile.getBio() != null && !profile.getBio().isBlank()) score += 10;
        if (profile.getSkills() != null && !profile.getSkills().isBlank()) score += 15;
        if (profile.getEducation() != null && !profile.getEducation().isBlank()) score += 10;
        if (profile.getResumeFileName() != null && !profile.getResumeFileName().isBlank()) score += 20;
        if (projects != null && !projects.isEmpty()) score += 15;
        return Math.min(score, 100);
    }

    @Transactional
    public CandidateProjectDto addProject(CandidateProjectDto dto) {
        User currentUser = authService.getCurrentUser();
        CandidateProject project = new CandidateProject();
        project.setCandidate(currentUser);
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setProjectUrl(dto.getProjectUrl());
        project.setGithubUrl(dto.getGithubUrl());
        
        CandidateProject saved = candidateProjectRepository.save(project);
        
        // Update completion percentage
        CandidateProfile profile = candidateProfileRepository.findByUserId(currentUser.getId()).orElse(null);
        if (profile != null) {
            List<CandidateProject> projects = candidateProjectRepository.findByCandidateId(currentUser.getId());
            profile.setProfileCompletionPercentage(calculateCompletionPercentage(profile, projects));
            candidateProfileRepository.save(profile);
        }
        
        return mapProjectToDto(saved);
    }

    @Transactional
    public void deleteProject(Long projectId) {
        User currentUser = authService.getCurrentUser();
        CandidateProject project = candidateProjectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
                
        if (!project.getCandidate().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Not authorized to delete this project");
        }
        
        candidateProjectRepository.delete(project);
        
        // Update completion percentage
        CandidateProfile profile = candidateProfileRepository.findByUserId(currentUser.getId()).orElse(null);
        if (profile != null) {
            List<CandidateProject> projects = candidateProjectRepository.findByCandidateId(currentUser.getId());
            profile.setProfileCompletionPercentage(calculateCompletionPercentage(profile, projects));
            candidateProfileRepository.save(profile);
        }
    }
}
