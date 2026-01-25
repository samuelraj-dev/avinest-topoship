package com.topoship.avinestbackend.auth.repository;

import com.topoship.avinestbackend.auth.JwtService;
import com.topoship.jooq.generated.tables.Sessions;
import com.topoship.jooq.generated.tables.records.DevicesRecord;
import com.topoship.jooq.generated.tables.records.SessionsRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static com.topoship.jooq.generated.tables.Devices.DEVICES;
import static com.topoship.jooq.generated.tables.Sessions.SESSIONS;

@Repository
public class SessionRepository {

    private final DSLContext dsl;

    public SessionRepository(DSLContext dsl) {
        this.dsl = dsl;
    }


    public Optional<SessionsRecord> findActiveByAccessToken(String token) {
        String hash = JwtService.sha256(token);
        return Optional.ofNullable(
                dsl.selectFrom(SESSIONS)
                        .where(SESSIONS.ACCESS_TOKEN_HASH.eq(hash))
                        .and(SESSIONS.REVOKED.eq(false))
                        .and(SESSIONS.EXPIRES_AT.gt(LocalDateTime.now()))
                        .fetchOne()
        );
    }

    public Optional<SessionsRecord> findActiveByRefreshToken(String refreshToken) {
        String hash = JwtService.sha256(refreshToken);
        return dsl.selectFrom(SESSIONS)
                .where(SESSIONS.REFRESH_TOKEN_HASH.eq(hash))
                .and(SESSIONS.REVOKED.eq(false))
                .and(SESSIONS.EXPIRES_AT.gt(LocalDateTime.now()))
                .fetchOptional();
    }

    public void updateRefreshToken(UUID sessionId, String refreshToken) {
        String hash = JwtService.sha256(refreshToken);
        dsl.update(SESSIONS)
                .set(SESSIONS.REFRESH_TOKEN_HASH, hash)
                .where(SESSIONS.SESSION_ID.eq(sessionId))
                .and(SESSIONS.REVOKED.eq(false))
                .execute();
    }



    public void createOne(UUID sessionId, Long userId, UUID deviceId, String accessToken, String refreshToken) {
        LocalDateTime now = LocalDateTime.now();
        dsl.insertInto(SESSIONS)
                .set(SESSIONS.SESSION_ID, sessionId)
                .set(SESSIONS.USER_ID, userId)
                .set(SESSIONS.DEVICE_ID, deviceId)
                .set(SESSIONS.ACCESS_TOKEN_HASH, JwtService.sha256(accessToken))
                .set(SESSIONS.REFRESH_TOKEN_HASH, JwtService.sha256(refreshToken))
                .set(SESSIONS.CREATED_AT, now)
                .set(SESSIONS.EXPIRES_AT, now.plusDays(30))
                .execute();
    }

    public void updateLastAccess(UUID sessionId) {
        dsl.update(SESSIONS)
                .set(SESSIONS.LAST_ACCESS_AT, LocalDateTime.now())
                .where(SESSIONS.SESSION_ID.eq(sessionId))
                .execute();
    }

    public void revoke(
            UUID sessionId,
            LocalDateTime revokedAt,
            String reason
    ) {
        dsl.update(SESSIONS)
                .set(SESSIONS.REVOKED, true)
                .set(SESSIONS.REVOKED_AT, revokedAt)
                .set(SESSIONS.REVOKE_REASON, reason)
                .where(SESSIONS.SESSION_ID.eq(sessionId))
                .and(SESSIONS.REVOKED.eq(false))
                .execute();
    }
}
