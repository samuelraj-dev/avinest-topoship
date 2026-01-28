package com.topoship.avinestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record StudentDto(
    Long id,
    @JsonProperty("register_number")
    String registerNumber,
    Boolean hosteler,
    @JsonProperty("lateral_entry")
    Boolean lateralEntry,
    LocalDate dob,
    String gender,
    @JsonProperty("current_section_id")
    Long currentSectionId,
    LocalDateTime createdAt
) {}
