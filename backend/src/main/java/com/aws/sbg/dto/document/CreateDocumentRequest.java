package com.aws.sbg.dto.document;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDocumentRequest {

    @NotBlank(message = "Filename is required (e.g. event-day-briefing.md)")
    private String filename;

    private String title;

    @NotBlank(message = "Document markdown content cannot be empty")
    private String content;
}
