package com.aws.sbg;

import com.aws.sbg.dto.auth.AuthResponse;
import com.aws.sbg.dto.auth.LoginRequest;
import com.aws.sbg.dto.auth.SignUpRequest;
import com.aws.sbg.exception.BadRequestException;
import com.aws.sbg.repository.ChatMessageRepository;
import com.aws.sbg.repository.ChatSessionRepository;
import com.aws.sbg.repository.PasswordResetTokenRepository;
import com.aws.sbg.repository.UserRepository;
import com.aws.sbg.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("local")
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatMessageRepository messageRepository;

    @Autowired
    private ChatSessionRepository sessionRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @BeforeEach
    void setUp() {
        messageRepository.deleteAll();
        sessionRepository.deleteAll();
        resetTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testSignUpSuccess() {
        SignUpRequest request = SignUpRequest.builder()
                .name("Alex Builder")
                .email("alex@campus.edu")
                .password("StrongPassword123!")
                .confirmPassword("StrongPassword123!")
                .campusId("CAMPUS-101")
                .build();

        AuthResponse response = authService.signUp(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("Alex Builder", response.getName());
        assertEquals("alex@campus.edu", response.getEmail());
        assertTrue(userRepository.existsByEmail("alex@campus.edu"));
    }

    @Test
    void testSignUpPasswordMismatchThrows() {
        SignUpRequest request = SignUpRequest.builder()
                .name("Alex Builder")
                .email("alex@campus.edu")
                .password("StrongPassword123!")
                .confirmPassword("DifferentPassword123!")
                .build();

        assertThrows(BadRequestException.class, () -> authService.signUp(request));
    }

    @Test
    void testDuplicateEmailThrows() {
        SignUpRequest request = SignUpRequest.builder()
                .name("Alex Builder")
                .email("alex@campus.edu")
                .password("StrongPassword123!")
                .confirmPassword("StrongPassword123!")
                .build();

        authService.signUp(request);

        SignUpRequest duplicateRequest = SignUpRequest.builder()
                .name("Alex Two")
                .email("alex@campus.edu")
                .password("StrongPassword123!")
                .confirmPassword("StrongPassword123!")
                .build();

        assertThrows(BadRequestException.class, () -> authService.signUp(duplicateRequest));
    }

    @Test
    void testLoginSuccess() {
        SignUpRequest signUpRequest = SignUpRequest.builder()
                .name("Alex Builder")
                .email("alex@campus.edu")
                .password("StrongPassword123!")
                .confirmPassword("StrongPassword123!")
                .build();

        authService.signUp(signUpRequest);

        LoginRequest loginRequest = LoginRequest.builder()
                .email("alex@campus.edu")
                .password("StrongPassword123!")
                .build();

        AuthResponse loginResponse = authService.login(loginRequest);

        assertNotNull(loginResponse);
        assertNotNull(loginResponse.getToken());
        assertEquals("alex@campus.edu", loginResponse.getEmail());
    }
}
