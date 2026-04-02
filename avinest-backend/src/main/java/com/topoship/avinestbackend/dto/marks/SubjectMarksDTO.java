package com.topoship.avinestbackend.dto.marks;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

public record SubjectMarksDTO(
        @JsonProperty("course_code")
        String courseCode,
        @JsonProperty("course_name")
        String courseName,
        String nature,
        Map<String, Short> cat,
        Map<String, Short> assignment,
        Map<String, Integer> lab
) {}