package com.aws.sbg;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class EvaluatorAskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testEvaluatorPostAskScheduleQuestion() throws Exception {
        Map<String, String> request = Map.of(
                "question", "What time is lunch today and where is judging happening?"
        );

        mockMvc.perform(post("/ask")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer", notNullValue()))
                .andExpect(jsonPath("$.answer", containsString("Room 204")))
                .andExpect(jsonPath("$.sources", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.sources[0].document", is("event-day-briefing.md")))
                .andExpect(jsonPath("$.sources[0].rank", is(1)))
                .andExpect(jsonPath("$.sources[0].score", greaterThan(0.2)));
    }

    @Test
    void testEvaluatorPostAskBuilderCenterQuestion() throws Exception {
        Map<String, String> request = Map.of(
                "question", "How do I publish an article on AWS Builder Center?"
        );

        mockMvc.perform(post("/ask")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer", notNullValue()))
                .andExpect(jsonPath("$.sources", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.sources[0].document", is("03-builder-center-publish.md")));
    }

    @Test
    void testEvaluatorPostAskFallbackQuestion() throws Exception {
        Map<String, String> request = Map.of(
                "question", "What is the secret recipe for Martian ice cream?"
        );

        mockMvc.perform(post("/ask")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer", containsString("Shanmukha Sasi Sadineni")))
                .andExpect(jsonPath("$.answer", containsString("sadinenisasi@gmail.com")));
    }
}
