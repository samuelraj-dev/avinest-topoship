package com.topoship.avinestbackend.auth.service;

import com.topoship.avinestbackend.auth.JwtService;
import com.topoship.avinestbackend.auth.repository.SessionRepository;
import com.topoship.jooq.generated.tables.records.SessionsRecord;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class SessionService {

    private final SessionRepository sessionRepository;

    public SessionService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public void createSession(UUID sessionId, Long userId, UUID deviceId, String accessToken, String refreshToken) {
        sessionRepository.createOne(sessionId, userId, deviceId, accessToken, refreshToken);
    }

    public Optional<SessionsRecord> findActiveById(UUID id) {
        return sessionRepository.findActiveById(id);
    }

    public Optional<SessionsRecord> findActiveByAccessToken(String token) {
        return sessionRepository.findActiveByAccessToken(token);
    }

    public SessionsRecord findActiveByRefreshToken(String refreshToken) {
        return sessionRepository.findActiveByRefreshToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
    }

    public void rotateRefreshToken(
            UUID sessionId,
            String newRefreshToken
    ) {
        sessionRepository.updateRefreshToken(
                sessionId,
                newRefreshToken
        );
    }

    public void touch(UUID sessionId) {
        sessionRepository.updateLastAccess(sessionId);
    }

    public void revoke(UUID sessionId, String reason) {
        sessionRepository.revoke(sessionId, LocalDateTime.now(), reason);
    }
}
