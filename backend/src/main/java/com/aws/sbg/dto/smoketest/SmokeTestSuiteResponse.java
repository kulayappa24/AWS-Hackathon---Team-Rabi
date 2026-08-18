package com.aws.sbg.dto.smoketest;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmokeTestSuiteResponse {
    private int totalTests;
    private int passedTests;
    private int failedTests;
    private boolean allPassed;
    private long totalDurationMs;
    private Instant executedAt;
    private List<SmokeTestResultDto> tests;
}
