package com.topoship.avinestbackend.repository;

import static com.topoship.jooq.generated.tables.Programs.PROGRAMS;
import com.topoship.jooq.generated.tables.records.ProgramsRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public class ProgramRepository {
    private final DSLContext dsl;

    public ProgramRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<ProgramsRecord> findByNameAndLevel(String programName, String programDegreeLevel) {
        return Optional.ofNullable(dsl.selectFrom(PROGRAMS)
                .where(PROGRAMS.NAME.equalIgnoreCase(programName))
                .and(PROGRAMS.DEGREE_LEVEL.equalIgnoreCase(programDegreeLevel))
                .fetchOne()
        );
    }
}
