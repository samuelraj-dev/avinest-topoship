package com.topoship.avinestbackend.dto;

import java.math.BigDecimal;

public record EnrolledCoursesDto (
        String code,
        String title,
        String nature,
        BigDecimal credits
) {
}
