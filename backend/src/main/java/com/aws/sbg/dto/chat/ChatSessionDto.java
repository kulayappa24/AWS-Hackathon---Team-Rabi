package com.aws.sbg.dto.chat;

import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSessionDto {
    private String sessionUuid;
    private String title;
    private Instant createdAt;
    private Instant updatedAt;
    @Builder.Default
    private List<ChatMessageDto> messages = new ArrayList<>();
}
