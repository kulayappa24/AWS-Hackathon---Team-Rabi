package com.aws.sbg.dto.chat;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private Long messageId;
    private String sessionUuid;
    private String answer;
    private SourceCitationDto primarySource;
    @Builder.Default
    private List<SourceCitationDto> allSources = new ArrayList<>();
    private Double confidence;
    private Boolean isFallback;
    private String fallbackContact;
}
