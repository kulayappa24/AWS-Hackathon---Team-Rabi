package com.aws.sbg.dto.evaluator;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EvaluatorSourceDto {

    @JsonProperty("document")
    private String document;

    @JsonProperty("chunk_id")
    private String chunkId;

    @JsonProperty("rank")
    private Integer rank;

    @JsonProperty("score")
    private Double score;
}
