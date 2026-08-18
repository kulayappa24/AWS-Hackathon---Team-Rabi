package com.aws.sbg.service;

import com.aws.sbg.dto.auth.*;
import com.aws.sbg.entity.PasswordResetToken;
import com.aws.sbg.entity.Role;
import com.aws.sbg.entity.User;
import com.aws.sbg.exception.BadRequestException;
import com.aws.sbg.exception.InvalidTokenException;
import com.aws.sbg.repository.PasswordResetTokenRepository;
import com.aws.sbg.repository.UserRepository;
import com.aws.sbg.security.JwtTokenProvider;
import com.aws.sbg.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    @Value("${app.jwt.reset-token-expiration-minutes:30}")
    private int resetTokenExpirationMinutes;

    @Transactional
    public AuthResponse signUp(SignUpRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and Confirm Password do not match.");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("An account with email " + normalizedEmail + " already exists.");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_MEMBER)
                .campusId(request.getCampusId() != null ? request.getCampusId().trim() : null)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // Authenticate new user automatically
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .campusId(savedUser.getCampusId())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new BadRequestException("User profile not found"));

        return AuthResponse.builder()
                .token(jwt)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .campusId(user.getCampusId())
                .build();
    }

    @Transactional
    public MessageResponse requestPasswordReset(ForgotPasswordRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        Map<String, Object> payload = new HashMap<>();

        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            // Invalidate existing tokens for this user
            resetTokenRepository.deleteByUser(user);

            // Generate cryptographically random token
            String token = UUID.randomUUID().toString();
            Instant expiryDate = Instant.now().plus(resetTokenExpirationMinutes, ChronoUnit.MINUTES);

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiryDate(expiryDate)
                    .used(false)
                    .build();

            resetTokenRepository.save(resetToken);

            log.info("Password reset requested for {}. Generated token: {}", user.getEmail(), token);

            // Send reset email via Amazon SES
            emailService.sendPasswordResetEmail(user.getEmail(), token);

            payload.put("token", token);
            payload.put("resetUrl", "/#/reset-password?token=" + token);
            payload.put("email", user.getEmail());
        });

        return MessageResponse.of(true, "If an account exists with that email, a password reset link has been dispatched to your inbox.", payload);
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match.");
        }

        PasswordResetToken resetToken = resetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid or unrecognized password reset token."));

        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new InvalidTokenException("This password reset token has already been used.");
        }

        if (resetToken.isExpired()) {
            throw new InvalidTokenException("This password reset token has expired. Please request a new reset link.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        return MessageResponse.of(true, "Password has been successfully updated. You may now log in with your new password.");
    }
}
