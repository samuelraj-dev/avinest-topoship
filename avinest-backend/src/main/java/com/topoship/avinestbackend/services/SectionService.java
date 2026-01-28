package com.topoship.avinestbackend.services;

import com.topoship.avinestbackend.repository.*;
import com.topoship.jooq.generated.tables.records.*;
import org.jooq.DSLContext;
import org.springframework.stereotype.Service;

import static com.topoship.jooq.generated.tables.Programs.PROGRAMS;
import static com.topoship.jooq.generated.tables.Sections.SECTIONS;
import static com.topoship.jooq.generated.tables.Semesters.SEMESTERS;

@Service
public class SectionService {

    private final DSLContext dsl;
    private final ProgramRepository programRepository;
    private final BatchRepository batchRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;
    private final SectionRepository sectionRepository;

    public SectionService(ProgramRepository programRepository, BatchRepository batchRepository, AcademicYearRepository academicYearRepository, SemesterRepository semesterRepository, SectionRepository sectionRepository, DSLContext dsl) {
        this.programRepository = programRepository;
        this.batchRepository = batchRepository;
        this.academicYearRepository = academicYearRepository;
        this.semesterRepository = semesterRepository;
        this.sectionRepository = sectionRepository;
        this.dsl = dsl;
    }

    public Long resolveSectionId(String programName, String programDegreeLevel, int batchStartYear, int batchEndYear, int academicYearStart, int academicYearEnd, int semesterNumber, String sectionName) {
        ProgramsRecord program = programRepository
                .findByNameAndLevel(programName, programDegreeLevel)
                .orElseThrow(IllegalStateException::new);

        BatchesRecord batch = batchRepository
                .findByYears(batchStartYear, batchEndYear)
                .orElseThrow(IllegalStateException::new);

        AcademicYearsRecord academicYear = academicYearRepository
                .findByYears(academicYearStart, academicYearEnd)
                .orElseThrow(IllegalStateException::new);

        SemestersRecord semester = semesterRepository
                .findByAcademicYearAndNumber(academicYear.getId(), semesterNumber)
                .orElseThrow(IllegalStateException::new);

        SectionsRecord section = sectionRepository
                .findByProgramBatchSemesterAndName(
                        program.getId(),
                        batch.getId(),
                        semester.getId(),
                        sectionName
                )
                .orElseThrow(IllegalStateException::new);

        return section.getId();
    }

    public Long resolveSectionIdFromFaculty(
            String programAbbreviation,
            int semesterNumber,
            String sectionName
    ) {
        return dsl
                .select(SECTIONS.ID)
                .from(SECTIONS)
                .join(PROGRAMS).on(PROGRAMS.ID.eq(SECTIONS.PROGRAM_ID))
                .join(SEMESTERS).on(SEMESTERS.ID.eq(SECTIONS.SEMESTER_ID))
                .where(PROGRAMS.ABBREVIATION.eq(programAbbreviation))
                .and(SEMESTERS.NUMBER.eq(semesterNumber))
                .and(SECTIONS.NAME.eq(sectionName))
                .fetchOneInto(Long.class);
    }

}
