package com.topoship.avinestbackend.services;

import com.topoship.avinestbackend.dto.*;
import com.topoship.avinestbackend.dto.timetable.CourseSlot;
import com.topoship.avinestbackend.dto.timetable.DayTimetable;
import com.topoship.avinestbackend.dto.timetable.PeriodTimetable;
import com.topoship.avinestbackend.dto.timetable.SectionTimetableResponse;
import com.topoship.jooq.generated.tables.records.StudentsRecord;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;

import static com.topoship.jooq.generated.tables.AppUsers.APP_USERS;
import static com.topoship.jooq.generated.tables.Course.COURSE;
import static com.topoship.jooq.generated.tables.CourseOffering.COURSE_OFFERING;
import static com.topoship.jooq.generated.tables.Faculty.FACULTY;
import static com.topoship.jooq.generated.tables.Students.STUDENTS;
import static com.topoship.jooq.generated.tables.Timetable.TIMETABLE;
import static org.jooq.impl.DSL.field;

@Service
public class StudentService {

    private final DSLContext dsl;
    private final RestClient restClient;

    public StudentService(
        DSLContext dsl,
        RestClient.Builder restClientBuilder,
        @Value("${python.service.url}") String pythonServiceUrl
    ) {
        this.dsl = dsl;
        this.restClient = restClientBuilder.baseUrl(pythonServiceUrl).build();
    }

    public Optional<StudentsRecord> findOneById(Long userId) {
        return dsl.
                selectFrom(STUDENTS)
                .where(STUDENTS.USER_ID.eq(userId))
                .fetchOptional();
    }

