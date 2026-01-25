package com.topoship.avinestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;

public record ScrapedFaculty(
    @JsonProperty("staff_code")
    String staffCode,
    String designation,
    String department,
    @JsonProperty("biometric_id")
    String biometricId,
    @JsonProperty("anna_university_code")
    String annaUniversityCode,
    @JsonProperty("date_of_joining")
    LocalDate dateOfJoining,
    LocalDate dob,
    String gender
) {}
