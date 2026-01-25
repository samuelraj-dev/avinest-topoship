package com.topoship.avinestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record LoginResponse(
        Long id,
        String username,
        String email,
        String phone,
        @JsonProperty("full_name")
        String fullName,
        String role,
        @JsonProperty("avatar_url")
        String avatarUrl,
        TokenResponse token
) {}
