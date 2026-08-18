package com.aws.sbg.dto.chat;

import com.aws.sbg.entity.FeedbackType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackRequest {

    @NotNull(message = "Feedback type is required")
    private FeedbackType feedback;
}
