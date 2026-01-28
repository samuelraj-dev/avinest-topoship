package com.topoship.avinestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record FacultyDto(
    Long id,
    @JsonProperty("staff_code")
    String staffCode,
    String department,
    String designation,
    @JsonProperty("biometric_id")
    String biometricId,
    @JsonProperty("anna_university_code")
    String annaUniversityCode,
    @JsonProperty("date_of_joining")
    LocalDate dateOfJoining,
    LocalDate dob,
    String gender,
    LocalDateTime createdAt
) {}
