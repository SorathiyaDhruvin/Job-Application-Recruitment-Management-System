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
import java.util.ArrayList;
import java.util.Comparator;
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
            String country,
            String state,
            String city,
            String workMode,
            JobType jobType,
            ExperienceLevel experienceLevel,
            Boolean salaryDisclosed,
            JobStatus status,
            String sortBy
    ) {
        JobStatus effectiveStatus = status != null ? status : JobStatus.ACTIVE;
        
        org.springframework.data.jpa.domain.Specification<Job> spec = JobSpecification.filterJobs(
            keyword, location, country, state, city, workMode, jobType, experienceLevel, salaryDisclosed, effectiveStatus
        );

        // Default sort by newest
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt");
        
        // For salary sorts, we need to handle nulls properly, so we use in-memory sorting after fetch
        boolean salarySort = false;
        boolean salaryDesc = false;

        if (sortBy != null) {
            switch (sortBy.toLowerCase()) {
                case "deadline":
                    sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "deadline");
                    break;
                case "salary_desc":
                    salarySort = true;
                    salaryDesc = true;
                    break;
                case "salary_asc":
                    salarySort = true;
                    salaryDesc = false;
                    break;
                default:
                    sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt");
                    break;
            }
        }

        List<Job> jobs = jobRepository.findAll(spec, sort);

        // Handle salary sorting with proper null handling:
        // Jobs with undisclosed/null salary go to the bottom, never treated as zero.
        if (salarySort) {
            final boolean descending = salaryDesc;
            jobs = new ArrayList<>(jobs);
            jobs.sort((a, b) -> {
                Double aVal = descending ? a.getSalaryMax() : a.getSalaryMin();
                Double bVal = descending ? b.getSalaryMax() : b.getSalaryMin();
                boolean aNull = (aVal == null || Boolean.FALSE.equals(a.getSalaryDisclosed()));
                boolean bNull = (bVal == null || Boolean.FALSE.equals(b.getSalaryDisclosed()));

                if (aNull && bNull) return 0;
                if (aNull) return 1;  // nulls go last
                if (bNull) return -1;

                return descending ? Double.compare(bVal, aVal) : Double.compare(aVal, bVal);
            });
        }

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
        
        // Structured location fields
        job.setCountry(request.getCountry());
        job.setState(request.getState());
        job.setCity(request.getCity());
        job.setWorkMode(request.getWorkMode());
        
        // Auto-build the flat location string from structured fields
        job.setLocation(buildLocationString(request.getCity(), request.getState(), request.getCountry(), request.getWorkMode()));

        job.setJobType(request.getJobType() != null ? request.getJobType() : JobType.FULL_TIME);
        job.setExperienceLevel(request.getExperienceLevel() != null ? request.getExperienceLevel() : ExperienceLevel.MID);
        
        // Salary — set exactly what was provided, never generate
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setSalaryCurrency(request.getSalaryCurrency());
        job.setSalaryText(request.getSalaryText());
        job.setSalaryDisclosed(request.getSalaryDisclosed() != null ? request.getSalaryDisclosed() : false);
        
        job.setDeadline(request.getDeadline());
        job.setStatus(request.getStatus() != null ? request.getStatus() : JobStatus.ACTIVE);
        job.setSkills(request.getSkills());

        // Source metadata
        job.setSourceUrl(request.getSourceUrl());
        job.setSourceName(request.getSourceName());
        job.setSourceType(request.getSourceType());

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
        
        // Update structured location
        if (request.getCountry() != null) job.setCountry(request.getCountry());
        if (request.getState() != null) job.setState(request.getState());
        if (request.getCity() != null) job.setCity(request.getCity());
        if (request.getWorkMode() != null) job.setWorkMode(request.getWorkMode());
        
        // Re-compute flat location from structured fields
        job.setLocation(buildLocationString(
            job.getCity(), job.getState(), job.getCountry(), job.getWorkMode()
        ));

        if (request.getJobType() != null) job.setJobType(request.getJobType());
        if (request.getExperienceLevel() != null) job.setExperienceLevel(request.getExperienceLevel());
        
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setSalaryCurrency(request.getSalaryCurrency());
        job.setSalaryText(request.getSalaryText());
        if (request.getSalaryDisclosed() != null) job.setSalaryDisclosed(request.getSalaryDisclosed());
        
        job.setDeadline(request.getDeadline());
        if (request.getStatus() != null) job.setStatus(request.getStatus());
        job.setSkills(request.getSkills());

        // Source metadata
        if (request.getSourceUrl() != null) job.setSourceUrl(request.getSourceUrl());
        if (request.getSourceName() != null) job.setSourceName(request.getSourceName());
        if (request.getSourceType() != null) job.setSourceType(request.getSourceType());

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

    // ========================
    // Helper: Build Location String
    // ========================

    /**
     * Auto-builds the flat location string from structured city/state/country fields.
     * For REMOTE jobs: returns "Remote".
     * For others: "City, State, Country" (omitting empty parts).
     * This is stored in the `location` column for backward compatibility and full-text search.
     */
    private String buildLocationString(String city, String state, String country, WorkMode workMode) {
        if (workMode == WorkMode.REMOTE) {
            return "Remote";
        }

        List<String> parts = new ArrayList<>();
        if (city != null && !city.trim().isEmpty()) parts.add(city.trim());
        if (state != null && !state.trim().isEmpty()) parts.add(state.trim());
        if (country != null && !country.trim().isEmpty()) parts.add(country.trim());
        
        return parts.isEmpty() ? "Location not specified" : String.join(", ", parts);
    }

    // ========================
    // Helper: Format Salary Display
    // ========================

    /**
     * Formats salary for display based on REAL data from the job source.
     * NEVER generates, estimates, or calculates salary.
     */
    private String formatSalaryDisplay(Job job) {
        if (Boolean.FALSE.equals(job.getSalaryDisclosed()) || job.getSalaryDisclosed() == null) {
            return "Salary not disclosed";
        }
        if (job.getSalaryText() != null && !job.getSalaryText().trim().isEmpty()) {
            return job.getSalaryText();
        }
        String curr = job.getSalaryCurrency() != null ? job.getSalaryCurrency() : "";
        // Map common currency codes to symbols
        String symbol = mapCurrencySymbol(curr);

        if (job.getSalaryMin() != null && job.getSalaryMax() != null) {
            return symbol + formatNumber(job.getSalaryMin()) + " - " + symbol + formatNumber(job.getSalaryMax());
        }
        if (job.getSalaryMin() != null) {
            return "From " + symbol + formatNumber(job.getSalaryMin());
        }
        if (job.getSalaryMax() != null) {
            return "Up to " + symbol + formatNumber(job.getSalaryMax());
        }
        return "Salary not disclosed";
    }

    private String mapCurrencySymbol(String currencyCode) {
        if (currencyCode == null || currencyCode.isEmpty()) return "";
        switch (currencyCode.toUpperCase()) {
            case "USD": return "$";
            case "INR": return "₹";
            case "GBP": return "£";
            case "EUR": return "€";
            case "JPY": return "¥";
            case "CAD": return "CA$";
            case "AUD": return "A$";
            default: return currencyCode + " ";
        }
    }

    private String formatNumber(Double value) {
        if (value == null) return "0";
        if (value >= 1_00_000) {
            return String.format("%,.0f", value);
        }
        return String.format("%,.0f", value);
    }

    // ========================
    // Helper: Format Location Display
    // ========================

    private String formatLocationDisplay(Job job) {
        if (job.getWorkMode() == WorkMode.REMOTE) {
            return "Work From Home / Remote";
        }

        List<String> parts = new ArrayList<>();
        if (job.getCity() != null && !job.getCity().trim().isEmpty()) parts.add(job.getCity().trim());
        if (job.getState() != null && !job.getState().trim().isEmpty()) parts.add(job.getState().trim());
        if (job.getCountry() != null && !job.getCountry().trim().isEmpty()) parts.add(job.getCountry().trim());

        if (!parts.isEmpty()) {
            return String.join(", ", parts);
        }

        // Fallback to raw location field
        if (job.getLocation() != null && !job.getLocation().trim().isEmpty()) {
            return job.getLocation();
        }

        return "Location not specified";
    }

    private String getWorkModeDisplayText(WorkMode workMode) {
        if (workMode == null) return null;
        switch (workMode) {
            case REMOTE: return "Work From Home";
            case HYBRID: return "Hybrid";
            case ONSITE: return "In Office";
            default: return workMode.name();
        }
    }

    // ========================
    // Helper: Auth
    // ========================

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

    // ========================
    // DTO Mapper
    // ========================

    public JobResponse mapToDto(Job job, Long currentCandidateId) {
        JobResponse dto = new JobResponse();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setResponsibilities(job.getResponsibilities());
        dto.setRequirements(job.getRequirements());
        
        // Structured location fields
        dto.setLocation(job.getLocation());
        dto.setCountry(job.getCountry());
        dto.setState(job.getState());
        dto.setCity(job.getCity());
        dto.setWorkMode(job.getWorkMode());
        
        // Computed display fields — these are derived server-side for consistent display
        dto.setFormattedLocation(formatLocationDisplay(job));
        dto.setFormattedSalary(formatSalaryDisplay(job));
        dto.setWorkModeDisplay(getWorkModeDisplayText(job.getWorkMode()));

        dto.setJobType(job.getJobType());
        dto.setExperienceLevel(job.getExperienceLevel());
        
        // Raw salary fields (for client-side formatting if needed)
        dto.setSalaryMin(job.getSalaryMin());
        dto.setSalaryMax(job.getSalaryMax());
        dto.setSalaryCurrency(job.getSalaryCurrency());
        dto.setSalaryText(job.getSalaryText());
        dto.setSalaryDisclosed(job.getSalaryDisclosed());
        
        // Source metadata
        dto.setSourceUrl(job.getSourceUrl());
        dto.setSourceName(job.getSourceName());
        dto.setSourceType(job.getSourceType());
        dto.setSourcePublishedAt(job.getSourcePublishedAt());
        dto.setLastVerifiedAt(job.getLastVerifiedAt());
        
        dto.setDeadline(job.getDeadline());
        dto.setStatus(job.getStatus());
        dto.setSkills(job.getSkills());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setUpdatedAt(job.getUpdatedAt());

        // Company details (from the actual company entity — never generated)
        if (job.getCompany() != null) {
            dto.setCompanyId(job.getCompany().getId());
            dto.setCompanyName(job.getCompany().getName());
            dto.setCompanyLogoUrl(job.getCompany().getLogoUrl());
            dto.setCompanyWebsite(job.getCompany().getWebsite());
            dto.setCompanyIndustry(job.getCompany().getIndustry());
            dto.setCompanyHeadquarters(job.getCompany().getHeadquarters());
            dto.setCompanySize(job.getCompany().getCompanySize());
            dto.setCompanyDomain(job.getCompany().getDomain());
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
