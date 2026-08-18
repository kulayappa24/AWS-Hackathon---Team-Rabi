package com.aws.sbg.dto.user;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String campusId;
    private Boolean isActive;
    private Instant createdAt;
}
