package com.aws.sbg.dto.chat;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SourceCitationDto {
    private String filename;
    private String section;
    private Double relevanceScore;
    private String snippet;
}
