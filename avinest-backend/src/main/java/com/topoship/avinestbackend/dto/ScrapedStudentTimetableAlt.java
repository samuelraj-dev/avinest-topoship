package com.topoship.avinestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ScrapedStudentTimetableAlt(
        @JsonProperty("subject_code")
        String subjectCode,
        @JsonProperty("staff_code")
        String staffCode
) {
}
