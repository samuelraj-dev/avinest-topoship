package com.topoship.avinestbackend.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Date;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey key;
    private final long accessTokenValidity;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-validity}") long validity
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenValidity = validity;
    }

    public String generateAccessToken(Long userId, String role, UUID sessionId) {
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(userId.toString())
                .claim("sid", sessionId.toString())
                .claim("role", role)
                .claim("type", "access")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(accessTokenValidity)))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public static String sha256(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(
                    md.digest(value.getBytes(StandardCharsets.UTF_8))
            );
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
