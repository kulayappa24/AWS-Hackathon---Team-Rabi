package com.aws.sbg.rag;

import com.aws.sbg.entity.DocumentChunk;
import com.aws.sbg.repository.DocumentChunkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentRetriever {

    private final DocumentChunkRepository chunkRepository;
    private final SemanticSimilarityScorer similarityScorer;

    @Value("${app.rag.similarity-threshold:0.20}")
    private double similarityThreshold;

    @Value("${app.rag.top-k-results:3}")
    private int topK;

    @Transactional(readOnly = true)
    public List<RetrievedContext> retrieveRelevantContext(String query) {
        List<DocumentChunk> allChunks = chunkRepository.findAll();
        List<RetrievedContext> scoredList = new ArrayList<>();

        for (DocumentChunk chunk : allChunks) {
            double score = similarityScorer.calculateSimilarity(
                    query,
                    chunk.getSectionHeading(),
                    chunk.getDocumentFilename(),
                    chunk.getContent()
            );

            if (score >= similarityThreshold) {
                scoredList.add(RetrievedContext.builder()
                        .chunkId(chunk.getId())
                        .filename(chunk.getDocumentFilename())
                        .title(chunk.getDocument() != null ? chunk.getDocument().getTitle() : chunk.getDocumentFilename())
                        .sectionHeading(chunk.getSectionHeading())
                        .content(chunk.getContent())
                        .score(score)
                        .build());
            }
        }

        // Sort descending by score
        scoredList.sort(Comparator.comparingDouble(RetrievedContext::getScore).reversed());

        return scoredList.stream().limit(topK).toList();
    }
}
