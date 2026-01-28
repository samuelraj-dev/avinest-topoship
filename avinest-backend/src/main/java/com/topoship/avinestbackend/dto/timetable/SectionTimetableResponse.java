package com.topoship.avinestbackend.dto.timetable;

import java.util.List;

public record SectionTimetableResponse(
        Long sectionId,
        List<DayTimetable> days
) {}