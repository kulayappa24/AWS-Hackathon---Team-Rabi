package com.aws.sbg.dto.chat;

import com.aws.sbg.entity.FeedbackType;
import com.aws.sbg.entity.MessageSender;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {
    private Long id;
    private MessageSender sender;
    private String content;
    private String sourceFile;
    private String sourceSection;
    private Double confidenceScore;
    private Boolean isFallback;
    private FeedbackType feedback;
    private Instant createdAt;
}
