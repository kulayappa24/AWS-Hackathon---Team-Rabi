package com.aws.sbg.service;

import com.aws.sbg.ai.AiService;
import com.aws.sbg.ai.AiServiceFactory;
import com.aws.sbg.dto.chat.*;
import com.aws.sbg.entity.*;
import com.aws.sbg.exception.ResourceNotFoundException;
import com.aws.sbg.rag.DocumentRetriever;
import com.aws.sbg.rag.RetrievedContext;
import com.aws.sbg.repository.ChatMessageRepository;
import com.aws.sbg.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final DocumentRetriever documentRetriever;
    private final AiServiceFactory aiServiceFactory;
    private final UserService userService;

    @Transactional
    public ChatResponse askQuestion(AskQuestionRequest request) {
        User currentUser = userService.getCurrentAuthenticatedUser();

        // 1. Resolve or create chat session
        ChatSession session;
        if (request.getSessionUuid() != null && !request.getSessionUuid().isBlank()) {
            session = sessionRepository.findBySessionUuidAndUser(request.getSessionUuid(), currentUser)
                    .orElseGet(() -> createNewSession(currentUser, request.getQuestion()));
        } else {
            session = createNewSession(currentUser, request.getQuestion());
        }

        // 2. Save User Message
        ChatMessage userMsg = ChatMessage.builder()
                .session(session)
                .sender(MessageSender.USER)
                .content(request.getQuestion().trim())
                .isFallback(false)
                .feedback(FeedbackType.NONE)
                .build();
        messageRepository.save(userMsg);

        // 3. RAG Retrieval from approved documents
        List<RetrievedContext> contexts = documentRetriever.retrieveRelevantContext(request.getQuestion());

        // 4. Generate Grounded AI Answer
        AiService aiService = aiServiceFactory.getAiService();
        ChatResponse aiResponse = aiService.generateAnswer(request.getQuestion(), contexts);

        // 5. Save Assistant Message
        ChatMessage assistantMsg = ChatMessage.builder()
                .session(session)
                .sender(MessageSender.ASSISTANT)
                .content(aiResponse.getAnswer())
                .sourceFile(aiResponse.getPrimarySource() != null ? aiResponse.getPrimarySource().getFilename() : null)
                .sourceSection(aiResponse.getPrimarySource() != null ? aiResponse.getPrimarySource().getSection() : null)
                .confidenceScore(aiResponse.getConfidence())
                .isFallback(Boolean.TRUE.equals(aiResponse.getIsFallback()))
                .feedback(FeedbackType.NONE)
                .build();
        ChatMessage savedAssistantMsg = messageRepository.save(assistantMsg);

        // Update session timestamp
        session.setUpdatedAt(Instant.now());
        sessionRepository.save(session);

        aiResponse.setMessageId(savedAssistantMsg.getId());
        aiResponse.setSessionUuid(session.getSessionUuid());

        return aiResponse;
    }

    private ChatSession createNewSession(User user, String firstQuestion) {
        String sessionTitle = firstQuestion != null && firstQuestion.length() > 40
                ? firstQuestion.substring(0, 37) + "..."
                : (firstQuestion != null ? firstQuestion : "New Conversation");

        ChatSession session = ChatSession.builder()
                .sessionUuid(UUID.randomUUID().toString())
                .user(user)
                .title(sessionTitle)
                .build();
        return sessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public List<ChatSessionDto> getUserSessions() {
        User currentUser = userService.getCurrentAuthenticatedUser();
        return sessionRepository.findByUserOrderByUpdatedAtDesc(currentUser).stream()
                .map(this::mapSessionToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChatSessionDto getSessionDetails(String sessionUuid) {
        User currentUser = userService.getCurrentAuthenticatedUser();
        ChatSession session = sessionRepository.findBySessionUuidAndUser(sessionUuid, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Chat session not found: " + sessionUuid));
        return mapSessionToDto(session);
    }

    @Transactional
    public void recordFeedback(Long messageId, FeedbackType feedback) {
        ChatMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));
        message.setFeedback(feedback);
        messageRepository.save(message);
    }

    private ChatSessionDto mapSessionToDto(ChatSession session) {
        List<ChatMessageDto> msgDtos = session.getMessages().stream()
                .map(m -> ChatMessageDto.builder()
                        .id(m.getId())
                        .sender(m.getSender())
                        .content(m.getContent())
                        .sourceFile(m.getSourceFile())
                        .sourceSection(m.getSourceSection())
                        .confidenceScore(m.getConfidenceScore())
                        .isFallback(m.getIsFallback())
                        .feedback(m.getFeedback())
                        .createdAt(m.getCreatedAt())
                        .build())
                .toList();

        return ChatSessionDto.builder()
                .sessionUuid(session.getSessionUuid())
                .title(session.getTitle())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .messages(msgDtos)
                .build();
    }
}
