package com.topoship.avinestbackend.dto.grades;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ScrapedGrade(
    @JsonProperty("course_code")
    String courseCode,
    @JsonProperty("course_name")
    String courseName,
    String grade,
    String result
) {}