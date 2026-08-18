package com.aws.sbg.controller;

import com.aws.sbg.ai.AiService;
import com.aws.sbg.ai.AiServiceFactory;
import com.aws.sbg.dto.chat.ChatResponse;
import com.aws.sbg.dto.evaluator.EvaluatorAskRequest;
import com.aws.sbg.dto.evaluator.EvaluatorAskResponse;
import com.aws.sbg.dto.evaluator.EvaluatorSourceDto;
import com.aws.sbg.rag.DocumentRetriever;
import com.aws.sbg.rag.RetrievedContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EvaluatorAskController {

    private final DocumentRetriever documentRetriever;
    private final AiServiceFactory aiServiceFactory;

    @PostMapping({"/ask", "/api/ask"})
    public ResponseEntity<EvaluatorAskResponse> evaluateQuestion(@Valid @RequestBody EvaluatorAskRequest request) {
        String question = request.getQuestion() != null ? request.getQuestion().trim() : "";

        // 1. Retrieve relevant grounded chunks
        List<RetrievedContext> contexts = documentRetriever.retrieveRelevantContext(question);

        // 2. Generate grounded answer
        AiService aiService = aiServiceFactory.getAiService();
        ChatResponse aiResponse = aiService.generateAnswer(question, contexts);

        // 3. Build strict Hackathon Evaluator sources format
        List<EvaluatorSourceDto> sources = new ArrayList<>();
        int rank = 1;
        for (RetrievedContext ctx : contexts) {
            sources.add(EvaluatorSourceDto.builder()
                    .document(ctx.getFilename())
                    .chunkId("chunk-" + ctx.getChunkId())
                    .rank(rank++)
                    .score(Math.round(ctx.getScore() * 100.0) / 100.0)
                    .build());
        }

        EvaluatorAskResponse response = EvaluatorAskResponse.builder()
                .answer(aiResponse.getAnswer())
                .sources(sources)
                .build();

        // Exact unwrapped top-level JSON response for evaluators & test scripts
        return ResponseEntity.ok(response);
    }
}
