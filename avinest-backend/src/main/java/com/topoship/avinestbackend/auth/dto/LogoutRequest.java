package com.topoship.avinestbackend.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record LogoutRequest(
        @JsonProperty("refresh_token")
        String refreshToken
) {}
