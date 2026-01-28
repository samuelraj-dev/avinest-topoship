package com.topoship.avinestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ScrapedFacultySubject(
        @JsonProperty("program_raw")
    String programRaw,
    int semester,
    String section,
        @JsonProperty("course_code")
    String courseCode,
        @JsonProperty("course_title")
    String courseTitle
) {}