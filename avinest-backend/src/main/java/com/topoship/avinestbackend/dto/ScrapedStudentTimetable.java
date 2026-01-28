package com.topoship.avinestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ScrapedStudentTimetable (
        String day,
        Integer period,
        @JsonProperty("subject_code")
        String subjectCode,
        @JsonProperty("staff_code")
        String staffCode,
        ScrapedStudentTimetableAlt alt
) {
}
