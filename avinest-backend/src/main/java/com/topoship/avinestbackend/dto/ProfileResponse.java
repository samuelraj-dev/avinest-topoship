package com.topoship.avinestbackend.dto;

public record ProfileResponse(
    String role,
    UserDto user,
    StudentDto student,
    FacultyDto faculty
) {}
