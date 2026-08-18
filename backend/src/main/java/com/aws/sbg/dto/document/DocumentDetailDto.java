package com.aws.sbg.dto.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDetailDto {
    private Long id;
    private String filename;
    private String title;
    private String content;
    private Integer totalChunks;
    private Long fileSizeBytes;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}
