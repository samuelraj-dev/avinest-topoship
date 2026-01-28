package com.topoship.avinestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record FacultyWithCoursesDto(
    Long id,
    @JsonProperty("staff_code")
    String staffCode,
    @JsonProperty("full_name")
    String fullName,
    String department,
    String designation,
    String email,
    List<String> courses
) {}
