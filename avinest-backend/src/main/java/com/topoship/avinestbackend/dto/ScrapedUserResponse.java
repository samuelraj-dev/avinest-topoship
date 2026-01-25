package com.topoship.avinestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ScrapedUserResponse(
        String username,
        @JsonProperty("full_name")
        String fullName,
        String email,
        String phone,
        String role,
        @JsonProperty("avatar_url")
        String avatarUrl,
        @JsonProperty("profile_href")
        String profileHref,
        ScrapedStudent student,
        ScrapedFaculty faculty
) {}