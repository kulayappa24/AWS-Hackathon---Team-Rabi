package com.aws.sbg.dto.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {
    private boolean success;
    private String message;
    private Object data;

    public static MessageResponse of(boolean success, String message) {
        return new MessageResponse(success, message, null);
    }

    public static MessageResponse of(boolean success, String message, Object data) {
        return new MessageResponse(success, message, data);
    }
}
