package com.topoship.avinestbackend.repository;

import com.topoship.jooq.generated.tables.records.StudentsRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

import static com.topoship.jooq.generated.tables.Students.STUDENTS;

@Repository
public class StudentRepository {
    private final DSLContext dsl;

    public StudentRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    public StudentsRecord createOne(
            Long userId,
            Long currentSectionId,
            String registerNumber,
            boolean hosteler,
            boolean lateralEntry,
            LocalDate dob,
            String gender
    ) {
        return dsl.insertInto(STUDENTS)
                .set(STUDENTS.USER_ID, userId)
                .set(STUDENTS.CURRENT_SECTION_ID, currentSectionId)
                .set(STUDENTS.REGISTER_NUMBER, registerNumber)
                .set(STUDENTS.HOSTELER, hosteler)
                .set(STUDENTS.LATERAL_ENTRY, lateralEntry)
                .set(STUDENTS.DOB, dob)
                .set(STUDENTS.GENDER, gender)
                .returning()
                .fetchOne();
    }

}