    public void syncTimetable(Long userId, String password) {
        var student = dsl.selectFrom(STUDENTS)
                .where(STUDENTS.USER_ID.eq(userId))
                .fetchOne();

        if (student == null) {
            throw new IllegalStateException("Student not found");
        }

        var scraped = restClient.post()
                .uri("/student/timetable")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "username", student.getRegisterNumber(),
                        "password", password
                ))
                .retrieve()
                .body(ScrapedStudentTimetables.class);

        if (scraped == null || scraped.entries().isEmpty()) {
            return;
        }

        Long sectionId = student.getCurrentSectionId();

        for (ScrapedStudentTimetable s : scraped.entries()) {
            Long courseOfferingId = resolveCourseOfferingId(sectionId, s.subjectCode(), s.staffCode());
            Long courseOfferingAltId = s.alt() == null ? null :
                    resolveCourseOfferingId(sectionId, s.alt().subjectCode(), s.alt().staffCode());
            String day = DayNormalizer.normalize(s.day());

            if (courseOfferingId == null) continue;

            dsl.insertInto(TIMETABLE)
                    .set(TIMETABLE.SECTION_ID, sectionId)
                    .set(TIMETABLE.COURSE_OFFERING_ID, courseOfferingId)
                    .set(TIMETABLE.COURSE_OFFERING_ALT_ID, courseOfferingAltId)
                    .set(TIMETABLE.DAY, day)
                    .set(TIMETABLE.PERIOD_NUMBER, s.period().shortValue())
                    .onConflict(TIMETABLE.SECTION_ID, TIMETABLE.DAY, TIMETABLE.PERIOD_NUMBER)
                    .doUpdate()
                    .set(TIMETABLE.COURSE_OFFERING_ID, courseOfferingId)
                    .set(TIMETABLE.COURSE_OFFERING_ALT_ID, courseOfferingAltId)
                    .execute();
        }
    }

    public SectionTimetableResponse getTimetable(Long userId) {
        var student = dsl.selectFrom(STUDENTS)
                .where(STUDENTS.USER_ID.eq(userId))
                .fetchOne();

        if (student == null) {
            throw new IllegalStateException("Student not found");
        }

        Long sectionId = student.getCurrentSectionId();

        List<? extends Record> records = fetchRawTimetable(sectionId);

        return buildTimetableResponse(sectionId, records);
    }

    private List<? extends Record> fetchRawTimetable(Long sectionId) {
        var CO_ALT = COURSE_OFFERING.as("co_alt");
        var COURSE_ALT = COURSE.as("course_alt");
        var FACULTY_ALT = FACULTY.as("faculty_alt");
        var APP_USERS_ALT = APP_USERS.as("app_users_alt");

        return dsl.select(
                        TIMETABLE.DAY,
                        TIMETABLE.PERIOD_NUMBER,

                        COURSE.CODE,
                        COURSE.TITLE,
                        COURSE.NATURE,

                        APP_USERS.FULL_NAME,
                        FACULTY.STAFF_CODE,

                        COURSE_ALT.CODE.as("alt_code"),
                        COURSE_ALT.TITLE.as("alt_title"),
                        COURSE_ALT.NATURE.as("alt_nature"),

                        APP_USERS_ALT.FULL_NAME.as("alt_faculty_name"),
                        FACULTY_ALT.STAFF_CODE.as("alt_faculty_code")
                )
                .from(TIMETABLE)
                .join(COURSE_OFFERING).on(COURSE_OFFERING.ID.eq(TIMETABLE.COURSE_OFFERING_ID))
                .join(COURSE).on(COURSE.ID.eq(COURSE_OFFERING.COURSE_ID))
                .join(FACULTY).on(FACULTY.ID.eq(COURSE_OFFERING.FACULTY_ID))
                .join(APP_USERS).on(APP_USERS.ID.eq(FACULTY.USER_ID))
                .leftJoin(CO_ALT)
                .on(CO_ALT.ID.eq(TIMETABLE.COURSE_OFFERING_ALT_ID))
                .leftJoin(COURSE_ALT)
                .on(COURSE_ALT.ID.eq(CO_ALT.COURSE_ID))
                .leftJoin(FACULTY_ALT)
                .on(FACULTY_ALT.ID.eq(CO_ALT.FACULTY_ID))
                .leftJoin(APP_USERS_ALT)
                .on(APP_USERS_ALT.ID.eq(FACULTY_ALT.USER_ID))

                .where(TIMETABLE.SECTION_ID.eq(sectionId))
                .orderBy(TIMETABLE.DAY, TIMETABLE.PERIOD_NUMBER)
                .fetch();
    }
    private SectionTimetableResponse buildTimetableResponse(Long sectionId, List<? extends Record> records) {
        Map<String, List<PeriodTimetable>> byDay = new LinkedHashMap<>();
        for (Record r : records) {
            String day = r.get(TIMETABLE.DAY);
            short period = r.get(TIMETABLE.PERIOD_NUMBER);

            CourseSlot primary = new CourseSlot(
                    r.get(COURSE.CODE),
                    r.get(COURSE.TITLE),
                    r.get(COURSE.NATURE),
                    r.get(APP_USERS.FULL_NAME),
                    r.get(FACULTY.STAFF_CODE)
            );

            CourseSlot alt = null;
            if (r.get("alt_code") != null) {
                alt = new CourseSlot(
                        r.get("alt_code", String.class),
                        r.get("alt_title", String.class),
                        r.get("alt_nature", String.class),
                        r.get("alt_faculty_name", String.class),
                        r.get("alt_faculty_code", String.class)
                );
            }

            PeriodTimetable periodSlot =
                    new PeriodTimetable(period, primary, alt);

            byDay.computeIfAbsent(day, d -> new ArrayList<>())
                    .add(periodSlot);
        }

        List<DayTimetable> days = byDay.entrySet().stream()
                .map(e -> new DayTimetable(e.getKey(), e.getValue()))
                .toList();

        return new SectionTimetableResponse(sectionId, days);
    }

    private Long resolveCourseOfferingId(Long sectionId, String subjectCode, String staffCode) {
        Long courseId = dsl.select(COURSE.ID).from(COURSE)
                .where(COURSE.CODE.eq(subjectCode))
                .fetchOneInto(Long.class);

        Long facultyId = dsl.select(FACULTY.ID).from(FACULTY)
                .where(FACULTY.STAFF_CODE.eq(staffCode))
                .fetchOneInto(Long.class);

        if (courseId == null || facultyId == null) {
            return null;
        }

        return dsl.select(COURSE_OFFERING.ID).from(COURSE_OFFERING)
                .where(COURSE_OFFERING.SECTION_ID.eq(sectionId))
                .and(COURSE_OFFERING.COURSE_ID.eq(courseId))
                .and(COURSE_OFFERING.FACULTY_ID.eq(facultyId))
                .fetchOneInto(Long.class);
    }
