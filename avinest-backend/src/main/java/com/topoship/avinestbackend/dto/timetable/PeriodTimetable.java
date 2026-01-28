package com.topoship.avinestbackend.dto.timetable;

public record PeriodTimetable(
        short period,
        CourseSlot primary,
        CourseSlot alt
) {}