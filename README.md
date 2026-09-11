# RecruitPro — Job Application & Recruitment Management System

[![Java](https://img.shields.io/badge/Java-21%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring_Security-JWT-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

> A full-stack, enterprise-grade recruitment and talent acquisition management platform engineered with **Java 21, Spring Boot 3, Spring Security (JWT), Spring Data JPA, PostgreSQL**, and a modern **React 18** SaaS frontend. Designed as a standout placement project demonstrating clean architecture, role-based authorization, relational schema design, and production workflows.

---

## 📌 Project Highlights & Interview Readiness

- **Role-Based Access Control (RBAC)**: Enforces three distinct roles (`CANDIDATE`, `RECRUITER`, `ADMIN`) with Spring Security filter chains and stateless JWT tokens.
- **6-Stage Recruitment Lifecycle**: `APPLIED` ➔ `UNDER_REVIEW` ➔ `SHORTLISTED` ➔ `INTERVIEW` ➔ `SELECTED` / `REJECTED` with immutable audit history tracking (`ApplicationStatusHistory`).
- **Relational Integrity & Database Design**: Normalized PostgreSQL schema with strict foreign keys, cascading rules, unique composite constraints (preventing duplicate applications), and indexed lookups.
- **Secure File Storage**: PDF resume uploads with UUID hashing, validation, and role-authorized streaming endpoints.
- **Placement Interview Ready**: Includes architectural explanations, database relationship diagrams, REST contract tables, and interview talking points.

---

## 🏗️ Architecture & Component Overview

```
                      +-------------------------------------------------+
                      |              React 18 SaaS Frontend             |
                      |   (Vite + Lucide + Context API + Modern CSS)    |
                      +-----------------------+-------------------------+
                                              | Axios HTTP / REST (JWT)
                                              v
                      +-------------------------------------------------+
                      |           Spring Boot 3.3.4 REST APIs           |
                      |                                                 |
                      |  +-------------------------------------------+  |
                      |  |     JwtAuthenticationFilter (OncePerReq)   |  |
                      |  +---------------------+---------------------+  |
                      |                        |                        |
                      |  +---------------------v---------------------+  |
                      |  |    Spring Security RBAC (@PreAuthorize)   |  |
                      |  +---------------------+---------------------+  |
                      |                        |                        |
                      |  +---------------------v---------------------+  |
                      |  | Controllers (Auth, Job, App, Cand, Rec)   |  |
                      |  +---------------------+---------------------+  |
                      |                        |                        |
                      |  +---------------------v---------------------+  |
                      |  | Service Layer (Business Logic & Workflow) |  |
                      |  +---------------------+---------------------+  |
                      |                        |                        |
                      |  +---------------------v---------------------+  |
                      |  | Spring Data JPA / Hibernate Repositories  |  |
                      |  +---------------------+---------------------+  |
                      +------------------------|------------------------+
                                               | JDBC / SQL
                                               v
                      +-------------------------------------------------+
                      |               PostgreSQL Database               |
                      | (Users, Profiles, Companies, Jobs, Apps, Hist)  |
                      +-------------------------------------------------+
```

---

## 👥 User Roles & Core Capabilities

| Role | Key Capabilities |
| :--- | :--- |
| **Candidate** | Create rich profile (bio, education, skills, links), upload/manage PDF resume, search & filter jobs, 1-click apply with custom cover letters, track stage pipeline in real time, and bookmark jobs. |
| **Recruiter** | Maintain verified company profile, post and manage engineering openings (salary bands, skills, deadlines), review applicant profiles, download candidate resumes, record interview notes, and transition statuses. |
| **Administrator**| Platform analytics, user moderation (activate/deactivate/delete), job listing moderation, and company employer verification. |

---

## 🗄️ Database Design (PostgreSQL Relational Schema)

### Entity Relationship Model
```
  [ users ]
     | 1:1
     +---------------------------> [ candidate_profiles ]
     | 1:1
     +---------------------------> [ recruiter_profiles ] --(N:1)--> [ companies ]
     |                                                                   |
     | 1:N (Posted Jobs)                                                 | 1:N
     v                                                                   v
  [ jobs ] <-------------------------------------------------------------+
     |
     | 1:N
     v
  [ applications ] <--(N:1)-- [ users (candidates) ]
     |
     | 1:N
     v
  [ application_status_history ]
```

### Relational Table Schema
- **`users`**: User ID, unique email, BCrypt password, Role (`CANDIDATE`, `RECRUITER`, `ADMIN`), active flag, timestamps.
- **`companies`**: Organization name, description, website, location, logo URL, verified employer flag.
- **`candidate_profiles`**: One-to-One with user. Bio, headline, phone, location, skills, education, experience years, portfolio/GitHub/LinkedIn URLs, resume filename.
- **`recruiter_profiles`**: One-to-One with user. Full name, phone, designation, company foreign key.
- **`jobs`**: Title, detailed description, responsibilities, requirements, company FK, recruiter user FK, location, job type, experience level, salary min/max, deadline, status (`ACTIVE`, `CLOSED`, `DRAFT`), skills tags.
- **`applications`**: Unique composite constraint on `(job_id, candidate_id)`, resume filename, cover letter, current status, recruiter notes, timestamps.
- **`application_status_history`**: Audit trail containing from_status, to_status, changed_by user FK, notes, and timestamp.
- **`saved_jobs`**: Candidate bookmarks table with unique constraint on `(candidate_id, job_id)`.

---

## 🔑 Demo Accounts (Instant Evaluation)

For convenience during evaluation, the database is pre-seeded with ready-to-test accounts and realistic job listings. You can also use the **1-Click Demo Buttons** on the Login Page:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@recruitment.com` | `Admin@123` | Full administrative control, user moderation & metrics |
| **Recruiter** | `recruiter@techcorp.com` | `Recruiter@123` | Sarah Jenkins (TechCorp Global, 7 active job listings) |
| **Recruiter** | `recruiter@cloudscale.io` | `Recruiter@123` | David Chen (CloudScale Systems) |
| **Candidate** | `candidate@dev.com` | `Candidate@123` | Dhruvin Sorathiya (Full Stack Java & React Engineer) |
| **Candidate** | `alex@frontend.io` | `Candidate@123` | Alex Morgan (Frontend UI/UX Specialist) |

---

## 🚀 Quick Start & Setup Instructions

### Prerequisites
- **Java**: JDK 17, 21, or 24 installed
- **Node.js**: v18+ and npm installed
- **Maven**: Maven 3.9+ (or use the included portable wrapper)
- **PostgreSQL**: PostgreSQL 14+ (Optional for quickstart; zero-config PostgreSQL-mode embedded database is active by default!)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/recruitment-management-system.git
cd "recruitment-management-system"
```

---

### Step 2: Run Backend (Spring Boot)

#### Option A: Quickstart Mode (Instant zero-config PostgreSQL-compatible mode)
```bash
cd backend
# Build and package
..\apache-maven-3.9.9\bin\mvn.cmd clean package -DskipTests

# Run Spring Boot backend
java -jar target/recruitment-system-1.0.0.jar
```
*The backend starts on port **8085** (`http://localhost:8085`). The seed data is initialized automatically.*

#### Option B: Connecting to Live PostgreSQL
1. Start PostgreSQL (e.g., using `docker-compose up -d` or your local PostgreSQL service).
2. Create the database: `CREATE DATABASE recruitment_db;`
3. Run the Spring Boot application with the `postgres` profile:
```bash
cd backend
java -jar target/recruitment-system-1.0.0.jar --spring.profiles.active=postgres
```
Or configure environment variables:
```properties
DB_HOST=localhost
DB_PORT=5432
DB_NAME=recruitment_db
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
```

---

### Step 3: Run Frontend (React 18 + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new candidate or recruiter |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT Bearer token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |

### Job Management (`/api/jobs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | Public | Search jobs by keyword, location, type, level |
| `GET` | `/api/jobs/{id}` | Public | Retrieve job details + application status |
| `POST` | `/api/jobs` | Recruiter / Admin | Create new job opening |
| `PUT` | `/api/jobs/{id}` | Recruiter / Admin | Update existing job |
| `DELETE` | `/api/jobs/{id}` | Recruiter / Admin | Delete job posting |

### Application Workflow (`/api/applications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/applications` | Candidate | Submit job application (prevents duplicates) |
| `GET` | `/api/applications/my` | Candidate | Fetch candidate's own application history |
| `GET` | `/api/applications/{id}` | Authorized | Fetch application details with stage history |
| `PUT` | `/api/applications/{id}/status` | Recruiter / Admin | Transition status & log audit record |

### Candidate Portal (`/api/candidates`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/candidates/profile` | Candidate | Retrieve candidate profile |
| `PUT` | `/api/candidates/profile` | Candidate | Update candidate profile & skills |
| `GET` | `/api/candidates/dashboard` | Candidate | Candidate metrics & application counts |
| `POST` | `/api/candidates/saved-jobs/{jobId}` | Candidate | Bookmark a job |
| `DELETE` | `/api/candidates/saved-jobs/{jobId}` | Candidate | Remove bookmark |
| `GET` | `/api/candidates/saved-jobs` | Candidate | Get saved jobs list |

### Recruiter Portal (`/api/recruiters`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/recruiters/dashboard` | Recruiter | Hiring metrics, jobs count & candidates |
| `GET` | `/api/recruiters/jobs` | Recruiter | List posted jobs with applicant volumes |
| `GET` | `/api/recruiters/jobs/{id}/applications` | Recruiter | List applicants for specific job |
| `GET` | `/api/recruiters/applications` | Recruiter | All applicants across recruiter's jobs |
| `PUT` | `/api/recruiters/company` | Recruiter | Update organization profile |

### Admin Console (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin | Overall platform statistics |
| `GET` | `/api/admin/users` | Admin | List all platform users |
| `PATCH` | `/api/admin/users/{id}/toggle-status` | Admin | Enable/disable user account |
| `DELETE` | `/api/admin/users/{id}` | Admin | Remove user |
| `GET` | `/api/admin/jobs` | Admin | Moderation list of all jobs |
| `PATCH` | `/api/admin/jobs/{id}/status` | Admin | Change job status (`ACTIVE`/`CLOSED`/`DRAFT`) |

### File Storage (`/api/files`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/files/upload-resume` | Candidate | Upload PDF resume |
| `GET` | `/api/files/resume/{fileName}` | Authorized | Stream/download candidate PDF resume |



## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
