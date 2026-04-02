package com.topoship.avinestbackend.dto.grades;

import java.util.List;

public record ScrapedSemesterGrades(
    Integer semester,
    List<ScrapedGrade> grades
) {}

