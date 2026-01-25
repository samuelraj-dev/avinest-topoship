package com.topoship.avinestbackend.depricated;

import com.topoship.avinestbackend.dto.*;
import com.topoship.avinestbackend.repository.FacultyRepository;
import com.topoship.avinestbackend.repository.StudentRepository;
import com.topoship.avinestbackend.repository.UserRepository;
import com.topoship.avinestbackend.services.SectionService;
import com.topoship.avinestbackend.auth.PasswordService;
import com.topoship.jooq.generated.tables.records.AppUsersRecord;
import com.topoship.jooq.generated.tables.records.FacultyRecord;
import com.topoship.jooq.generated.tables.records.StudentsRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Deprecated
@Service
public class AuthServiceOld {

    private final UserRepository userRepository;
    private final RestClient restClient;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final SectionService sectionService;

    public AuthServiceOld(
            UserRepository userRepository,
            RestClient.Builder restClientBuilder,
            @Value("${python.service.url}") String pythonServiceUrl,
            StudentRepository studentRepository, FacultyRepository facultyRepository, SectionService sectionService) {
        this.userRepository = userRepository;
        this.restClient = restClientBuilder.baseUrl(pythonServiceUrl).build();
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.sectionService = sectionService;
    }

    public LoginResponse login(LoginRequest request) {

        String username = request.username().toUpperCase();
        Optional<AppUsersRecord> existingUser = userRepository.findByUsername(username);

        if (existingUser.isPresent()) {
            AppUsersRecord user = existingUser.get();

            if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Password not set. Please reset your password."
                );
            }

            if (!PasswordService.verify(user.getPasswordHash(), request.password().toCharArray())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            }

            return new LoginResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getFullName(),
                    user.getRole(),
                    user.getAvatarUrl(),
                    null
            );
        }

        ScrapedUserResponse scrapedUser = scrapeUserFromPortal(request);

        String hashedPassword = PasswordService.hash(request.password().toCharArray());
        AppUsersRecord newUser = userRepository.createOne(
                scrapedUser.username(),
                scrapedUser.email(),
                scrapedUser.phone(),
                scrapedUser.fullName(),
                hashedPassword,
                scrapedUser.role(),
                scrapedUser.avatarUrl()
        );


        if (newUser.getRole().equals("STUDENT")) {
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

            StudentsRecord newStudent = studentRepository.createOne(
                    newUser.getId(),
                    sectionId,
                    student.registerNumber(),
                    student.hosteler(),
                    student.lateralEntry(),
                    student.dob(),
                    student.gender()
            );
        } else {
            ScrapedFaculty faculty = scrapedUser.faculty();
            FacultyRecord newFaculty = facultyRepository.createOne(
                    newUser.getId(),
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

        return new LoginResponse(
                newUser.getId(),
                newUser.getUsername(),
                newUser.getEmail(),
                newUser.getPhone(),
                newUser.getFullName(),
                newUser.getRole(),
                newUser.getAvatarUrl(),
                null
        );
    }

    private ScrapedUserResponse scrapeUserFromPortal(LoginRequest request) {
        try {
            ScrapedUserResponse response = restClient.post()
                    .uri("/auth/scrape-login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(ScrapedUserResponse.class);
            if (response == null) {
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Received null response from scraping service"
                );
            }
            return response;
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid credentials on portal"
            );
        } catch (HttpClientErrorException.Gone e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Portal is currently unavailable"
            );
        } catch (HttpClientErrorException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Scraping service error: " + e.getResponseBodyAsString()
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to authenticate with portal: " + e.getMessage()
            );
        }
    }
}
