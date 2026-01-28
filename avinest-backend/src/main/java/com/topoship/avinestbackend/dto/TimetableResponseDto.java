package com.topoship.avinestbackend.dto;

import java.util.List;

public record TimetableResponseDto(
    String section,
    int periodsPerDay,
    List<String> days,
    List<TimetableSlotDto> slots
) {}