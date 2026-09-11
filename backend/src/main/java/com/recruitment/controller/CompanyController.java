package com.recruitment.controller;

import com.recruitment.dto.ApiResponse;
import com.recruitment.dto.CompanyDto;
import com.recruitment.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CompanyDto>>> getAllCompanies() {
        List<CompanyDto> companies = companyService.getAllCompanies();
        return ResponseEntity.ok(ApiResponse.ok("Companies retrieved successfully", companies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyDto>> getCompanyById(@PathVariable Long id) {
        CompanyDto company = companyService.getCompanyById(id);
        return ResponseEntity.ok(ApiResponse.ok("Company details retrieved", company));
    }
}
