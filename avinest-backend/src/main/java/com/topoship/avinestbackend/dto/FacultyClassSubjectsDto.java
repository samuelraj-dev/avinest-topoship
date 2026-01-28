package com.topoship.avinestbackend.dto;

import java.util.List;

public record FacultyClassSubjectsDto(
    String className,
    String program,
    int semester,
    String section,
    List<FacultySubjectItemDto> subjects
) {}
