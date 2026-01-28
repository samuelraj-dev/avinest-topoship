package com.topoship.avinestbackend.dto;

import java.util.List;

public record ScrapedStudentTimetables(
        List<ScrapedStudentTimetable> entries
) {
}
