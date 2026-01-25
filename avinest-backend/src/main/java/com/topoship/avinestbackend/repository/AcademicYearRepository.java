package com.topoship.avinestbackend.repository;

import com.topoship.jooq.generated.tables.records.AcademicYearsRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import static com.topoship.jooq.generated.tables.AcademicYears.ACADEMIC_YEARS;

@Repository
public class AcademicYearRepository {
    private final DSLContext dsl;

    public AcademicYearRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<AcademicYearsRecord> findByYears(int academicYearStart, int academicYearEnd) {
        return Optional.ofNullable(dsl.selectFrom(ACADEMIC_YEARS)
                .where(ACADEMIC_YEARS.START_YEAR.eq(academicYearStart))
                .and(ACADEMIC_YEARS.END_YEAR.eq(academicYearEnd))
                .fetchOne()
        );
    }
}
