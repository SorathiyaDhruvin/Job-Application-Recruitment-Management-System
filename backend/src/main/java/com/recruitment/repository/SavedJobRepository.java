package com.recruitment.repository;

import com.recruitment.entity.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    List<SavedJob> findByCandidateIdOrderBySavedAtDesc(Long candidateId);
    Optional<SavedJob> findByCandidateIdAndJobId(Long candidateId, Long jobId);
    boolean existsByCandidateIdAndJobId(Long candidateId, Long jobId);
    void deleteByCandidateIdAndJobId(Long candidateId, Long jobId);
}