//    public TimetableResponseDto getStudentTimetable(Long studentId) {
//
//        Long sectionId = dsl
//                .select(STUDENTS.CURRENT_SECTION_ID)
//                .from(STUDENTS)
//                .where(STUDENTS.USER_ID.eq(studentId))
//                .fetchOneInto(Long.class);
//
//        var records = dsl
//                .select(
//                        TIMETABLE.DAY,
//                        TIMETABLE.PERIOD_NUMBER,
//
//                        COURSE.TITLE,
//                        COURSE.CODE,
//
//                        COURSE.TITLE.as("alt_title"),
//                        COURSE.CODE.as("alt_code"),
//
//                        PROGRAMS.DEGREE_LEVEL,
//                        PROGRAMS.NAME,
//                        SEMESTERS.NUMBER,
//                        SECTIONS.NAME
//                )
//                .from(TIMETABLE)
//                .join(COURSE_OFFERING)
//                .on(COURSE_OFFERING.ID.eq(TIMETABLE.COURSE_OFFERING_ID))
//                .join(COURSE)
//                .on(COURSE.ID.eq(COURSE_OFFERING.COURSE_ID))
//                .leftJoin(COURSE_OFFERING.as("co_alt"))
//                .on(DSL.field("co_alt.id", Long.class)
//                        .eq(TIMETABLE.COURSE_OFFERING_ALT_ID))
//                .leftJoin(COURSE.as("course_alt"))
//                .on(DSL.field("course_alt.id", Long.class)
//                        .eq(DSL.field("co_alt.course_id", Long.class)))
//                .join(SECTIONS)
//                .on(SECTIONS.ID.eq(TIMETABLE.SECTION_ID))
//                .join(PROGRAMS)
//                .on(PROGRAMS.ID.eq(SECTIONS.PROGRAM_ID))
//                .join(SEMESTERS)
//                .on(SEMESTERS.ID.eq(SECTIONS.SEMESTER_ID))
//                .where(TIMETABLE.SECTION_ID.eq(sectionId))
//                .orderBy(TIMETABLE.DAY, TIMETABLE.PERIOD_NUMBER)
//                .fetch();
//
//        String sectionLabel = records.isEmpty()
//                ? ""
//                : records.get(0).get(PROGRAMS.DEGREE_LEVEL)
//                + " " + records.get(0).get(PROGRAMS.NAME)
//                + "/" + records.get(0).get(SEMESTERS.NUMBER)
//                + "/" + records.get(0).get(SECTIONS.NAME);
//
//        List<TimetableSlotDto> slots = records.stream()
//                .map(r -> new TimetableSlotDto(
//                        r.get(TIMETABLE.DAY).name(),
//                        r.get(TIMETABLE.PERIOD_NUMBER),
//                        new TimetableCourseDto(
//                                r.get(COURSE.TITLE),
//                                r.get(COURSE.CODE)
//                        ),
//                        r.get("alt_title") != null
//                                ? new TimetableCourseDto(
//                                r.get("alt_title", String.class),
//                                r.get("alt_code", String.class)
//                        )
//                                : null
//                ))
//                .toList();
//
//        return new TimetableResponseDto(
//                sectionLabel,
//                7,
//                List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"),
//                slots
//        );
//    }
}
