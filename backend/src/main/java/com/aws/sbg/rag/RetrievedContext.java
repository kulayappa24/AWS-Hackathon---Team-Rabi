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
public class RetrievedContext {
    private Long chunkId;
    private String filename;
    private String title;
    private String sectionHeading;
    private String content;
    private double score;
}
