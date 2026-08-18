package com.aws.sbg.rag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SectionChunk {
    private String filename;
    private String title;
    private String sectionHeading;
    private int chunkIndex;
    private String content;
    private String metadataJson;
}
