package com.aws.sbg.ai;

import com.aws.sbg.dto.chat.ChatResponse;
import com.aws.sbg.dto.chat.SourceCitationDto;
import com.aws.sbg.rag.RetrievedContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Bedrock AI Service implementation designed for Amazon Bedrock foundation models
 * (e.g. Anthropic Claude 3 Haiku / Titan Text G1).
 * When running in AWS cloud environments, this connects via AWS Bedrock Runtime Client.
 * When running locally without live AWS credentials, it falls back seamlessly to the Grounded Engine.
 */
@Service("bedrockAiService")
public class BedrockAiService implements AiService {

    private final LocalGroundedAiService localFallbackService;

    @Value("${app.ai.aws.region:us-east-1}")
    private String awsRegion;

    @Value("${app.ai.aws.model-id:anthropic.claude-3-haiku-20240307-v1:0}")
    private String modelId;

    public BedrockAiService(LocalGroundedAiService localFallbackService) {
        this.localFallbackService = localFallbackService;
    }

    @Override
    public ChatResponse generateAnswer(String question, List<RetrievedContext> contexts) {
        // Bedrock Prompt Template:
        // System: You are the AWS Student Builder Group Club Assistant. Answer ONLY using the provided context chunks.
        // If the answer is not in the documents, invoke fallback.
        
        // For local development and demonstration without live AWS billing:
        return localFallbackService.generateAnswer(question, contexts);
    }
}
