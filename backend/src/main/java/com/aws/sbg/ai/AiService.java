package com.aws.sbg.ai;

import com.aws.sbg.dto.chat.ChatResponse;
import com.aws.sbg.rag.RetrievedContext;

import java.util.List;

public interface AiService {
    
    /**
     * Generates a grounded answer for a user's question given the retrieved document chunks.
     * If retrieved contexts are empty or below threshold, returns a safe fallback message.
     */
    ChatResponse generateAnswer(String question, List<RetrievedContext> contexts);
}
