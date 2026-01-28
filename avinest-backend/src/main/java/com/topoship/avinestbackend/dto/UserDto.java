package com.topoship.avinestbackend.dto;

import java.time.LocalDateTime;

public record UserDto(
    Long id,
    String fullName,
    String username,
    String email,
    String phone,
    String role,
    String avatarUrl,
    LocalDateTime createdAt
) {}
