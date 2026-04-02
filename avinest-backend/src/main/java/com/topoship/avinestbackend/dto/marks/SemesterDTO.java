package com.topoship.avinestbackend.dto.marks;

import java.util.ArrayList;
import java.util.List;

public class SemesterDTO {
    public Integer semester;
    public Double gpa = 0.0;
    public Integer arrears = 0;

    public int score = 0;
    public int credits = 0;

    public List<CourseGradeDTO> courses = new ArrayList<>();

    public SemesterDTO(Integer semester) {
        this.semester = semester;
    }
}