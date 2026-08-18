package com.aws.sbg.dto.document;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentDto {
    private Long id;
    private String filename;
    private String title;
    private Integer totalChunks;
    private Long fileSizeBytes;
    private String status;
    private Instant createdAt;
}
