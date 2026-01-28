package com.topoship.avinestbackend.dto;

public record TimetableSlotDto(
    String day,
    int period,
    TimetableCourseDto course,
    TimetableCourseDto alternateCourse
) {}