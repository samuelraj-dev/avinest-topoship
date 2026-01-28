package com.topoship.avinestbackend.repository;

import com.topoship.jooq.generated.tables.records.FacultyRecord;
import static com.topoship.jooq.generated.tables.Faculty.FACULTY;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public class FacultyRepository {
    private final DSLContext dsl;

    public FacultyRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    public FacultyRecord createOne(
            Long userId,
            String staffCode,
            String department,
            String designation,
            String biometricId,
            String annaUniversityCode,
            LocalDate dateOfJoining,
            LocalDate dob,
            String gender
    ) {
        return dsl.insertInto(FACULTY)
                .set(FACULTY.USER_ID, userId)
                .set(FACULTY.STAFF_CODE, staffCode)
                .set(FACULTY.DEPARTMENT, department)
                .set(FACULTY.DESIGNATION, designation)
                .set(FACULTY.BIOMETRIC_ID, biometricId)
                .set(FACULTY.ANNA_UNIVERSITY_CODE, annaUniversityCode)
                .set(FACULTY.DATE_OF_JOINING, dateOfJoining)
                .set(FACULTY.DOB, dob)
                .set(FACULTY.GENDER, gender)
                .returning()
                .fetchOne();
    }

    public Optional<FacultyRecord> findByUserId(Long userId) {
        return dsl.selectFrom(FACULTY)
                .where(FACULTY.USER_ID.eq(userId))
                .fetchOptional();
    }
}
