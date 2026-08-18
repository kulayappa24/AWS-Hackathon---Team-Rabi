package com.aws.sbg;

import com.aws.sbg.rag.DocumentRetriever;
import com.aws.sbg.rag.MarkdownDocumentParser;
import com.aws.sbg.rag.RetrievedContext;
import com.aws.sbg.rag.SectionChunk;
import com.aws.sbg.service.DocumentIngestionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("local")
class RAGRetrievalTest {

    @Autowired
    private DocumentIngestionService ingestionService;

    @Autowired
    private DocumentRetriever documentRetriever;

    @Autowired
    private MarkdownDocumentParser parser;

    @BeforeEach
    void setUp() {
        ingestionService.ingestAllDocuments();
    }

    @Test
    void testMarkdownParserSections() {
        String sampleMd = "# Test Title\n\nIntro content.\n\n## Section 1\nContent for section 1.\n\n## Section 2\nContent for section 2.";
        List<SectionChunk> chunks = parser.parseSections("test.md", sampleMd);

        assertEquals(3, chunks.size());
        assertEquals("Test Title", chunks.get(0).getSectionHeading());
        assertEquals("Section 1", chunks.get(1).getSectionHeading());
        assertEquals("Section 2", chunks.get(2).getSectionHeading());
        assertEquals("test.md", chunks.get(1).getFilename());
    }

    @Test
    void testRetrieveWorkshopQuestion() {
        List<RetrievedContext> contexts = documentRetriever.retrieveRelevantContext("When is the next workshop on RAG chatbots?");

        assertFalse(contexts.isEmpty(), "Should retrieve workshop document chunks");
        RetrievedContext topMatch = contexts.get(0);
        assertEquals("06-workshop-index.md", topMatch.getFilename());
        assertTrue(topMatch.getContent().toLowerCase().contains("rag chatbots on bedrock") ||
                   topMatch.getContent().toLowerCase().contains("next workshop"));
    }

    @Test
    void testRetrieveBuilderCenterPublish() {
        List<RetrievedContext> contexts = documentRetriever.retrieveRelevantContext("How do I publish an article on Builder Center?");

        assertFalse(contexts.isEmpty(), "Should retrieve builder center publish chunk");
        RetrievedContext topMatch = contexts.get(0);
        assertEquals("03-builder-center-publish.md", topMatch.getFilename());
    }

    @Test
    void testRetrieveMeetingTimes() {
        List<RetrievedContext> contexts = documentRetriever.retrieveRelevantContext("When are club general meetings held?");

        assertFalse(contexts.isEmpty(), "Should retrieve onboarding FAQ");
        RetrievedContext topMatch = contexts.get(0);
        assertEquals("01-onboarding-faq.md", topMatch.getFilename());
        assertTrue(topMatch.getContent().contains("Wednesdays at 6:00 PM"));
    }
}
