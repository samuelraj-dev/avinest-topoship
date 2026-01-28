package com.topoship.avinestbackend.auth.service;

import com.topoship.jooq.generated.tables.records.CourseRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Service;

import static com.topoship.jooq.generated.tables.Course.COURSE;

@Service
public class CourseService {

    private final DSLContext dsl;

    public CourseService(DSLContext dsl) {
        this.dsl = dsl;
    }

    public CourseRecord findOneByCode(String courseCode) {
        return dsl.selectFrom(COURSE)
                .where(COURSE.CODE.eq(courseCode))
                .fetchOne();
    }
}
