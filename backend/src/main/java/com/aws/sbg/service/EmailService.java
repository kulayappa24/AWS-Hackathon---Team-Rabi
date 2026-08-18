package com.aws.sbg.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.from:o220581@rguktong.ac.in}")
    private String fromEmail;

    @Value("${app.mail.provider:ses}")
    private String mailProvider;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${AWS_ACCESS_KEY_ID:}")
    private String awsAccessKey;

    @Value("${AWS_SECRET_ACCESS_KEY:}")
    private String awsSecretKey;

    @Value("${app.frontend.url:http://sbg-member-portal-env.eba-e828ausa.ap-south-1.elasticbeanstalk.com}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String recipientEmail, String resetToken) {
        String resetUrl = frontendUrl + "/#/reset-password?token=" + resetToken;

        String htmlBody = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;'>"
                + "<div style='background-color: #232F3E; padding: 15px; border-radius: 6px; text-align: center;'>"
                + "<h2 style='color: #FF9900; margin: 0;'>AWS Student Builder Groups</h2>"
                + "<p style='color: #FFFFFF; margin: 5px 0 0 0; font-size: 14px;'>Club Member Portal</p>"
                + "</div>"
                + "<div style='padding: 20px 0;'>"
                + "<p style='font-size: 16px; color: #161E2E;'>Hello,</p>"
                + "<p style='font-size: 15px; color: #475569;'>You requested a password reset for your Student Builder Group account. Click the button below to choose a new password:</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<a href='" + resetUrl + "' style='background-color: #FF9900; color: #131921; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 15px;'>Reset My Password</a>"
                + "</div>"
                + "<p style='font-size: 13px; color: #64748B;'>Or copy and paste this link into your browser:<br/><a href='" + resetUrl + "' style='color: #0073BB;'>" + resetUrl + "</a></p>"
                + "<p style='font-size: 13px; color: #64748B;'>This link is valid for 30 minutes. If you did not request a password reset, please ignore this email.</p>"
                + "</div>"
                + "<hr style='border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;'/>"
                + "<p style='font-size: 12px; color: #94A3B8; text-align: center;'>AWS Student Builder Groups Campus Chapter · Learn by Building</p>"
                + "</div>";

        // Try Amazon SES Native SDK in us-east-1
        if ("ses".equalsIgnoreCase(mailProvider) || (awsAccessKey != null && !awsAccessKey.isBlank())) {
            try {
                software.amazon.awssdk.auth.credentials.AwsCredentialsProvider credentialsProvider;
                if (awsAccessKey != null && !awsAccessKey.isBlank() && awsSecretKey != null && !awsSecretKey.isBlank()) {
                    credentialsProvider = StaticCredentialsProvider.create(AwsBasicCredentials.create(awsAccessKey, awsSecretKey));
                } else {
                    credentialsProvider = software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider.create();
                }

                SesClient sesClient = SesClient.builder()
                        .region(Region.US_EAST_1)
                        .credentialsProvider(credentialsProvider)
                        .build();

                SendEmailRequest sendEmailRequest = SendEmailRequest.builder()
                        .destination(Destination.builder().toAddresses(recipientEmail).build())
                        .source(fromEmail)
                        .message(Message.builder()
                                .subject(Content.builder().data("Student Builder Groups — Reset Your Password").charset("UTF-8").build())
                                .body(Body.builder()
                                        .html(Content.builder().data(htmlBody).charset("UTF-8").build())
                                        .text(Content.builder().data("Reset your password using this link: " + resetUrl).charset("UTF-8").build())
                                        .build())
                                .build())
                        .build();

                SendEmailResponse response = sesClient.sendEmail(sendEmailRequest);
                log.info("Successfully sent password reset email via Amazon SES SDK. MessageId: {}", response.messageId());
                return;
            } catch (Exception e) {
                log.warn("Amazon SES API send attempt failed: {}. Trying SMTP...", e.getMessage());
            }
        }

        // Try SMTP JavaMailSender
        if (mailSender != null && smtpUsername != null && !smtpUsername.isBlank()) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(recipientEmail);
                helper.setSubject("Student Builder Groups — Reset Your Password");
                helper.setText(htmlBody, true);
                mailSender.send(message);
                log.info("Successfully sent password reset email via SMTP to {}", recipientEmail);
                return;
            } catch (Exception e) {
                log.warn("SMTP send failed: {}", e.getMessage());
            }
        }

        log.info("Email fallback log: Password reset link for {} is {}", recipientEmail, resetUrl);
    }
}
