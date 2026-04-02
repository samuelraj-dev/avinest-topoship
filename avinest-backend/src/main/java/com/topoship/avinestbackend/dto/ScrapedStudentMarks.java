package com.topoship.avinestbackend.dto;


import java.util.Map;

public record ScrapedStudentMarks(
        Map<String, Map<String, Short>> cat
) {}
