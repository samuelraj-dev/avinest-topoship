package com.topoship.avinestbackend.services;

import com.topoship.avinestbackend.auth.service.CourseService;
import com.topoship.avinestbackend.dto.*;
import com.topoship.jooq.generated.tables.records.CourseRecord;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.topoship.jooq.generated.tables.AppUsers.APP_USERS;
import static com.topoship.jooq.generated.tables.Course.COURSE;
import static com.topoship.jooq.generated.tables.CourseOffering.COURSE_OFFERING;
import static com.topoship.jooq.generated.tables.Faculty.FACULTY;
import static com.topoship.jooq.generated.tables.Programs.PROGRAMS;
import static com.topoship.jooq.generated.tables.Sections.SECTIONS;
import static com.topoship.jooq.generated.tables.Semesters.SEMESTERS;

@Service
public class FacultyService {
    private final DSLContext dsl;
    private final RestClient restClient;
    private final SectionService sectionService;
    private final CourseService courseService;

    public FacultyService(
            DSLContext dsl,
            RestClient.Builder restClientBuilder,
            @Value("${python.service.url}") String pythonServiceUrl,
            SectionService sectionService,
            CourseService courseService) {
        this.dsl = dsl;
        this.restClient = restClientBuilder.baseUrl(pythonServiceUrl).build();
        this.sectionService = sectionService;
        this.courseService = courseService;
    }

    public List<FacultyWithCoursesDto> getFacultiesForSection(Long sectionId) {

        return dsl
                .select(
                        FACULTY.ID,
                        FACULTY.STAFF_CODE,
                        APP_USERS.FULL_NAME,
                        APP_USERS.EMAIL,
                        FACULTY.DEPARTMENT,
                        FACULTY.DESIGNATION,
                        DSL.arrayAggDistinct(COURSE.TITLE).as("courses")
                )
                .from(COURSE_OFFERING)
                .join(FACULTY).on(FACULTY.ID.eq(COURSE_OFFERING.FACULTY_ID))
                .join(APP_USERS).on(APP_USERS.ID.eq(FACULTY.USER_ID))
                .join(COURSE).on(COURSE.ID.eq(COURSE_OFFERING.COURSE_ID))
                .where(COURSE_OFFERING.SECTION_ID.eq(sectionId))
                .groupBy(
                        FACULTY.ID,
                        FACULTY.STAFF_CODE,
                        APP_USERS.FULL_NAME,
                        APP_USERS.EMAIL,
                        FACULTY.DEPARTMENT,
                        FACULTY.DESIGNATION
                )
                .fetch(record -> new FacultyWithCoursesDto(
                        record.get(FACULTY.ID),
                        record.get(FACULTY.STAFF_CODE),
                        record.get(APP_USERS.FULL_NAME),
                        record.get(FACULTY.DEPARTMENT),
                        record.get(FACULTY.DESIGNATION),
                        record.get(APP_USERS.EMAIL),
                        record.get("courses", String[].class) != null
                                ? List.of(record.get("courses", String[].class))
                                : List.of()
                ));
    }

    public void syncFacultySubjects(Long userId, String password) {
        var faculty = dsl.select(FACULTY.ID, FACULTY.STAFF_CODE)
                .from(FACULTY)
                .where(FACULTY.USER_ID.eq(userId))
                .fetchOne();

        if (faculty == null) {
            throw new IllegalStateException("Faculty not found");
        }

        String staffCode = faculty.get(FACULTY.STAFF_CODE);
        Long facultyId = faculty.get(FACULTY.ID);

        ScrapedFacultySubjects scraped = restClient.post()
                .uri("/faculty/subjects")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "username", staffCode,
                        "password", password
                ))
                .retrieve()
                .body(ScrapedFacultySubjects.class);

        if (scraped == null || scraped.subjects().isEmpty()) {
            return;
        }

        for (ScrapedFacultySubject s : scraped.subjects()) {
            String programAbbr =
                    ProgramNormalizer.normalize(s.programRaw());

            Long sectionId = sectionService.resolveSectionIdFromFaculty(programAbbr, s.semester(), s.section());

            if (sectionId == null) {
                continue;
            }

            CourseRecord course = courseService.findOneByCode(s.courseCode());
            System.out.println(s.courseCode());
            System.out.println(course);

            if (course == null) {
                continue;
            }

            dsl.insertInto(COURSE_OFFERING)
                    .set(COURSE_OFFERING.COURSE_ID, course.getId())
                    .set(COURSE_OFFERING.SECTION_ID, sectionId)
                    .set(COURSE_OFFERING.FACULTY_ID, facultyId)
                    .onConflict(
                            COURSE_OFFERING.COURSE_ID,
                            COURSE_OFFERING.SECTION_ID
                    )
                    .doUpdate()
                    .set(COURSE_OFFERING.FACULTY_ID, facultyId)
                    .execute();

        }
    }

        public List<FacultyClassSubjectsDto> getGroupedSubjects(Long facultyId) {

            var records = dsl
                    .select(
                            PROGRAMS.ABBREVIATION,
                            PROGRAMS.DEGREE_LEVEL,
                            PROGRAMS.NAME,
                            SEMESTERS.NUMBER,
                            SECTIONS.NAME,
                            COURSE.ID,
                            COURSE.CODE,
                            COURSE.TITLE
                    )
                    .from(COURSE_OFFERING)
                    .join(SECTIONS)
                    .on(SECTIONS.ID.eq(COURSE_OFFERING.SECTION_ID))
                    .join(PROGRAMS)
                    .on(PROGRAMS.ID.eq(SECTIONS.PROGRAM_ID))
                    .join(SEMESTERS)
                    .on(SEMESTERS.ID.eq(SECTIONS.SEMESTER_ID))
                    .join(COURSE)
                    .on(COURSE.ID.eq(COURSE_OFFERING.COURSE_ID))
                    .where(COURSE_OFFERING.FACULTY_ID.eq(facultyId))
                    .orderBy(
                            PROGRAMS.ABBREVIATION,
                            SEMESTERS.NUMBER,
                            SECTIONS.NAME,
                            COURSE.CODE
                    )
                    .fetch();

            // ---- Grouping ----
            Map<String, FacultyClassSubjectsDto> grouped = new LinkedHashMap<>();

            for (var r : records) {

                String className = String.format(
                        "%s %s/%d/%s",
                        r.get(PROGRAMS.DEGREE_LEVEL),
                        r.get(PROGRAMS.ABBREVIATION),
                        r.get(SEMESTERS.NUMBER),
                        r.get(SECTIONS.NAME)
                );

                String key = r.get(PROGRAMS.ABBREVIATION)
                        + "-" + r.get(SEMESTERS.NUMBER)
                        + "-" + r.get(SECTIONS.NAME);

                grouped.computeIfAbsent(key, k ->
                        new FacultyClassSubjectsDto(
                                className,
                                r.get(PROGRAMS.ABBREVIATION),
                                r.get(SEMESTERS.NUMBER),
                                r.get(SECTIONS.NAME),
                                new ArrayList<>()
                        )
                ).subjects().add(
                        new FacultySubjectItemDto(
                                r.get(COURSE.ID),
                                r.get(COURSE.CODE),
                                r.get(COURSE.TITLE)
                        )
                );
            }

            return new ArrayList<>(grouped.values());
        }
}
