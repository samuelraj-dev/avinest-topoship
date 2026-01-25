package com.topoship.avinestbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;

public record ScrapedStudent(
    @JsonProperty("register_number")
    String registerNumber,
    boolean hosteler,
    @JsonProperty("lateral_entry")
    boolean lateralEntry,
    LocalDate dob,
    String gender,

    @JsonProperty("program_name")
    String programName,
    @JsonProperty("program_degree_level")
    String programDegreeLevel,
    @JsonProperty("batch_start_year")
    int batchStartYear,
    @JsonProperty("batch_end_year")
    int batchEndYear,
    @JsonProperty("academic_year_start")
    int academicYearStart,
    @JsonProperty("academic_year_end")
    int academicYearEnd,
    @JsonProperty("semester_number")
    int semesterNumber,
    @JsonProperty("section_name")
    String sectionName
) {}
