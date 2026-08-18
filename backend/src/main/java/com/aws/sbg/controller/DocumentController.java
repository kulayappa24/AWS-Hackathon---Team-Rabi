package com.aws.sbg.controller;

import com.aws.sbg.dto.common.ApiResponse;
import com.aws.sbg.dto.document.CreateDocumentRequest;
import com.aws.sbg.dto.document.DocumentDetailDto;
import com.aws.sbg.dto.document.DocumentDto;
import com.aws.sbg.dto.document.UpdateDocumentRequest;
import com.aws.sbg.service.DocumentIngestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentIngestionService ingestionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getAllDocuments() {
        List<DocumentDto> docs = ingestionService.getAllDocuments();
        return ResponseEntity.ok(ApiResponse.success(docs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentDetailDto>> getDocumentDetail(@PathVariable Long id) {
        DocumentDetailDto detail = ingestionService.getDocumentDetail(id);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DocumentDto>> publishDocument(@Valid @RequestBody CreateDocumentRequest request) {
        DocumentDto doc = ingestionService.publishOrUpdateDocument(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document published & indexed successfully within 60s window", doc));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentDto>> updateDocument(@PathVariable Long id,
                                                                   @Valid @RequestBody UpdateDocumentRequest request) {
        DocumentDto doc = ingestionService.updateExistingDocument(id, request);
        return ResponseEntity.ok(ApiResponse.success("Document updated & re-indexed successfully", doc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id) {
        ingestionService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.success("Document removed and index refreshed", null));
    }

    @PostMapping("/reindex")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> reindexDocuments() {
        List<DocumentDto> docs = ingestionService.ingestAllDocuments();
        return ResponseEntity.ok(ApiResponse.success("Document re-indexing triggered successfully", docs));
    }
}
