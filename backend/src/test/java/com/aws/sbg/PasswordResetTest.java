package com.aws.sbg;

import com.aws.sbg.dto.auth.ForgotPasswordRequest;
import com.aws.sbg.dto.auth.LoginRequest;
import com.aws.sbg.dto.auth.MessageResponse;
import com.aws.sbg.dto.auth.ResetPasswordRequest;
import com.aws.sbg.dto.auth.SignUpRequest;
import com.aws.sbg.entity.PasswordResetToken;
import com.aws.sbg.entity.User;
import com.aws.sbg.exception.InvalidTokenException;
import com.aws.sbg.repository.PasswordResetTokenRepository;
import com.aws.sbg.repository.UserRepository;
import com.aws.sbg.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("local")
@Transactional
class PasswordResetTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @BeforeEach
    void setUp() {
        resetTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testPasswordResetFlow() {
        // 1. Sign up user
        authService.signUp(SignUpRequest.builder()
                .name("Jane Builder")
                .email("jane@campus.edu")
                .password("OriginalPassword123!")
                .confirmPassword("OriginalPassword123!")
                .build());

        // 2. Request reset
        MessageResponse forgotResponse = authService.requestPasswordReset(
                ForgotPasswordRequest.builder().email("jane@campus.edu").build()
        );
        assertTrue(forgotResponse.isSuccess());

        User user = userRepository.findByEmail("jane@campus.edu").orElseThrow();
        PasswordResetToken tokenEntity = resetTokenRepository.findByUserAndUsedFalse(user).orElseThrow();
        assertNotNull(tokenEntity.getToken());

        // 3. Reset password
        MessageResponse resetResponse = authService.resetPassword(ResetPasswordRequest.builder()
                .token(tokenEntity.getToken())
                .newPassword("BrandNewPassword456!")
                .confirmPassword("BrandNewPassword456!")
                .build());

        assertTrue(resetResponse.isSuccess());

        // 4. Verify login with new password works
        var loginResponse = authService.login(LoginRequest.builder()
                .email("jane@campus.edu")
                .password("BrandNewPassword456!")
                .build());
        assertNotNull(loginResponse.getToken());

        // 5. Verify old token cannot be reused
        assertThrows(InvalidTokenException.class, () -> authService.resetPassword(ResetPasswordRequest.builder()
                .token(tokenEntity.getToken())
                .newPassword("AnotherPassword789!")
                .confirmPassword("AnotherPassword789!")
                .build()));
    }
}
