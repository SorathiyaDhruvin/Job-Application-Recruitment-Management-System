package com.recruitment.service;

import com.recruitment.dto.CompanyDto;
import com.recruitment.entity.Company;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Transactional(readOnly = true)
    public List<CompanyDto> getAllCompanies() {
        return companyRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyDto getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        return mapToDto(company);
    }

    @Transactional
    public CompanyDto updateCompany(Long id, CompanyDto dto) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            company.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            company.setDescription(dto.getDescription());
        }
        if (dto.getWebsite() != null) {
            company.setWebsite(dto.getWebsite());
        }
        if (dto.getLocation() != null) {
            company.setLocation(dto.getLocation());
        }
        if (dto.getLogoUrl() != null) {
            company.setLogoUrl(dto.getLogoUrl());
        }

        Company updated = companyRepository.save(company);
        return mapToDto(updated);
    }

    public CompanyDto mapToDto(Company company) {
        CompanyDto dto = new CompanyDto();
        dto.setId(company.getId());
        dto.setName(company.getName());
        dto.setDescription(company.getDescription());
        dto.setWebsite(company.getWebsite());
        dto.setLocation(company.getLocation());
        dto.setLogoUrl(company.getLogoUrl());
        dto.setVerified(company.isVerified());
        dto.setCreatedAt(company.getCreatedAt());
        return dto;
    }
}
