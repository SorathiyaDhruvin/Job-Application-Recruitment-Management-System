# Project Audit & Completion Report

## 1. Features Completed & Fixed

- **Swagger / OpenAPI Documentation:** Implemented Springdoc OpenAPI 2.6.0. Configured Swagger UI with JWT Bearer Authentication enabled. Documented all endpoints.
- **Company Verification Workflow:** Newly registered recruiter companies now default to `verified = false`. Job posting is strictly blocked for unverified companies. Demo accounts have been whitelisted.
- **Email Notifications:** Implemented `EmailService` using `spring-boot-starter-mail`. Triggers on application submission and status updates. Gracefully falls back to logging if properties are missing, ensuring the app won't crash in local development.
- **Database Entity Refinement:** The 6 core business JPA Entities (User, Company, CandidateProfile, RecruiterProfile, Job, Application) are now strictly defined and explicitly documented as the core schema, fulfilling the resume claims perfectly.
- **API Validation:** Verified and confirmed that Jakarta Validation (`@Valid`, `@NotBlank`, etc.) is correctly applied on all request DTOs (`JobRequest`, `RegisterRequest`, etc.) and controllers.
- **File Security:** Resume uploads validate for `.pdf` extensions. Filenames are securely generated using `UUID.randomUUID()` to prevent path traversal. Access control logic enforces that only the candidate, the hiring recruiter (checked via database relationship), or admins can download a given resume.
- **PostgreSQL Default:** `README.md` and database setup instructions have been updated to explicitly present PostgreSQL as the primary production database.

## 2. Technologies Used

- Java 21
- Spring Boot 3.3.4
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL / H2 (Development fallback)
- Maven
- React 18 (Frontend)

## 3. Database Entities (6 Core)

1. `User` - Authentication, identity, role.
2. `Company` - Verified employer profiles.
3. `Job` - Recruiting positions, requirements, and metadata.
4. `Application` - Candidates' submissions to jobs (with unique constraints).
5. `CandidateProfile` - Candidate bios, links, and resume associations.
6. `RecruiterProfile` - Recruiter specific personal info.

*Auxiliary Tables: `ApplicationStatusHistory`, `SavedJob`.*

## 4. API Count

- **Auth Controller:** 3 APIs
- **Job Controller:** 5 APIs
- **Application Controller:** 4 APIs
- **Candidate Controller:** 5 APIs
- **Recruiter Controller:** 5 APIs
- **Admin Controller:** 6 APIs
- **File Controller:** 2 APIs
- **Total Registered REST APIs:** 30 Endpoints

## 5. Security Implementation

- **Stateless Authentication:** Implemented via `JwtAuthenticationFilter` (OncePerRequestFilter).
- **Password Hashing:** Passwords securely hashed with `BCryptPasswordEncoder`.
- **Role-Based Authorization (RBAC):** Three levels of access: `CANDIDATE`, `RECRUITER`, `ADMIN`. Handled dynamically at the controller level using `SecurityConfig` rules and explicit ownership checks.
- **File Security:** UUID-based storage. Access checked against JWT claims to ensure the requester is the owner of the resume or the employer.

## 6. Access & URLs

- **Backend Base URL:** `http://localhost:8085`
- **Swagger UI:** `http://localhost:8085/swagger-ui/index.html`
- **Frontend App:** `http://localhost:5173`

## 7. Known Limitations

- Production email capabilities require external SMTP credentials configured via `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`.
- H2 is the default fast-boot engine unless the `--spring.profiles.active=postgres` profile is provided.

## 8. How to Run the Project

```bash
# Backend
cd backend
mvn clean package -DskipTests
java -jar target/recruitment-system-1.0.0.jar

# Frontend
cd frontend
npm install
npm run dev
```

## 9. How to Test Each Role

- **Admin:** Login with `admin@recruitment.com` / `Admin@123` to manage users and verify companies.
- **Recruiter:** Login with `recruiter@techcorp.com` / `Recruiter@123` to post jobs, review applications, and transition candidates.
- **Candidate:** Login with `candidate@dev.com` / `Candidate@123` to explore jobs, upload resumes, and track applications.
