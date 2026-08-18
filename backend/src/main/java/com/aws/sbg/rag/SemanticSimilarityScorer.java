package com.aws.sbg.rag;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class SemanticSimilarityScorer {

    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he", "in",
            "is", "it", "its", "of", "on", "that", "the", "to", "was", "were", "will", "with",
            "what", "when", "where", "who", "which", "how", "do", "does", "did", "can", "could",
            "i", "my", "me", "you", "your", "we", "our", "us", "they", "them", "their", "please", "tell",
            "about", "there"
    ));

    public double calculateSimilarity(String query, String sectionHeading, String documentFilename, String content) {
        if (query == null || content == null || query.isBlank() || content.isBlank()) {
            return 0.0;
        }

        List<String> queryTokens = tokenize(query);
        if (queryTokens.isEmpty()) {
            return 0.0;
        }

        String normalizedHeading = sectionHeading != null ? sectionHeading.toLowerCase() : "";
        String normalizedFilename = documentFilename != null ? documentFilename.toLowerCase().replace(".md", "").replace("-", " ") : "";
        String normalizedContent = content.toLowerCase();

        double contentScore = 0.0;
        double headingScore = 0.0;
        double filenameScore = 0.0;
        double phraseMatchScore = 0.0;

        int totalSignificantTokens = 0;
        int matchedTokens = 0;

        String cleanQuery = query.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").trim();
        if (cleanQuery.length() > 4 && normalizedContent.contains(cleanQuery)) {
            phraseMatchScore += 1.0;
        }
        if (cleanQuery.length() > 4 && normalizedHeading.contains(cleanQuery)) {
            phraseMatchScore += 0.8;
        }

        for (String token : queryTokens) {
            boolean isStop = STOP_WORDS.contains(token);
            boolean isDomainGeneric = "aws".equals(token) || "amazon".equals(token);
            double weight = isStop ? 0.05 : (isDomainGeneric ? 0.25 : 1.0);
            if (!isStop && !isDomainGeneric) {
                totalSignificantTokens++;
            }

            int countInContent = countOccurrences(normalizedContent, token);
            if (countInContent > 0) {
                if (!isStop && !isDomainGeneric) matchedTokens++;
                double termSaturation = (countInContent * 3.0) / (countInContent + 1.0);
                contentScore += termSaturation * weight;
            }

            if (normalizedHeading.contains(token)) {
                headingScore += 3.0 * weight;
            }

            if (normalizedFilename.contains(token)) {
                filenameScore += 3.5 * weight;
            }
        }

        // If query has substantive tokens but none appear in this document chunk, reject false match
        if (totalSignificantTokens >= 2 && matchedTokens == 0 && phraseMatchScore == 0.0) {
            return 0.0;
        }

        if (matchedTokens == 0 && headingScore == 0.0 && filenameScore == 0.0 && phraseMatchScore == 0.0) {
            return 0.0;
        }

        double coverageRatio = totalSignificantTokens > 0 ? (double) matchedTokens / totalSignificantTokens : 0.5;

        // Composite weighted score
        double rawScore = (contentScore * 0.45) + (headingScore * 0.25) + (filenameScore * 0.20) + (phraseMatchScore * 0.10);
        
        // Generous sigmoid normalization
        double normalized = (rawScore / (rawScore + 1.8)) * (0.45 + (0.55 * coverageRatio));
        
        return Math.min(1.0, Math.max(0.0, normalized));
    }

    private List<String> tokenize(String text) {
        List<String> tokens = new ArrayList<>();
        Pattern pattern = Pattern.compile("[a-zA-Z0-9_-]+");
        Matcher matcher = pattern.matcher(text.toLowerCase());
        while (matcher.find()) {
            String token = matcher.group();
            if (token.length() > 1) {
                tokens.add(token);
            }
        }
        return tokens;
    }

    private int countOccurrences(String text, String word) {
        int count = 0;
        int idx = 0;
        while ((idx = text.indexOf(word, idx)) != -1) {
            count++;
            idx += word.length();
        }
        return count;
    }
}
