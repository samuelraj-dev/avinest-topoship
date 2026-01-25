package com.topoship.avinestbackend.auth;

import java.util.UUID;

public record AuthenticatedUser(
        Long userId,
        String role,
        UUID sessionId
) {}
