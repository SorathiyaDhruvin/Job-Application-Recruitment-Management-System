package com.recruitment.repository;

import com.recruitment.entity.Application;
import com.recruitment.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByCandidateIdOrderByAppliedAtDesc(Long candidateId);

    List<Application> findByJobIdOrderByAppliedAtDesc(Long jobId);

    List<Application> findByJobRecruiterIdOrderByAppliedAtDesc(Long recruiterId);

    Optional<Application> findByJobIdAndCandidateId(Long jobId, Long candidateId);

    boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);

    long countByCandidateId(Long candidateId);

    long countByCandidateIdAndStatus(Long candidateId, ApplicationStatus status);

    long countByJobRecruiterId(Long recruiterId);

    long countByJobRecruiterIdAndStatus(Long recruiterId, ApplicationStatus status);

    long countByStatus(ApplicationStatus status);
}
