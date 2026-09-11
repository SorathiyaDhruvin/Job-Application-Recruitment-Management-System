package com.recruitment.config;

import com.recruitment.entity.*;
import com.recruitment.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final SavedJobRepository savedJobRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            CompanyRepository companyRepository,
            CandidateProfileRepository candidateProfileRepository,
            RecruiterProfileRepository recruiterProfileRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            ApplicationStatusHistoryRepository statusHistoryRepository,
            SavedJobRepository savedJobRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.savedJobRepository = savedJobRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Data already initialized
        }

        // 1. Create Admin User
        User admin = new User("admin@recruitment.com", passwordEncoder.encode("Admin@123"), Role.ADMIN);
        userRepository.save(admin);

        // 2. Create Companies
        Company techCorp = new Company(
                "TechCorp Global",
                "TechCorp is an industry-leading cloud platform enterprise engineering scalable enterprise software across the globe.",
                "https://techcorp-example.com",
                "San Francisco, CA",
                "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120&auto=format&fit=crop&q=60"
        );
        techCorp = companyRepository.save(techCorp);

        Company cloudScale = new Company(
                "CloudScale Systems",
                "Next-generation distributed cloud infrastructure, microservices mesh, and autonomous container scaling systems.",
                "https://cloudscale-example.io",
                "New York, NY",
                "https://images.unsplash.com/photo-1551434678-e076c223a692?w=120&auto=format&fit=crop&q=60"
        );
        cloudScale = companyRepository.save(cloudScale);

        Company finTech = new Company(
                "FinTech Innovations",
                "Pioneering frictionless real-time financial payments, algorithmic transaction settlement, and banking APIs.",
                "https://fintech-innovations-example.com",
                "Boston, MA",
                "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=120&auto=format&fit=crop&q=60"
        );
        finTech = companyRepository.save(finTech);

        // 3. Create Recruiters
        User recruiter1User = new User("recruiter@techcorp.com", passwordEncoder.encode("Recruiter@123"), Role.RECRUITER);
        recruiter1User = userRepository.save(recruiter1User);
        RecruiterProfile recruiter1Profile = new RecruiterProfile(recruiter1User, "Sarah Jenkins", techCorp, "Senior Engineering Talent Partner");
        recruiter1Profile.setPhone("+1 (415) 555-0182");
        recruiterProfileRepository.save(recruiter1Profile);

        User recruiter2User = new User("recruiter@cloudscale.io", passwordEncoder.encode("Recruiter@123"), Role.RECRUITER);
        recruiter2User = userRepository.save(recruiter2User);
        RecruiterProfile recruiter2Profile = new RecruiterProfile(recruiter2User, "David Chen", cloudScale, "Head of Global Talent Acquisition");
        recruiter2Profile.setPhone("+1 (212) 555-0199");
        recruiterProfileRepository.save(recruiter2Profile);

        // 4. Create Candidates
        User candidate1User = new User("candidate@dev.com", passwordEncoder.encode("Candidate@123"), Role.CANDIDATE);
        candidate1User = userRepository.save(candidate1User);
        CandidateProfile candidate1Profile = new CandidateProfile(candidate1User, "Dhruvin Sorathiya");
        candidate1Profile.setHeadline("Full Stack Java & React Software Engineer | Spring Boot & Cloud");
        candidate1Profile.setPhone("+91 98765 43210");
        candidate1Profile.setLocation("Bengaluru, India / Remote");
        candidate1Profile.setBio("Passionate software engineer experienced in building robust RESTful APIs with Spring Boot, JPA, secure JWT authentication, and responsive React applications with modern design systems.");
        candidate1Profile.setSkills("Java, Spring Boot, Spring Security, React, PostgreSQL, Docker, REST APIs, Git, Microservices, Hibernate");
        candidate1Profile.setEducation("B.Tech in Computer Science & Engineering (2022 - 2026), GPA 8.8/10");
        candidate1Profile.setExperienceYears(2);
        candidate1Profile.setGithubUrl("https://github.com");
        candidate1Profile.setLinkedinUrl("https://linkedin.com");
        candidate1Profile.setPortfolioUrl("https://dhruvin-portfolio.dev");
        candidateProfileRepository.save(candidate1Profile);

        User candidate2User = new User("alex@frontend.io", passwordEncoder.encode("Candidate@123"), Role.CANDIDATE);
        candidate2User = userRepository.save(candidate2User);
        CandidateProfile candidate2Profile = new CandidateProfile(candidate2User, "Alex Morgan");
        candidate2Profile.setHeadline("Senior Frontend Architect & UI/UX Specialist");
        candidate2Profile.setPhone("+1 (555) 234-5678");
        candidate2Profile.setLocation("San Francisco, CA");
        candidate2Profile.setBio("Specializing in accessible, responsive web applications built with modern React, TypeScript, state management, and high-performance frontends.");
        candidate2Profile.setSkills("React, TypeScript, Next.js, Redux, TailwindCSS, CSS3, Jest, Webpack");
        candidate2Profile.setEducation("B.S. in Software Engineering, University of California, Berkeley");
        candidate2Profile.setExperienceYears(4);
        candidateProfileRepository.save(candidate2Profile);

        User candidate3User = new User("priya@clouddev.com", passwordEncoder.encode("Candidate@123"), Role.CANDIDATE);
        candidate3User = userRepository.save(candidate3User);
        CandidateProfile candidate3Profile = new CandidateProfile(candidate3User, "Priya Sharma");
        candidate3Profile.setHeadline("Cloud Systems & DevOps Engineer | AWS & Kubernetes");
        candidate3Profile.setPhone("+91 91234 56789");
        candidate3Profile.setLocation("Hyderabad, India");
        candidate3Profile.setBio("Expert in CI/CD pipeline automation, containerized architectures, Kubernetes clusters, and cloud-native Java services.");
        candidate3Profile.setSkills("Java, AWS, Kubernetes, Docker, Terraform, Jenkins, Linux, PostgreSQL");
        candidate3Profile.setEducation("M.Tech in Distributed Computing, IIT Hyderabad");
        candidate3Profile.setExperienceYears(3);
        candidateProfileRepository.save(candidate3Profile);

        // 5. Create Realistic Job Postings
        Job job1 = createJobHelper(
                "Senior Full Stack Java & React Developer",
                "We are seeking an experienced Full Stack Developer to build our flagship enterprise recruiter and workforce collaboration suite. You will work across modern Spring Boot services and dynamic React applications.",
                "- Architect and maintain mission-critical Spring Boot microservices.\n- Build responsive, accessible frontend workflows using React and TypeScript.\n- Collaborate with product designers and DevOps engineers on CI/CD automation.\n- Optimize PostgreSQL query performance and data pipelines.",
                "- 3+ years of professional full-stack development experience.\n- Strong proficiency in Java 17+, Spring Boot, Spring Security, and JPA.\n- Hands-on expertise in React.js, modern CSS, and state management.\n- Deep understanding of RESTful API design and PostgreSQL.",
                techCorp, recruiter1User, "San Francisco, CA / Remote",
                JobType.FULL_TIME, ExperienceLevel.SENIOR, 130000.0, 160000.0,
                LocalDate.now().plusDays(45), "Java, Spring Boot, React, PostgreSQL, Docker, REST APIs"
        );

        Job job2 = createJobHelper(
                "Backend Software Engineer - Spring Boot",
                "Join CloudScale Systems to design and implement highly reliable distributed services handling millions of events daily. You will build high-throughput backend APIs.",
                "- Design and scale clean REST APIs using Spring Boot and Spring MVC.\n- Maintain database schemas, migrations, and performance optimizations on PostgreSQL.\n- Implement secure authentication and token management with OAuth2/JWT.\n- Write comprehensive unit and integration tests.",
                "- Strong fundamentals in Data Structures, Algorithms, and Object-Oriented Design.\n- 2+ years experience building backend systems in Java/Spring Boot.\n- Experience with relational databases (PostgreSQL/MySQL) and caching (Redis).\n- Familiarity with Docker and Git workflows.",
                cloudScale, recruiter2User, "New York, NY / Hybrid",
                JobType.FULL_TIME, ExperienceLevel.MID, 110000.0, 140000.0,
                LocalDate.now().plusDays(30), "Java, Spring Boot, Hibernate, PostgreSQL, JUnit, Docker"
        );

        Job job3 = createJobHelper(
                "Frontend React Engineer",
                "Looking for a passionate Frontend Engineer to craft sleek, responsive, and accessible user experiences for our recruitment dashboard and job candidate portal.",
                "- Develop reusable UI component libraries and modular pages in React.\n- Integrate RESTful endpoints using Axios and manage client-side state.\n- Ensure responsive layout fidelity across mobile, tablet, and desktop screens.\n- Improve client performance, web vitals, and rendering speed.",
                "- 2+ years of React development experience.\n- Excellent mastery of modern JavaScript (ES6+), HTML5, and CSS3.\n- Experience with React Router, context API, and asynchronous state handling.\n- Portfolio demonstrating strong design aesthetic and clean code.",
                techCorp, recruiter1User, "Remote",
                JobType.FULL_TIME, ExperienceLevel.MID, 95000.0, 125000.0,
                LocalDate.now().plusDays(25), "React, JavaScript, CSS3, HTML5, Axios, Webpack"
        );

        Job job4 = createJobHelper(
                "DevOps & Cloud Infrastructure Specialist",
                "Lead the evolution of our cloud infrastructure and automated deployment pipelines across multi-region environments.",
                "- Automate container orchestration using Kubernetes and Docker.\n- Build and maintain continuous integration pipelines (GitHub Actions/Jenkins).\n- Monitor system telemetry, error budgets, and latency metrics.\n- Enhance security posture and infrastructure as code (Terraform).",
                "- 3+ years in DevOps or Cloud Engineering.\n- Strong expertise in AWS or GCP cloud services.\n- Deep familiarity with Linux environments and bash scripting.\n- Experience deploying Spring Boot and React production services.",
                cloudScale, recruiter2User, "Remote",
                JobType.FULL_TIME, ExperienceLevel.SENIOR, 120000.0, 155000.0,
                LocalDate.now().plusDays(40), "AWS, Kubernetes, Docker, Terraform, CI/CD, Linux"
        );

        Job job5 = createJobHelper(
                "Junior Java Software Engineer",
                "An exciting opportunity for entry-level developers or recent graduates to learn, grow, and build enterprise-grade software in a supportive engineering environment.",
                "- Develop and maintain backend endpoints using Java and Spring Boot.\n- Participate in code reviews, design sessions, and sprint planning.\n- Write unit tests and maintain technical documentation.\n- Troubleshoot bugs and implement feature enhancements.",
                "- Degree in Computer Science, Software Engineering, or related technical field.\n- Strong foundation in Core Java (Collections, Streams, Multithreading, OOP).\n- Basic familiarity with Spring framework and SQL databases.\n- High enthusiasm and eagerness to learn modern engineering practices.",
                techCorp, recruiter1User, "San Francisco, CA",
                JobType.FULL_TIME, ExperienceLevel.ENTRY, 70000.0, 90000.0,
                LocalDate.now().plusDays(60), "Java, Spring Boot, SQL, Git, OOP"
        );

        Job job6 = createJobHelper(
                "Lead Distributed Systems Architect",
                "Provide technical vision, architectural leadership, and engineering excellence across our entire suite of distributed enterprise systems.",
                "- Drive architectural decisions for high-throughput, low-latency microservices.\n- Mentor engineering teams and champion software design patterns.\n- Lead technology evaluations and system migrations.\n- Partner with executive leadership on the strategic technical roadmap.",
                "- 7+ years in software engineering with leadership experience.\n- Deep mastery of Java ecosystem, distributed consensus, and event-driven architecture.\n- Proven track record of scaling systems to millions of active users.",
                techCorp, recruiter1User, "San Francisco, CA / Hybrid",
                JobType.FULL_TIME, ExperienceLevel.LEAD, 175000.0, 215000.0,
                LocalDate.now().plusDays(50), "Java, Microservices, System Design, Kafka, PostgreSQL, Distributed Systems"
        );

        createJobHelper(
                "FinTech Platform Security Engineer",
                "Protect payment transactions, user data confidentiality, and compliance across our modern fintech processing engine.",
                "- Conduct penetration testing, vulnerability assessments, and secure code reviews.\n- Implement cryptography, key management, and zero-trust authentication.\n- Maintain regulatory compliance with PCI-DSS and SOC2 standards.\n- Automate security scans in CI/CD pipelines.",
                "- 4+ years dedicated to application and infrastructure security.\n- Knowledge of OWASP Top 10, TLS/SSL, OAuth2, and JWT standards.\n- Experience with secure Java development practices.",
                finTech, recruiter1User, "Boston, MA / Hybrid",
                JobType.FULL_TIME, ExperienceLevel.SENIOR, 135000.0, 165000.0,
                LocalDate.now().plusDays(35), "Security, OAuth2, JWT, Cryptography, OWASP, Java"
        );

        createJobHelper(
                "Software Engineering Intern - Summer 2026",
                "Join our paid 12-week summer internship program! You will work alongside experienced mentors on real production features.",
                "- Collaborate on real customer-facing features.\n- Learn full-stack development patterns in Spring Boot and React.\n- Present your capstone project to company engineering leaders at the end of the term.",
                "- Currently pursuing a Bachelor's or Master's in Computer Science.\n- Familiarity with at least one programming language (Java, JavaScript, Python).\n- Passion for solving interesting technical problems.",
                cloudScale, recruiter2User, "Remote",
                JobType.INTERNSHIP, ExperienceLevel.ENTRY, 45000.0, 60000.0,
                LocalDate.now().plusDays(90), "Java, React, SQL, Git, Problem Solving"
        );

        createJobHelper(
                "Data Platform & Pipeline Engineer",
                "Build modern real-time and batch data pipelines that empower data analytics, financial reconciliation, and machine learning models.",
                "- Design ETL data pipelines and streaming workflows.\n- Model relational and analytical databases for optimal querying.\n- Ensure data integrity, validation, and SLA adherence.",
                "- 3+ years experience with database systems and data streaming.\n- Strong SQL and Java/Python skills.\n- Experience with PostgreSQL, Kafka, or Spark.",
                finTech, recruiter2User, "Boston, MA / Hybrid",
                JobType.FULL_TIME, ExperienceLevel.MID, 115000.0, 145000.0,
                LocalDate.now().plusDays(28), "SQL, PostgreSQL, Java, Kafka, ETL, Data Warehousing"
        );

        createJobHelper(
                "Mobile Application Developer (React Native)",
                "Develop cross-platform mobile recruitment apps allowing candidates and recruiters to connect on the go.",
                "- Build cross-platform iOS and Android mobile features with React Native.\n- Integrate push notifications, real-time messaging, and secure biometric login.\n- Ensure smooth 60fps UI animations and native device compatibility.",
                "- 2+ years of hands-on React Native development.\n- Experience with TypeScript, mobile state management, and REST APIs.\n- App Store or Google Play release experience is a plus.",
                techCorp, recruiter1User, "Remote",
                JobType.CONTRACT, ExperienceLevel.MID, 105000.0, 135000.0,
                LocalDate.now().plusDays(40), "React Native, TypeScript, iOS, Android, Mobile UX"
        );

        createJobHelper(
                "Database Administrator & PostgreSQL Specialist",
                "Ensure high availability, backup automation, query tuning, and zero-downtime schema migrations for our core PostgreSQL clusters.",
                "- Optimize complex SQL queries, indexes, and connection pooling.\n- Automate disaster recovery, backups, and replication failover.\n- Partner with backend engineers on efficient entity-relational schema designs.",
                "- 4+ years specialized in PostgreSQL administration and tuning.\n- Deep understanding of MVCC, WAL, connection poolers (PgBouncer), and indexing.\n- Experience with cloud-managed databases (AWS RDS / Aurora).",
                cloudScale, recruiter2User, "New York, NY / Hybrid",
                JobType.FULL_TIME, ExperienceLevel.SENIOR, 118000.0, 148000.0,
                LocalDate.now().plusDays(32), "PostgreSQL, Performance Tuning, SQL, Replication, Linux"
        );

        createJobHelper(
                "QA Automation Engineer - Java/Selenium",
                "Lead automated quality assurance for our recruitment workflows, building regression suites and performance test frameworks.",
                "- Design automated test scripts for REST APIs and UI workflows.\n- Integrate test suites into CI/CD deployment pipelines.\n- Work closely with development teams to identify edge cases and reproduce defects.",
                "- 2+ years in test automation with Java, Selenium, or Playwright.\n- Solid experience testing RESTful APIs with Postman, REST Assured, or Karate.\n- Understanding of Agile testing lifecycle.",
                finTech, recruiter1User, "Remote",
                JobType.FULL_TIME, ExperienceLevel.MID, 85000.0, 110000.0,
                LocalDate.now().plusDays(42), "Java, Selenium, TestNG, REST Assured, CI/CD, QA"
        );

        // 6. Create Realistic Sample Applications & Status Histories
        // Candidate 1 -> Job 1 (SHORTLISTED)
        Application app1 = new Application();
        app1.setJob(job1);
        app1.setCandidate(candidate1User);
        app1.setStatus(ApplicationStatus.SHORTLISTED);
        app1.setCoverLetter("I am very excited about the Senior Full Stack role at TechCorp. With strong expertise in Java Spring Boot backend microservices and modern React frontend architectures, I believe I can make an immediate positive impact on your enterprise recruiter platform.");
        app1.setRecruiterNotes("Strong technical background, impressive GitHub projects, and relevant full-stack skills. Shortlisted for technical round.");
        app1 = applicationRepository.save(app1);

        statusHistoryRepository.save(new ApplicationStatusHistory(app1, null, ApplicationStatus.APPLIED, candidate1User, "Application submitted online."));
        statusHistoryRepository.save(new ApplicationStatusHistory(app1, ApplicationStatus.APPLIED, ApplicationStatus.UNDER_REVIEW, recruiter1User, "Resume reviewed by Sarah Jenkins. Matches required Java/React stack."));
        statusHistoryRepository.save(new ApplicationStatusHistory(app1, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.SHORTLISTED, recruiter1User, "Candidate shortlisted for technical round."));

        // Candidate 1 -> Job 2 (INTERVIEW)
        Application app2 = new Application();
        app2.setJob(job2);
        app2.setCandidate(candidate1User);
        app2.setStatus(ApplicationStatus.INTERVIEW);
        app2.setCoverLetter("CloudScale's distributed container architecture is fascinating. I would love to contribute my Spring Boot and PostgreSQL skills to your backend engineering team.");
        app2.setRecruiterNotes("Technical interview scheduled for Tuesday 3 PM EST with Lead Engineer.");
        app2 = applicationRepository.save(app2);

        statusHistoryRepository.save(new ApplicationStatusHistory(app2, null, ApplicationStatus.APPLIED, candidate1User, "Application submitted."));
        statusHistoryRepository.save(new ApplicationStatusHistory(app2, ApplicationStatus.APPLIED, ApplicationStatus.UNDER_REVIEW, recruiter2User, "Profile screened."));
        statusHistoryRepository.save(new ApplicationStatusHistory(app2, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.SHORTLISTED, recruiter2User, "Passed screening call."));
        statusHistoryRepository.save(new ApplicationStatusHistory(app2, ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEW, recruiter2User, "Technical round scheduled with engineering team."));

        // Candidate 2 -> Job 3 (SELECTED)
        Application app3 = new Application();
        app3.setJob(job3);
        app3.setCandidate(candidate2User);
        app3.setStatus(ApplicationStatus.SELECTED);
        app3.setCoverLetter("As a frontend engineer passionate about accessible UI and snappy interfaces, I would love to lead the frontend development of your recruitment dashboard.");
        app3.setRecruiterNotes("Outstanding performance across all frontend technical evaluations and cultural interview. Offer extended and accepted!");
        app3 = applicationRepository.save(app3);

        statusHistoryRepository.save(new ApplicationStatusHistory(app3, null, ApplicationStatus.APPLIED, candidate2User, "Application submitted."));
        statusHistoryRepository.save(new ApplicationStatusHistory(app3, ApplicationStatus.APPLIED, ApplicationStatus.SHORTLISTED, recruiter1User, "Shortlisted based on rich UI portfolio."));
        statusHistoryRepository.save(new ApplicationStatusHistory(app3, ApplicationStatus.SHORTLISTED, ApplicationStatus.INTERVIEW, recruiter1User, "Live coding round completed with score 98/100."));
        statusHistoryRepository.save(new ApplicationStatusHistory(app3, ApplicationStatus.INTERVIEW, ApplicationStatus.SELECTED, recruiter1User, "Offer letter accepted by candidate. Welcome to TechCorp!"));

        // Candidate 3 -> Job 4 (APPLIED)
        Application app4 = new Application();
        app4.setJob(job4);
        app4.setCandidate(candidate3User);
        app4.setStatus(ApplicationStatus.APPLIED);
        app4.setCoverLetter("I have managed multi-region AWS and Kubernetes clusters with automated Terraform infrastructure. Excited to apply for the DevOps specialist role.");
        app4 = applicationRepository.save(app4);
        statusHistoryRepository.save(new ApplicationStatusHistory(app4, null, ApplicationStatus.APPLIED, candidate3User, "Application submitted."));

        // Candidate 3 -> Job 2 (REJECTED)
        Application app5 = new Application();
        app5.setJob(job2);
        app5.setCandidate(candidate3User);
        app5.setStatus(ApplicationStatus.REJECTED);
        app5.setCoverLetter("Interested in backend opportunities at CloudScale.");
        app5.setRecruiterNotes("Candidate specializes heavily in cloud infra rather than pure Spring Boot backend. Recommended to re-apply for DevOps role.");
        app5 = applicationRepository.save(app5);

        statusHistoryRepository.save(new ApplicationStatusHistory(app5, null, ApplicationStatus.APPLIED, candidate3User, "Application submitted."));
        statusHistoryRepository.save(new ApplicationStatusHistory(app5, ApplicationStatus.APPLIED, ApplicationStatus.REJECTED, recruiter2User, "Candidate profile directed to Cloud/DevOps openings."));

        // Candidate 1 Saved Jobs
        savedJobRepository.save(new SavedJob(candidate1User, job5));
        savedJobRepository.save(new SavedJob(candidate1User, job6));
    }

    private Job createJobHelper(
            String title, String description, String responsibilities, String requirements,
            Company company, User recruiter, String location, JobType jobType,
            ExperienceLevel experienceLevel, Double salaryMin, Double salaryMax,
            LocalDate deadline, String skills
    ) {
        Job job = new Job();
        job.setTitle(title);
        job.setDescription(description);
        job.setResponsibilities(responsibilities);
        job.setRequirements(requirements);
        job.setCompany(company);
        job.setRecruiter(recruiter);
        job.setLocation(location);
        job.setJobType(jobType);
        job.setExperienceLevel(experienceLevel);
        job.setSalaryMin(salaryMin);
        job.setSalaryMax(salaryMax);
        job.setDeadline(deadline);
        job.setStatus(JobStatus.ACTIVE);
        job.setSkills(skills);
        return jobRepository.save(job);
    }
}
