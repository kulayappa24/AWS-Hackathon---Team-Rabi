package com.aws.sbg.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "chat_messages", indexes = {
    @Index(name = "idx_chat_msg_session", columnList = "session_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageSender sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "source_file", length = 255)
    private String sourceFile;

    @Column(name = "source_section", length = 255)
    private String sourceSection;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "is_fallback", nullable = false)
    @Builder.Default
    private Boolean isFallback = false;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private FeedbackType feedback = FeedbackType.NONE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
