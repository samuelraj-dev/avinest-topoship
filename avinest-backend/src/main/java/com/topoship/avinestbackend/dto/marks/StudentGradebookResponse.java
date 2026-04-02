package com.topoship.avinestbackend.dto.marks;

import java.util.List;

public record StudentGradebookResponse(
        Double cgpa,
        Integer totalArrears,
        List<SemesterDTO> semesters
) {
}
