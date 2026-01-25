package com.topoship.avinestbackend.auth.service;

import com.topoship.avinestbackend.auth.JwtService;
import com.topoship.avinestbackend.auth.PasswordService;
import com.topoship.avinestbackend.dto.LoginRequest;
import com.topoship.avinestbackend.dto.LoginResponse;
import com.topoship.avinestbackend.dto.TokenResponse;
import com.topoship.avinestbackend.repository.UserRepository;
import com.topoship.avinestbackend.scraper.LoginScraper;
import com.topoship.avinestbackend.services.UserService;
import com.topoship.jooq.generated.tables.records.AppUsersRecord;
import com.topoship.jooq.generated.tables.records.SessionsRecord;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final LoginScraper loginScraper;
    private final UserService userService;
    private final DeviceService deviceService;
    private final JwtService jwtService;
    private final SessionService sessionService;
    private final long accessTokenValidity;

    public AuthService(UserRepository userRepository, LoginScraper loginScraper, UserService userService, DeviceService deviceService, JwtService jwtService, SessionService sessionService, @Value("${jwt.access-token-validity:900000}") long accessTokenValidity) {
        this.userRepository = userRepository;
        this.loginScraper = loginScraper;
        this.userService = userService;
        this.deviceService = deviceService;
        this.jwtService = jwtService;
        this.sessionService = sessionService;
        this.accessTokenValidity = accessTokenValidity;
    }

    public LoginResponse login(
            LoginRequest loginRequest,
            HttpServletRequest httpServletRequest
    ) {
        AppUsersRecord user = userRepository.findByUsername(loginRequest.username())
                .orElseGet(() -> {
                    var scrapedUser = loginScraper.login(loginRequest);
                    if (scrapedUser == null) {
                        throw new RuntimeException("Unauthorized");
                    }
                    return userService.createFromScrape(loginRequest, scrapedUser);
                });

        if (!PasswordService.verify(user.getPasswordHash(), loginRequest.password().toCharArray())) {
            throw new RuntimeException("Unauthorized");
        }

        UUID deviceId = deviceService.getOrCreate(user.getId(), httpServletRequest);
        UUID sessionId = UUID.randomUUID();

        String accessToken = jwtService.generateAccessToken(
                user.getId(),
                user.getRole(),
                sessionId
        );

        String refreshToken = UUID.randomUUID().toString();

        sessionService.createSession(
                sessionId,
                user.getId(),
                deviceId,
                accessToken,
                refreshToken
        );

        return new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getFullName(),
                user.getRole(),
                user.getAvatarUrl(),
                new TokenResponse(accessToken, refreshToken, 900L, "Bearer")
        );
    }

    public TokenResponse refresh(String refreshToken) {
        System.out.print(refreshToken);
        SessionsRecord session = sessionService.findActiveByRefreshToken(refreshToken);

        UUID sessionId = session.getSessionId();
        Long userId = session.getUserId();

        String accessToken = jwtService.generateAccessToken(userId, userService.getUserRoleById(userId), sessionId);

        String newRefreshToken = UUID.randomUUID().toString();
        sessionService.rotateRefreshToken(sessionId, newRefreshToken);


        return new TokenResponse(
                accessToken,
                newRefreshToken,
                accessTokenValidity / 1000,
                "Bearer"
        );
    }
}
