package com.recruitment.repository;

import com.recruitment.entity.ExperienceLevel;
import com.recruitment.entity.Job;
import com.recruitment.entity.JobStatus;
import com.recruitment.entity.JobType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByRecruiterIdOrderByCreatedAtDesc(Long recruiterId);

    List<Job> findByStatusOrderByCreatedAtDesc(JobStatus status);

    long countByStatus(JobStatus status);

    long countByRecruiterId(Long recruiterId);

    long countByRecruiterIdAndStatus(Long recruiterId, JobStatus status);

    @Query("SELECT DISTINCT j FROM Job j LEFT JOIN j.company c LEFT JOIN j.recruiter r WHERE " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR (c.name IS NOT NULL AND LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR (j.skills IS NOT NULL AND LOWER(j.skills) LIKE LOWER(CONCAT('%', :keyword, '%')))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:jobType IS NULL OR j.jobType = :jobType) AND " +
           "(:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel) " +
           "ORDER BY j.createdAt DESC")
    List<Job> searchJobs(
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("jobType") JobType jobType,
            @Param("experienceLevel") ExperienceLevel experienceLevel,
            @Param("status") JobStatus status
    );
}
