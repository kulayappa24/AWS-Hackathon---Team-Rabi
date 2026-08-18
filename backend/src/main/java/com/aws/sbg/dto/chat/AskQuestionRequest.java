package com.aws.sbg.dto.chat;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AskQuestionRequest {

    @NotBlank(message = "Question content cannot be blank")
    private String question;

    private String sessionUuid;
}
