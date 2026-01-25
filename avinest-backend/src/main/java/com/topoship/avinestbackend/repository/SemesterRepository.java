package com.topoship.avinestbackend.repository;

import com.topoship.jooq.generated.tables.records.SemestersRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import static com.topoship.jooq.generated.tables.Semesters.SEMESTERS;

@Repository
public class SemesterRepository {
    private final DSLContext dsl;

    public SemesterRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<SemestersRecord> findByAcademicYearAndNumber(Long academicYearId, int semesterNumber) {
        return Optional.ofNullable(
                dsl.selectFrom(SEMESTERS)
                        .where(SEMESTERS.ACADEMIC_YEAR_ID.eq(academicYearId))
                        .and(SEMESTERS.NUMBER.eq(semesterNumber))
                        .fetchOne()
        );
    }
}
