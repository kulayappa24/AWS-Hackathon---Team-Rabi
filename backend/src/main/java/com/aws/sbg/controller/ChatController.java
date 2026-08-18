package com.aws.sbg.controller;

import com.aws.sbg.dto.chat.*;
import com.aws.sbg.dto.common.ApiResponse;
import com.aws.sbg.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<ChatResponse>> askQuestion(@Valid @RequestBody AskQuestionRequest request) {
        ChatResponse response = chatService.askQuestion(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<ChatSessionDto>>> getUserSessions() {
        List<ChatSessionDto> sessions = chatService.getUserSessions();
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @GetMapping("/sessions/{sessionUuid}")
    public ResponseEntity<ApiResponse<ChatSessionDto>> getSessionDetails(@PathVariable String sessionUuid) {
        ChatSessionDto session = chatService.getSessionDetails(sessionUuid);
        return ResponseEntity.ok(ApiResponse.success(session));
    }

    @PostMapping("/messages/{messageId}/feedback")
    public ResponseEntity<ApiResponse<String>> recordFeedback(@PathVariable Long messageId,
                                                              @Valid @RequestBody FeedbackRequest request) {
        chatService.recordFeedback(messageId, request.getFeedback());
        return ResponseEntity.ok(ApiResponse.success("Feedback recorded successfully", null));
    }
}
