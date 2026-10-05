package com.recruitment.repository;

import com.recruitment.entity.CandidateProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateProjectRepository extends JpaRepository<CandidateProject, Long> {
    List<CandidateProject> findByCandidateId(Long candidateId);
}
