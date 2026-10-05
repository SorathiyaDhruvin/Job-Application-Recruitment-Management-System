package com.recruitment.repository;

import com.recruitment.entity.ExperienceLevel;
import com.recruitment.entity.Job;
import com.recruitment.entity.JobStatus;
import com.recruitment.entity.JobType;
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

            if (location != null && !location.trim().isEmpty()) {
                String likeLocation = "%" + location.trim().toLowerCase() + "%";
                Predicate locPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), likeLocation);
                Predicate countryPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("country")), likeLocation);
                Predicate statePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("state")), likeLocation);
                Predicate cityPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("city")), likeLocation);
                Predicate workModePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("workMode")), likeLocation);
                
                predicates.add(criteriaBuilder.or(locPredicate, countryPredicate, statePredicate, cityPredicate, workModePredicate));
            }

            if (country != null && !country.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("country")), country.trim().toLowerCase()));
            }

            if (state != null && !state.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("state")), state.trim().toLowerCase()));
            }

            if (city != null && !city.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("city")), city.trim().toLowerCase()));
            }

            if (workMode != null && !workMode.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("workMode"), workMode.trim()));
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
