package com.recruitment.service;

import com.recruitment.entity.Application;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    public void sendApplicationConfirmation(Application application) {
        String to = application.getJob().getRecruiter().getEmail();
        String subject = "New Job Application - " + application.getJob().getTitle();
        String text = String.format(
                "A new candidate has applied for your job posting.\\n\\nCandidate: %s\\nJob Title: %s\\nDate: %s\\n",
                application.getCandidate().getEmail(),
                application.getJob().getTitle(),
                application.getAppliedAt()
        );

        sendEmail(to, subject, text);
    }

    public void sendStatusUpdate(Application application) {
        String to = application.getCandidate().getEmail();
        String subject = "Application Status Updated - " + application.getJob().getTitle();
        String text = String.format(
                "Your application status for the position '%s' at '%s' has been updated.\\n\\nNew Status: %s\\nNotes: %s\\n",
                application.getJob().getTitle(),
                application.getJob().getCompany() != null ? application.getJob().getCompany().getName() : "Company",
                application.getStatus(),
                application.getRecruiterNotes() != null ? application.getRecruiterNotes() : "N/A"
        );

        sendEmail(to, subject, text);
    }

    private void sendEmail(String to, String subject, String text) {
        if (javaMailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(text);
                javaMailSender.send(message);
                logger.info("Sent email to: {}", to);
            } catch (Exception e) {
                logger.warn("Failed to send email to {}, falling back to log. Error: {}", to, e.getMessage());
                logEmailFallback(to, subject, text);
            }
        } else {
            logger.info("JavaMailSender is not configured. Falling back to log.");
            logEmailFallback(to, subject, text);
        }
    }

    private void logEmailFallback(String to, String subject, String text) {
        logger.info("--- MOCK EMAIL ---");
        logger.info("To: {}", to);
        logger.info("Subject: {}", subject);
        logger.info("Body: {}", text);
        logger.info("------------------");
    }
}
