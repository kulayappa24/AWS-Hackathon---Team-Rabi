package com.aws.sbg.rag;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class MarkdownDocumentParser {

    /**
     * Parses a markdown document into distinct section chunks preserving:
     * - document filename
     * - document title
     * - section heading
     * - complete original section content (without summarization or alteration)
     */
    public List<SectionChunk> parseSections(String filename, String markdownContent) {
        List<SectionChunk> chunks = new ArrayList<>();
        if (markdownContent == null || markdownContent.isBlank()) {
            return chunks;
        }

        String[] lines = markdownContent.split("\\r?\\n");
        String documentTitle = extractDocumentTitle(lines, filename);
        
        String currentHeading = "Overview";
        StringBuilder currentSectionContent = new StringBuilder();
        int chunkIndex = 0;

        for (String line : lines) {
            String trimmed = line.trim();

            if (trimmed.startsWith("# ")) {
                // Main Document title - if we have accumulated content before this, save it
                if (currentSectionContent.length() > 0) {
                    chunks.add(buildChunk(filename, documentTitle, currentHeading, chunkIndex++, currentSectionContent.toString().trim()));
                    currentSectionContent.setLength(0);
                }
                documentTitle = trimmed.substring(2).trim();
                currentHeading = documentTitle;
                currentSectionContent.append(line).append("\n");
            } else if (trimmed.startsWith("## ")) {
                // Section boundary (H2)
                if (currentSectionContent.length() > 0) {
                    chunks.add(buildChunk(filename, documentTitle, currentHeading, chunkIndex++, currentSectionContent.toString().trim()));
                    currentSectionContent.setLength(0);
                }
                currentHeading = trimmed.replaceFirst("^##\\s*", "").trim();
                currentSectionContent.append(line).append("\n");
            } else {
                currentSectionContent.append(line).append("\n");
            }
        }

        // Add remaining section
        if (currentSectionContent.length() > 0) {
            chunks.add(buildChunk(filename, documentTitle, currentHeading, chunkIndex++, currentSectionContent.toString().trim()));
        }

        return chunks;
    }

    private String extractDocumentTitle(String[] lines, String fallbackFilename) {
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.startsWith("# ")) {
                return trimmed.substring(2).trim();
            }
        }
        return fallbackFilename.replace(".md", "").replace("-", " ");
    }

    private SectionChunk buildChunk(String filename, String title, String heading, int index, String content) {
        return SectionChunk.builder()
                .filename(filename)
                .title(title)
                .sectionHeading(heading)
                .chunkIndex(index)
                .content(content)
                .metadataJson(String.format("{\"filename\":\"%s\",\"title\":\"%s\",\"section\":\"%s\",\"chunkIndex\":%d}",
                        escapeJson(filename), escapeJson(title), escapeJson(heading), index))
                .build();
    }

    private String escapeJson(String raw) {
        if (raw == null) return "";
        return raw.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
