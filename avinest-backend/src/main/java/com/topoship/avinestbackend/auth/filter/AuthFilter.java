package com.topoship.avinestbackend.auth.filter;

import com.topoship.avinestbackend.auth.AuthenticatedUser;
import com.topoship.avinestbackend.auth.JwtService;
import com.topoship.avinestbackend.auth.repository.SessionRepository;
import com.topoship.avinestbackend.auth.service.SessionService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

public class AuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final SessionService sessionService;

    public AuthFilter(JwtService jwtService, SessionService sessionService) {
        this.jwtService = jwtService;
        this.sessionService = sessionService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

//        return path.startsWith("/api/auth/");
        return path.equals("/api/auth/login")
                || path.equals("/api/auth/refresh")
                || path.startsWith("/api/public/")
                || path.equals("/api/health");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest req, HttpServletResponse res, FilterChain chain
    ) throws IOException, ServletException {
        String header = req.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing Authorization header");
            return;
        }

        String token = header.substring(7);

        try {
            Claims claims = jwtService.parse(token);
            UUID sessionId = UUID.fromString(claims.get("sid", String.class));
            var session = sessionService.findActiveByAccessToken(token)
                    .orElseThrow(() -> new RuntimeException("Invalid Session"));

            sessionService.touch(sessionId);

            req.setAttribute("auth", new AuthenticatedUser(
                    Long.parseLong(claims.getSubject()),
                    claims.get("role", String.class),
                    sessionId
            ));

            chain.doFilter(req, res);
        } catch (Exception e) {
            res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
        }
    }
}
