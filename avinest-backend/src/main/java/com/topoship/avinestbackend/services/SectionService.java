package com.topoship.avinestbackend.services;

import com.topoship.avinestbackend.repository.*;
import com.topoship.jooq.generated.tables.records.*;
import org.springframework.stereotype.Service;

@Service
public class SectionService {

    private final ProgramRepository programRepository;
    private final BatchRepository batchRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;
    private final SectionRepository sectionRepository;

    public SectionService(ProgramRepository programRepository, BatchRepository batchRepository, AcademicYearRepository academicYearRepository, SemesterRepository semesterRepository, SectionRepository sectionRepository) {
        this.programRepository = programRepository;
        this.batchRepository = batchRepository;
        this.academicYearRepository = academicYearRepository;
        this.semesterRepository = semesterRepository;
        this.sectionRepository = sectionRepository;
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
}
