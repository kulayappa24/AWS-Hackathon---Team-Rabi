package com.aws.sbg.dto.evaluator;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluatorAskRequest {
    @NotBlank(message = "Question cannot be blank")
    @JsonProperty("question")
    private String question;
}
