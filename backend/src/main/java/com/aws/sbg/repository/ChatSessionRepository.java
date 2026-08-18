package com.aws.sbg.repository;

import com.aws.sbg.entity.ChatSession;
import com.aws.sbg.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUserOrderByUpdatedAtDesc(User user);
    Optional<ChatSession> findBySessionUuidAndUser(String sessionUuid, User user);
    Optional<ChatSession> findBySessionUuid(String sessionUuid);
}
