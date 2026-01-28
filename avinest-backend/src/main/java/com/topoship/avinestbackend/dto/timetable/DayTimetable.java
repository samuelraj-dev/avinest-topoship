package com.topoship.avinestbackend.dto.timetable;

import java.util.List;

public record DayTimetable(
        String day,
        List<PeriodTimetable> periods
) {}