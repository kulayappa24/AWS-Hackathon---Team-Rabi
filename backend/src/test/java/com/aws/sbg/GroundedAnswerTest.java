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
class GroundedAnswerTest {

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
                .name("Test Member")
                .email("member@campus.edu")
                .password("Password123!")
                .confirmPassword("Password123!")
                .build());

        UserDetails userDetails = userDetailsService.loadUserByUsername("member@campus.edu");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities())
        );
    }

    @Test
    void testGroundedWorkshopAnswerAndCitation() {
        AskQuestionRequest request = AskQuestionRequest.builder()
                .question("When is the next workshop?")
                .build();

        ChatResponse response = chatService.askQuestion(request);

        assertNotNull(response);
        assertFalse(response.getIsFallback(), "Should be a grounded answer, not fallback");
        assertNotNull(response.getPrimarySource());
        assertEquals("06-workshop-index.md", response.getPrimarySource().getFilename());
        assertTrue(response.getAnswer().contains("RAG chatbots on Bedrock"));
    }

    @Test
    void testGroundedBuilderCenterAnswerAndCitation() {
        AskQuestionRequest request = AskQuestionRequest.builder()
                .question("What are the steps to publish on Builder Center?")
                .build();

        ChatResponse response = chatService.askQuestion(request);

        assertNotNull(response);
        assertFalse(response.getIsFallback());
        assertNotNull(response.getPrimarySource());
        assertEquals("03-builder-center-publish.md", response.getPrimarySource().getFilename());
    }
}
