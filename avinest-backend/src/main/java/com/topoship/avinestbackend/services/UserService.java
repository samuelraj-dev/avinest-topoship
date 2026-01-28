package com.topoship.avinestbackend.services;

import com.topoship.avinestbackend.auth.PasswordService;
import com.topoship.avinestbackend.dto.*;
import com.topoship.avinestbackend.repository.FacultyRepository;
import com.topoship.avinestbackend.repository.StudentRepository;
import com.topoship.avinestbackend.repository.UserRepository;
import com.topoship.jooq.generated.tables.AppUsers;
import com.topoship.jooq.generated.tables.Faculty;
import com.topoship.jooq.generated.tables.Students;
import com.topoship.jooq.generated.tables.records.AppUsersRecord;
import com.topoship.jooq.generated.tables.records.FacultyRecord;
import com.topoship.jooq.generated.tables.records.StudentsRecord;
import org.jooq.DSLContext;
import org.springframework.stereotype.Service;

import java.util.Optional;

import static com.topoship.jooq.generated.tables.AppUsers.APP_USERS;
import static com.topoship.jooq.generated.tables.Faculty.FACULTY;
import static com.topoship.jooq.generated.tables.Students.STUDENTS;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final SectionService sectionService;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final DSLContext dsl;

    public UserService(UserRepository userRepository, SectionService sectionService, StudentRepository studentRepository, FacultyRepository facultyRepository, DSLContext dsl) {
        this.userRepository = userRepository;
        this.sectionService = sectionService;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.dsl = dsl;
    }

    public AppUsersRecord createFromScrape(LoginRequest loginRequest, ScrapedUserResponse scrapedUser) {
        String hashedPassword = PasswordService.hash(loginRequest.password().toCharArray());
        var createdUser = userRepository.createOne(
                scrapedUser.username(),
                scrapedUser.email(),
                scrapedUser.phone(),
                scrapedUser.fullName(),
                hashedPassword,
                scrapedUser.role(),
                scrapedUser.avatarUrl()
        );

        if (createdUser.getRole().equals("STUDENT")) {
            ScrapedStudent student = scrapedUser.student();

            Long sectionId = sectionService.resolveSectionId(
                    student.programName(),
                    student.programDegreeLevel(),
                    student.batchStartYear(),
                    student.batchEndYear(),
                    student.academicYearStart(),
                    student.academicYearEnd(),
                    student.semesterNumber(),
                    student.sectionName()
            );

            studentRepository.createOne(
                    createdUser.getId(),
                    sectionId,
                    student.registerNumber(),
                    student.hosteler(),
                    student.lateralEntry(),
                    student.dob(),
                    student.gender()
            );
        } else {
            ScrapedFaculty faculty = scrapedUser.faculty();
            facultyRepository.createOne(
                    createdUser.getId(),
                    faculty.staffCode(),
                    faculty.department(),
                    faculty.designation(),
                    faculty.biometricId(),
                    faculty.annaUniversityCode(),
                    faculty.dateOfJoining(),
                    faculty.dob(),
                    faculty.gender()
            );
        }

        return createdUser;
    }

    public String getUserRoleById(Long userId) {
        return userRepository.getUserRoleById(userId)
                .orElseThrow(() -> new RuntimeException("Unauthorized"));
    }

    public AppUsersRecord getOneById(Long userId) {
        return userRepository.getOneById(userId)
                .orElseThrow(() -> new RuntimeException("Unauthorized"));
    }

    public Optional<ProfileResponse> getProfile(Long userId) {
        return dsl
                .select(
                    APP_USERS.asterisk(),
                    STUDENTS.asterisk(),
                    FACULTY.asterisk()
                )
                .from(APP_USERS)
                .leftJoin(STUDENTS).on(STUDENTS.USER_ID.eq(APP_USERS.ID))
                .leftJoin(FACULTY).on(FACULTY.USER_ID.eq(APP_USERS.ID))
                .where(APP_USERS.ID.eq(userId))
                .fetchOptional(r -> {
                    UserDto user = r.into(APP_USERS).into(UserDto.class);

                    if ("STUDENT".equals(user.role())) {
                        StudentDto student = r.into(STUDENTS).into(StudentDto.class);
                        return new ProfileResponse("STUDENT", user, student, null);
                    }

                    if ("FACULTY".equals(user.role())) {
                        FacultyDto faculty = r.into(FACULTY).into(FacultyDto.class);
                        return new ProfileResponse("FACULTY", user, null, faculty);
                    }

                    throw new IllegalStateException("Unknown role");
                });
//        AppUsersRecord user = userRepository.getOneById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        UserDto userDto = user.into(UserDto.class);
//
//        if ("STUDENT".equals(user.getRole())) {
//            StudentsRecord student = studentRepository.findByUserId(userId)
//                    .orElseThrow(() -> new RuntimeException("Student not found"));
//
//            StudentDto studentDto = student.into(StudentDto.class);
//
//            return new ProfileResponse(
//                    "STUDENT",
//                    userDto,
//                    studentDto,
//                    null
//            );
//        }
//
//        if ("FACULTY".equals(user.getRole())) {
//            FacultyRecord faculty = facultyRepository.findByUserId(userId)
//                    .orElseThrow(() -> new RuntimeException("Faculty not found"));
//
//            FacultyDto facultyDto = faculty.into(FacultyDto.class);
//
//            return new ProfileResponse(
//                    "FACULTY",
//                    userDto,
//                    null,
//                    facultyDto
//            );
//        }
//
//        throw new RuntimeException("Invalid role");
    }
}
