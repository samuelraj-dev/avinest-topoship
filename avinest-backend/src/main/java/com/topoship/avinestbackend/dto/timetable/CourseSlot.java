package com.topoship.avinestbackend.dto.timetable;

public record CourseSlot(
        String courseCode,
        String courseTitle,
        String courseNature,

        String facultyName,
        String facultyCode
) {}