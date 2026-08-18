package com.aws.sbg.controller;

import com.aws.sbg.dto.common.ApiResponse;
import com.aws.sbg.dto.smoketest.SmokeTestSuiteResponse;
import com.aws.sbg.service.SmokeTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/smoke-test")
@RequiredArgsConstructor
public class SmokeTestController {

    private final SmokeTestService smokeTestService;

    @GetMapping("/run")
    public ResponseEntity<ApiResponse<SmokeTestSuiteResponse>> runSmokeTests() {
        SmokeTestSuiteResponse suite = smokeTestService.runSmokeTests();
        return ResponseEntity.ok(ApiResponse.success("Smoke test suite completed", suite));
    }
}
