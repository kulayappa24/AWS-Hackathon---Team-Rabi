package com.aws.sbg.ai;

import com.aws.sbg.dto.chat.ChatResponse;
import com.aws.sbg.dto.chat.SourceCitationDto;
import com.aws.sbg.rag.RetrievedContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service("localAiService")
public class LocalGroundedAiService implements AiService {

    @Value("${app.rag.fallback.leader-name:Shanmukha Sasi Sadineni}")
    private String leaderName;

    @Value("${app.rag.fallback.leader-role:AWS Student Builder Group Leader}")
    private String leaderRole;

    @Value("${app.rag.fallback.leader-email:sadinenisasi@gmail.com}")
    private String leaderEmail;

    @Value("${app.rag.fallback.leader-phone:7396025334}")
    private String leaderPhone;

    @Override
    public ChatResponse generateAnswer(String question, List<RetrievedContext> contexts) {
        String fallbackMessage = String.format(
                "I couldn't find that information in the club documents. Please contact %s, %s, at %s or %s.",
                leaderName, leaderRole, leaderEmail, leaderPhone
        );

        if (contexts == null || contexts.isEmpty()) {
            return ChatResponse.builder()
                    .answer(fallbackMessage)
                    .confidence(0.0)
                    .isFallback(true)
                    .fallbackContact(leaderName + " (" + leaderEmail + " / " + leaderPhone + ")")
                    .allSources(new ArrayList<>())
                    .build();
        }

        RetrievedContext primary = contexts.get(0);

        List<SourceCitationDto> citations = contexts.stream()
                .map(ctx -> SourceCitationDto.builder()
                        .filename(ctx.getFilename())
                        .section(ctx.getSectionHeading())
                        .relevanceScore(ctx.getScore())
                        .snippet(createSnippet(ctx.getContent()))
                        .build())
                .toList();

        SourceCitationDto primaryCitation = citations.get(0);

        // Grounded answer formulation based strictly on the retrieved section content
        String groundedAnswer = formatGroundedAnswer(question, primary, contexts);

        return ChatResponse.builder()
                .answer(groundedAnswer)
                .primarySource(primaryCitation)
                .allSources(citations)
                .confidence(primary.getScore())
                .isFallback(false)
                .build();
    }

    private String formatGroundedAnswer(String question, RetrievedContext primary, List<RetrievedContext> contexts) {
        String content = primary.getContent();
        String section = primary.getSectionHeading();
        String filename = primary.getFilename();

        // Clean up markdown formatting for optimal readability
        StringBuilder answerBuilder = new StringBuilder();

        // Extract key sentences and direct actionable content from the section
        String[] lines = content.split("\\r?\\n");
        List<String> bodyLines = new ArrayList<>();

        for (String line : lines) {
            String trimmed = line.trim();
            // Skip title/header duplicate lines
            if (trimmed.startsWith("# ") || (trimmed.startsWith("## ") && trimmed.contains(section))) {
                continue;
            }
            if (!trimmed.isEmpty()) {
                bodyLines.add(line);
            }
        }

        if (bodyLines.isEmpty()) {
            answerBuilder.append(content);
        } else {
            answerBuilder.append(String.join("\n", bodyLines));
        }

        return answerBuilder.toString().trim();
    }

    private String createSnippet(String content) {
        if (content == null) return "";
        String clean = content.replaceAll("[#*`_]", "").replaceAll("\\s+", " ").trim();
        if (clean.length() <= 180) {
            return clean;
        }
        return clean.substring(0, 177) + "...";
    }
}
