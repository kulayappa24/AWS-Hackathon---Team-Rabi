package com.aws.sbg.dto.smoketest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmokeTestResultDto {
    private String id;
    private String name;
    private String question;
    private String expectedDocument;
    private String actualDocument;
    private String answer;
    private boolean passed;
    private double score;
    private long latencyMs;
    private List<String> citedSources;
}
