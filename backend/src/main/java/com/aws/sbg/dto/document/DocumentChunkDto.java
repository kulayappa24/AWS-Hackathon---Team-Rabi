package com.aws.sbg.dto.document;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentChunkDto {
    private Long id;
    private Long documentId;
    private String documentFilename;
    private String sectionHeading;
    private Integer chunkIndex;
    private String content;
}
