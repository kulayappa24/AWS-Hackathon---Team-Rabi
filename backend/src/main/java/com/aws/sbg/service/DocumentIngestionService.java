package com.aws.sbg.service;

import com.aws.sbg.dto.document.CreateDocumentRequest;
import com.aws.sbg.dto.document.DocumentDetailDto;
import com.aws.sbg.dto.document.DocumentDto;
import com.aws.sbg.dto.document.UpdateDocumentRequest;
import com.aws.sbg.entity.Document;
import com.aws.sbg.entity.DocumentChunk;
import com.aws.sbg.exception.ResourceNotFoundException;
import com.aws.sbg.rag.MarkdownDocumentParser;
import com.aws.sbg.rag.SectionChunk;
import com.aws.sbg.repository.DocumentChunkRepository;
import com.aws.sbg.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentIngestionService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DocumentIngestionService.class);

    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository chunkRepository;
    private final MarkdownDocumentParser parser;

    @Value("${app.rag.documents-path:../documents}")
    private String documentsPath;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("Starting automated startup ingestion of approved club documents from path: {}", documentsPath);
        ingestAllDocuments();
    }

    @Transactional
    public synchronized List<DocumentDto> ingestAllDocuments() {
        List<DocumentDto> ingestedDocuments = new ArrayList<>();
        File docDir = resolveDocumentsDirectory();

        if (docDir.exists() && docDir.isDirectory()) {
            File[] files = docDir.listFiles((dir, name) -> name.endsWith(".md") && !name.toLowerCase().contains("smoke-test"));
            if (files != null && files.length > 0) {
                for (File file : files) {
                    try {
                        String content = Files.readString(file.toPath(), StandardCharsets.UTF_8);
                        Document doc = ingestSingleDocument(file.getName(), content, file.length());
                        ingestedDocuments.add(mapToDto(doc));
                    } catch (IOException | NoSuchAlgorithmException e) {
                        log.error("Failed to ingest file: {}", file.getName(), e);
                    }
                }
                log.info("Document ingestion complete from directory. Total approved documents processed: {}", ingestedDocuments.size());
                return ingestedDocuments;
            }
        }

        // Fallback to classpath:documents/*.md for cloud environments (Elastic Beanstalk / ECS)
        try {
            ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources("classpath:documents/*.md");
            if (resources.length > 0) {
                log.info("Ingesting {} approved documents from classpath resources...", resources.length);
                for (Resource resource : resources) {
                    try {
                        String filename = resource.getFilename();
                        String content = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
                        long size = content.getBytes(StandardCharsets.UTF_8).length;
                        Document doc = ingestSingleDocument(filename != null ? filename : "doc.md", content, size);
                        ingestedDocuments.add(mapToDto(doc));
                    } catch (Exception e) {
                        log.error("Failed to ingest classpath resource: {}", resource.getFilename(), e);
                    }
                }
                log.info("Document ingestion complete from classpath. Total processed: {}", ingestedDocuments.size());
                return ingestedDocuments;
            }
        } catch (IOException e) {
            log.warn("Could not find classpath documents: {}", e.getMessage());
        }

        log.warn("No documents found for ingestion.");
        return ingestedDocuments;
    }

    @Transactional
    public Document ingestSingleDocument(String filename, String content, long fileSizeBytes) throws NoSuchAlgorithmException {
        String checksum = computeSha256(content);
        Document document = documentRepository.findByFilename(filename)
                .orElseGet(() -> Document.builder()
                        .filename(filename)
                        .title(extractTitle(filename, content))
                        .rawContent(content)
                        .fileSizeBytes(fileSizeBytes)
                        .contentChecksum(checksum)
                        .status("INDEXED")
                        .build());

        if (document.getId() == null || !checksum.equals(document.getContentChecksum()) || document.getRawContent() == null) {
            document.setContentChecksum(checksum);
            document.setRawContent(content);
            document.setFileSizeBytes(fileSizeBytes);
            document.setTitle(extractTitle(filename, content));
            document.setStatus("INDEXED");

            Document savedDoc = documentRepository.save(document);

            // Clear old chunks
            chunkRepository.deleteByDocument(savedDoc);

            // Parse verbatim chunks
            List<SectionChunk> sectionChunks = parser.parseSections(filename, content);
            List<DocumentChunk> entityChunks = new ArrayList<>();

            for (SectionChunk sc : sectionChunks) {
                entityChunks.add(DocumentChunk.builder()
                        .document(savedDoc)
                        .documentFilename(filename)
                        .sectionHeading(sc.getSectionHeading())
                        .chunkIndex(sc.getChunkIndex())
                        .content(sc.getContent())
                        .metadataJson(sc.getMetadataJson())
                        .build());
            }

            chunkRepository.saveAll(entityChunks);
            savedDoc.setTotalChunks(entityChunks.size());
            savedDoc = documentRepository.save(savedDoc);

            log.info("Indexed document [{}] -> {} chunks created.", filename, entityChunks.size());
            return savedDoc;
        }

        return document;
    }

    @Transactional
    public DocumentDto publishOrUpdateDocument(CreateDocumentRequest request) {
        try {
            String filename = request.getFilename().trim();
            if (!filename.endsWith(".md")) {
                filename += ".md";
            }
            long size = request.getContent().getBytes(StandardCharsets.UTF_8).length;
            Document doc = ingestSingleDocument(filename, request.getContent(), size);
            if (request.getTitle() != null && !request.getTitle().isBlank()) {
                doc.setTitle(request.getTitle().trim());
                doc = documentRepository.save(doc);
            }
            return mapToDto(doc);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error computing document checksum", e);
        }
    }

    @Transactional
    public DocumentDto updateExistingDocument(Long id, UpdateDocumentRequest request) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

        try {
            long size = request.getContent().getBytes(StandardCharsets.UTF_8).length;
            String checksum = computeSha256(request.getContent());

            document.setContentChecksum(checksum);
            document.setRawContent(request.getContent());
            document.setFileSizeBytes(size);
            if (request.getTitle() != null && !request.getTitle().isBlank()) {
                document.setTitle(request.getTitle().trim());
            } else {
                document.setTitle(extractTitle(document.getFilename(), request.getContent()));
            }
            document.setStatus("INDEXED");
            Document savedDoc = documentRepository.save(document);

            // Re-index chunks
            chunkRepository.deleteByDocument(savedDoc);
            List<SectionChunk> sectionChunks = parser.parseSections(savedDoc.getFilename(), request.getContent());
            List<DocumentChunk> entityChunks = new ArrayList<>();
            for (SectionChunk sc : sectionChunks) {
                entityChunks.add(DocumentChunk.builder()
                        .document(savedDoc)
                        .documentFilename(savedDoc.getFilename())
                        .sectionHeading(sc.getSectionHeading())
                        .chunkIndex(sc.getChunkIndex())
                        .content(sc.getContent())
                        .metadataJson(sc.getMetadataJson())
                        .build());
            }
            chunkRepository.saveAll(entityChunks);
            savedDoc.setTotalChunks(entityChunks.size());
            savedDoc = documentRepository.save(savedDoc);

            log.info("Re-indexed existing document [{}] -> {} chunks created.", savedDoc.getFilename(), entityChunks.size());
            return mapToDto(savedDoc);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error computing document checksum", e);
        }
    }

    @Transactional
    public void deleteDocument(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
        chunkRepository.deleteByDocument(doc);
        documentRepository.delete(doc);
        log.info("Deleted document [{}] and cleared index.", doc.getFilename());
    }

    @Transactional(readOnly = true)
    public DocumentDetailDto getDocumentDetail(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

        String content = doc.getRawContent();
        if (content == null || content.isBlank()) {
            // Reconstruct from chunks if rawContent wasn't populated yet
            List<DocumentChunk> chunks = chunkRepository.findByDocumentOrderByChunkIndexAsc(doc);
            StringBuilder sb = new StringBuilder();
            for (DocumentChunk chunk : chunks) {
                sb.append(chunk.getContent()).append("\n\n");
            }
            content = sb.toString().trim();
        }

        return DocumentDetailDto.builder()
                .id(doc.getId())
                .filename(doc.getFilename())
                .title(doc.getTitle())
                .content(content)
                .totalChunks(doc.getTotalChunks())
                .fileSizeBytes(doc.getFileSizeBytes())
                .status(doc.getStatus())
                .createdAt(doc.getCreatedAt())
                .updatedAt(doc.getUpdatedAt())
                .build();
    }

    private File resolveDocumentsDirectory() {
        File dir = new File(documentsPath);
        if (dir.exists()) {
            return dir;
        }
        File fallback1 = new File("documents");
        if (fallback1.exists()) return fallback1;
        File fallback2 = new File("../documents");
        if (fallback2.exists()) return fallback2;
        File fallback3 = new File("/home/kulayappa/.gemini/antigravity/scratch/club-member-portal/documents");
        if (fallback3.exists()) return fallback3;
        return dir;
    }

    private String extractTitle(String filename, String content) {
        String[] lines = content.split("\\r?\\n");
        for (String line : lines) {
            if (line.trim().startsWith("# ")) {
                return line.trim().substring(2).trim();
            }
        }
        return filename.replace(".md", "").replace("-", " ");
    }

    private String computeSha256(String data) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    private DocumentDto mapToDto(Document doc) {
        return DocumentDto.builder()
                .id(doc.getId())
                .filename(doc.getFilename())
                .title(doc.getTitle())
                .totalChunks(doc.getTotalChunks())
                .fileSizeBytes(doc.getFileSizeBytes())
                .status(doc.getStatus())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
