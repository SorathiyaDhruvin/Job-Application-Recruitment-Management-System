package com.recruitment.repository;

import com.recruitment.entity.ExperienceLevel;
import com.recruitment.entity.Job;
import com.recruitment.entity.JobStatus;
import com.recruitment.entity.JobType;
import com.recruitment.entity.WorkMode;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class JobSpecification {

    public static Specification<Job> filterJobs(
            String keyword,
            String location,
            String country,
            String state,
            String city,
            String workMode,
            JobType jobType,
            ExperienceLevel experienceLevel,
            Boolean salaryDisclosed,
            JobStatus status
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Status is always required in normal searches to avoid showing CLOSED or DRAFT jobs
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            } else {
                predicates.add(criteriaBuilder.equal(root.get("status"), JobStatus.ACTIVE));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                String likeKeyword = "%" + keyword.trim().toLowerCase() + "%";
                Predicate titlePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likeKeyword);
                Predicate descPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likeKeyword);
                Predicate skillsPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("skills")), likeKeyword);
                
                // Company is a nested entity
                Predicate companyNamePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("company").get("name")), likeKeyword);
                
                predicates.add(criteriaBuilder.or(titlePredicate, descPredicate, skillsPredicate, companyNamePredicate));
            }

            // General location search — matches across all structured fields plus workMode for "remote"
            if (location != null && !location.trim().isEmpty()) {
                String likeLocation = "%" + location.trim().toLowerCase() + "%";
                String trimmedLocation = location.trim().toLowerCase();

                List<Predicate> locationPredicates = new ArrayList<>();
                locationPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), likeLocation));
                locationPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("country")), likeLocation));
                locationPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("state")), likeLocation));
                locationPredicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("city")), likeLocation));

                // Allow "remote", "work from home", "wfh" to match REMOTE work mode
                if (trimmedLocation.contains("remote") || trimmedLocation.contains("work from home") || trimmedLocation.contains("wfh")) {
                    locationPredicates.add(criteriaBuilder.equal(root.get("workMode"), WorkMode.REMOTE));
                }

                predicates.add(criteriaBuilder.or(locationPredicates.toArray(new Predicate[0])));
            }

            // Structured location filters (exact match)
            if (country != null && !country.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("country")), country.trim().toLowerCase()));
            }

            if (state != null && !state.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("state")), state.trim().toLowerCase()));
            }

            if (city != null && !city.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("city")), city.trim().toLowerCase()));
            }

            // Work mode filter (uses enum)
            if (workMode != null && !workMode.trim().isEmpty()) {
                try {
                    WorkMode mode = WorkMode.valueOf(workMode.trim().toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("workMode"), mode));
                } catch (IllegalArgumentException ignored) {
                    // Invalid work mode value, skip filter
                }
            }

            if (jobType != null) {
                predicates.add(criteriaBuilder.equal(root.get("jobType"), jobType));
            }

            if (experienceLevel != null) {
                predicates.add(criteriaBuilder.equal(root.get("experienceLevel"), experienceLevel));
            }
            
            if (salaryDisclosed != null) {
                predicates.add(criteriaBuilder.equal(root.get("salaryDisclosed"), salaryDisclosed));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
