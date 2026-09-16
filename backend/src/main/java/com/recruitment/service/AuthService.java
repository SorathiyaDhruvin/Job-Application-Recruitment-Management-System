package com.recruitment.service;

import com.recruitment.dto.AuthResponse;
import com.recruitment.dto.LoginRequest;
import com.recruitment.dto.RegisterRequest;
import com.recruitment.dto.UserDto;
import com.recruitment.entity.*;
import com.recruitment.exception.BadRequestException;
import com.recruitment.exception.DuplicateResourceException;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.repository.CandidateProfileRepository;
import com.recruitment.repository.CompanyRepository;
import com.recruitment.repository.RecruiterProfileRepository;
import com.recruitment.repository.UserRepository;
import com.recruitment.security.CustomUserDetails;
import com.recruitment.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            CandidateProfileRepository candidateProfileRepository,
            RecruiterProfileRepository recruiterProfileRepository,
            CompanyRepository companyRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with email " + request.getEmail() + " already exists.");
        }

        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Admin accounts cannot be registered via public endpoint.");
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setActive(true);
        User savedUser = userRepository.save(user);

        String fullName = request.getFullName().trim();
        Long companyId = null;
        String companyName = null;

        if (request.getRole() == Role.CANDIDATE) {
            CandidateProfile profile = new CandidateProfile();
            profile.setUser(savedUser);
            profile.setFullName(fullName);
            profile.setPhone(request.getPhone());
            candidateProfileRepository.save(profile);
        } else if (request.getRole() == Role.RECRUITER) {
            Company company;
            String compName = request.getCompanyName() != null && !request.getCompanyName().isBlank()
                    ? request.getCompanyName().trim()
                    : fullName + "'s Company";

            company = companyRepository.findByNameIgnoreCase(compName)
                    .orElseGet(() -> {
                        Company newComp = new Company();
                        newComp.setName(compName);
                        newComp.setDescription("Innovative tech company hiring top talent.");
                        newComp.setLocation("Remote / Hybrid");
                        newComp.setVerified(true);
                        return companyRepository.save(newComp);
                    });

            companyId = company.getId();
            companyName = company.getName();

            RecruiterProfile profile = new RecruiterProfile();
            profile.setUser(savedUser);
            profile.setFullName(fullName);
            profile.setPhone(request.getPhone());
            profile.setDesignation(request.getDesignation() != null ? request.getDesignation() : "Talent Acquisition Specialist");
            profile.setCompany(company);
            recruiterProfileRepository.save(profile);
        }

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtService.generateToken(userDetails, savedUser.getId(), savedUser.getRole().name(), fullName);

        AuthResponse response = new AuthResponse(token, savedUser.getId(), savedUser.getEmail(), fullName, savedUser.getRole());
        response.setCompanyId(companyId);
        response.setCompanyName(companyName);
        return response;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isActive()) {
            throw new BadRequestException("Your account has been deactivated. Please contact support.");
        }

        String fullName = user.getEmail();
        Long companyId = null;
        String companyName = null;

        if (user.getRole() == Role.CANDIDATE) {
            var profileOpt = candidateProfileRepository.findByUserId(user.getId());
            if (profileOpt.isPresent() && profileOpt.get().getFullName() != null) {
                fullName = profileOpt.get().getFullName();
            }
        } else if (user.getRole() == Role.RECRUITER) {
            var profileOpt = recruiterProfileRepository.findByUserId(user.getId());
            if (profileOpt.isPresent()) {
                RecruiterProfile rp = profileOpt.get();
                if (rp.getFullName() != null) {
                    fullName = rp.getFullName();
                }
                if (rp.getCompany() != null) {
                    companyId = rp.getCompany().getId();
                    companyName = rp.getCompany().getName();
                }
            }
        } else if (user.getRole() == Role.ADMIN) {
            fullName = "Platform Administrator";
        }

        String token = jwtService.generateToken(userDetails, user.getId(), user.getRole().name(), fullName);

        AuthResponse response = new AuthResponse(token, user.getId(), user.getEmail(), fullName, user.getRole());
        response.setCompanyId(companyId);
        response.setCompanyName(companyName);
        return response;
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUserDto() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() instanceof String) {
            throw new ResourceNotFoundException("Not authenticated");
        }

        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String fullName = user.getEmail();
        if (user.getRole() == Role.CANDIDATE) {
            fullName = candidateProfileRepository.findByUserId(user.getId())
                    .map(CandidateProfile::getFullName).orElse(user.getEmail());
        } else if (user.getRole() == Role.RECRUITER) {
            fullName = recruiterProfileRepository.findByUserId(user.getId())
                    .map(RecruiterProfile::getFullName).orElse(user.getEmail());
        } else if (user.getRole() == Role.ADMIN) {
            fullName = "Platform Administrator";
        }

        return new UserDto(user.getId(), user.getEmail(), fullName, user.getRole(), user.isActive(), user.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() instanceof String) {
            throw new ResourceNotFoundException("Not authenticated");
        }
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));
    }
}
