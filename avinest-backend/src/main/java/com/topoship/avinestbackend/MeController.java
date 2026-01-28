package com.topoship.avinestbackend;

import com.topoship.avinestbackend.auth.AuthenticatedUser;
import com.topoship.avinestbackend.dto.*;
import com.topoship.avinestbackend.dto.timetable.SectionTimetableResponse;
import com.topoship.avinestbackend.services.FacultyService;
import com.topoship.avinestbackend.services.StudentService;
import com.topoship.avinestbackend.services.UserService;
import com.topoship.jooq.generated.tables.records.StudentsRecord;
import jakarta.servlet.http.HttpServletRequest;
import org.jooq.DSLContext;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.topoship.jooq.generated.tables.Faculty.FACULTY;

@RestController
@RequestMapping(path = {"api/me"})
public class MeController {

    private final UserService userService;
    private final StudentService studentService;
    private final FacultyService facultyService;
    private final DSLContext dsl;

    public MeController(UserService userService, StudentService studentService, FacultyService facultyService, DSLContext dsl) {
        this.userService = userService;
        this.studentService = studentService;
        this.facultyService = facultyService;
        this.dsl = dsl;
    }

    @GetMapping
    public String me(HttpServletRequest req) {
        AuthenticatedUser user = (AuthenticatedUser) req.getAttribute("auth");

        return userService.getOneById(user.userId()).getUsername();
    }

    @GetMapping(path = {"profile"})
    public ProfileResponse profile(HttpServletRequest req) {
        AuthenticatedUser user = (AuthenticatedUser) req.getAttribute("auth");

        return userService.getProfile(user.userId()).orElseThrow();
    }

    @GetMapping(path = {"student/my-faculties"})
    public List<FacultyWithCoursesDto> myFaculties(HttpServletRequest req) {
        AuthenticatedUser user = (AuthenticatedUser) req.getAttribute("auth");

        StudentsRecord student = studentService.findOneById(user.userId())
                .orElseThrow();

        return facultyService.getFacultiesForSection(student.getCurrentSectionId());
    }

    @PostMapping(path = {"faculty/sync/faculty-subjects"})
    public void syncFacultySubjects(
            @RequestBody FacultySyncRequest request,
            HttpServletRequest http
    ) {
        AuthenticatedUser auth =
                (AuthenticatedUser) http.getAttribute("auth");

        facultyService.syncFacultySubjects(
                auth.userId(),
                request.password()
        );
    }

    @PostMapping(path = {"student/sync/timetable"})
    public void syncStudentTimetable(
            @RequestBody StudentTimetableSyncRequest request,
            HttpServletRequest http
    ) {
        AuthenticatedUser auth =
                (AuthenticatedUser) http.getAttribute("auth");

        studentService.syncTimetable(
            auth.userId(),
            request.password()
        );
    }

    @GetMapping(path = {"student/timetable"})
    public SectionTimetableResponse getTimetable(
            HttpServletRequest http
    ) {
        AuthenticatedUser auth =
                (AuthenticatedUser) http.getAttribute("auth");
        return studentService.getTimetable(auth.userId());
    }

    @GetMapping(path = {"faculty/subjects"})
    public List<FacultyClassSubjectsDto> mySubjects(HttpServletRequest req) {

        AuthenticatedUser auth =
                (AuthenticatedUser) req.getAttribute("auth");

        Long facultyId = dsl
                .select(FACULTY.ID)
                .from(FACULTY)
                .where(FACULTY.USER_ID.eq(auth.userId()))
                .fetchOneInto(Long.class);

        return facultyService.getGroupedSubjects(facultyId);
    }
}
