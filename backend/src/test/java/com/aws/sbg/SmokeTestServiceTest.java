package com.aws.sbg;

import com.aws.sbg.dto.smoketest.SmokeTestSuiteResponse;
import com.aws.sbg.service.SmokeTestService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("local")
class SmokeTestServiceTest {

    @Autowired
    private SmokeTestService smokeTestService;

    @Test
    void testAllThreeSmokeTestsPass() {
        SmokeTestSuiteResponse response = smokeTestService.runSmokeTests();

        assertNotNull(response);
        assertEquals(3, response.getTotalTests());
        assertEquals(3, response.getPassedTests());
        assertEquals(0, response.getFailedTests());
        assertTrue(response.isAllPassed());
        assertTrue(response.getTotalDurationMs() > 0);

        // Verify Question 1 specifically references event-day-briefing.md
        var test1 = response.getTests().get(0);
        assertEquals("smoke-1", test1.getId());
        assertEquals("event-day-briefing.md", test1.getActualDocument());
        assertTrue(test1.isPassed());
    }
}
