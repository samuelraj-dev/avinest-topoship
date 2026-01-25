package com.topoship.avinestbackend.repository;

import static com.topoship.jooq.generated.tables.Batches.BATCHES;
import com.topoship.jooq.generated.tables.records.BatchesRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class BatchRepository {
    private final DSLContext dsl;

    public BatchRepository(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<BatchesRecord> findByYears(int batchStartYear, int batchEndYear) {
        return Optional.ofNullable(dsl.selectFrom(BATCHES)
                .where(BATCHES.START_YEAR.eq(batchStartYear))
                .and(BATCHES.END_YEAR.eq(batchEndYear))
                .fetchOne()
        );
    }
}
