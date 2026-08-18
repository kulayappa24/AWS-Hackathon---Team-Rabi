package com.aws.sbg;

import com.aws.sbg.dto.auth.SignUpRequest;
import com.aws.sbg.dto.chat.AskQuestionRequest;
import com.aws.sbg.dto.chat.ChatResponse;
import com.aws.sbg.repository.ChatMessageRepository;
import com.aws.sbg.repository.ChatSessionRepository;
import com.aws.sbg.repository.PasswordResetTokenRepository;
import com.aws.sbg.repository.UserRepository;
import com.aws.sbg.service.AuthService;
import com.aws.sbg.service.ChatService;
import com.aws.sbg.service.DocumentIngestionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("local")
@Transactional
class FallbackTest {

    @Autowired
    private ChatService chatService;

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

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private DocumentIngestionService ingestionService;

    @BeforeEach
    void setUp() {
        ingestionService.ingestAllDocuments();
        messageRepository.deleteAll();
        sessionRepository.deleteAll();
        resetTokenRepository.deleteAll();
        userRepository.deleteAll();

        authService.signUp(SignUpRequest.builder()
                .name("Fallback Tester")
                .email("fallback@campus.edu")
                .password("Password123!")
                .confirmPassword("Password123!")
                .build());

        UserDetails userDetails = userDetailsService.loadUserByUsername("fallback@campus.edu");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities())
        );
    }

    @Test
    void testUnknownQuestionTriggersAuthoritativeFallback() {
        AskQuestionRequest request = AskQuestionRequest.builder()
                .question("What is the exact monthly cost of AWS Braket Quantum Annealing for European research universities in 2035?")
                .build();

        ChatResponse response = chatService.askQuestion(request);

        assertNotNull(response);
        assertTrue(response.getIsFallback(), "Should trigger fallback for unknown out-of-scope query");
        assertTrue(response.getAnswer().contains("Shanmukha Sasi Sadineni"), "Fallback must cite Shanmukha Sasi Sadineni");
        assertTrue(response.getAnswer().contains("sadinenisasi@gmail.com"), "Fallback must cite correct leader email");
        assertTrue(response.getAnswer().contains("7396025334"), "Fallback must cite correct phone number");
    }
}
