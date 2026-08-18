package com.aws.sbg.repository;

import com.aws.sbg.entity.Document;
import com.aws.sbg.entity.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {
    List<DocumentChunk> findByDocument(Document document);
    List<DocumentChunk> findByDocumentOrderByChunkIndexAsc(Document document);
    List<DocumentChunk> findByDocumentFilename(String documentFilename);

    @Modifying
    @Transactional
    void deleteByDocument(Document document);
}
