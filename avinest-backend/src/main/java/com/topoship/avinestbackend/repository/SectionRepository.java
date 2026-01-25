package com.topoship.avinestbackend.repository;

import com.topoship.jooq.generated.tables.records.SectionsRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import static com.topoship.jooq.generated.tables.Sections.SECTIONS;

@Repository
public class SectionRepository {
    private final DSLContext dsl;

    public SectionRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<SectionsRecord> findByProgramBatchSemesterAndName(Long programId, Long batchId, Long semesterId, String sectionName) {
        return Optional.ofNullable(
                dsl.selectFrom(SECTIONS)
                        .where(SECTIONS.PROGRAM_ID.eq(programId))
                        .and(SECTIONS.BATCH_ID.eq(batchId))
                        .and(SECTIONS.SEMESTER_ID.eq(semesterId))
                        .and(SECTIONS.NAME.equalIgnoreCase(sectionName))
                        .fetchOne()
        );
    }
}
