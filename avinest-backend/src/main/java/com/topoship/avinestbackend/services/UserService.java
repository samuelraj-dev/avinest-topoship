package com.topoship.avinestbackend.services;

import com.topoship.avinestbackend.auth.PasswordService;
import com.topoship.avinestbackend.dto.LoginRequest;
import com.topoship.avinestbackend.dto.ScrapedFaculty;
import com.topoship.avinestbackend.dto.ScrapedStudent;
import com.topoship.avinestbackend.dto.ScrapedUserResponse;
import com.topoship.avinestbackend.repository.FacultyRepository;
import com.topoship.avinestbackend.repository.StudentRepository;
import com.topoship.avinestbackend.repository.UserRepository;
import com.topoship.jooq.generated.tables.records.AppUsersRecord;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final SectionService sectionService;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;

    public UserService(UserRepository userRepository, SectionService sectionService, StudentRepository studentRepository, FacultyRepository facultyRepository) {
        this.userRepository = userRepository;
        this.sectionService = sectionService;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
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
}
