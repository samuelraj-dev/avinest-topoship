package com.topoship.avinestbackend.dto.marks;

import java.math.BigDecimal;

public record CourseGradeDTO(
        Long courseId,
        String courseCode,
        String courseName,
        BigDecimal credits,
        String grade,
        Short gradePoints,
        String result
) {}
