class StudentProfileResponse {
  StudentProfileResponse({
    required this.role,
    required this.user,
    required this.student,
  });

  final String role;
  final StudentUser user;
  final StudentMeta? student;

  factory StudentProfileResponse.fromJson(Map<String, dynamic> json) {
    return StudentProfileResponse(
      role: (json['role'] ?? '').toString(),
      user: StudentUser.fromJson((json['user'] ?? {}) as Map<String, dynamic>),
      student: json['student'] == null
          ? null
          : StudentMeta.fromJson(json['student'] as Map<String, dynamic>),
    );
  }
}

class StudentUser {
  StudentUser({
    required this.id,
    required this.fullName,
    required this.username,
    required this.email,
    required this.phone,
  });

  final int id;
  final String fullName;
  final String username;
  final String email;
  final String phone;

  factory StudentUser.fromJson(Map<String, dynamic> json) {
    return StudentUser(
      id: (json['id'] as num?)?.toInt() ?? 0,
      fullName: (json['full_name'] ?? '').toString(),
      username: (json['username'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      phone: (json['phone'] ?? '').toString(),
    );
  }
}

class StudentMeta {
  StudentMeta({
    required this.registerNumber,
    required this.currentSectionId,
    required this.gender,
  });

  final String registerNumber;
  final int currentSectionId;
  final String gender;

  factory StudentMeta.fromJson(Map<String, dynamic> json) {
    return StudentMeta(
      registerNumber: (json['register_number'] ?? '').toString(),
      currentSectionId: (json['current_section_id'] as num?)?.toInt() ?? 0,
      gender: (json['gender'] ?? '').toString(),
    );
  }
}

class EnrolledCourse {
  EnrolledCourse({
    required this.code,
    required this.title,
    required this.nature,
    required this.credits,
  });

  final String code;
  final String title;
  final String nature;
  final double credits;

  factory EnrolledCourse.fromJson(Map<String, dynamic> json) {
    return EnrolledCourse(
      code: (json['code'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      nature: (json['nature'] ?? '').toString(),
      credits: (json['credits'] as num?)?.toDouble() ?? 0,
    );
  }
}

class FacultyWithCourses {
  FacultyWithCourses({
    required this.staffCode,
    required this.fullName,
    required this.department,
    required this.designation,
    required this.courses,
  });

  final String staffCode;
  final String fullName;
  final String department;
  final String designation;
  final List<String> courses;

  factory FacultyWithCourses.fromJson(Map<String, dynamic> json) {
    return FacultyWithCourses(
      staffCode: (json['staff_code'] ?? '').toString(),
      fullName: (json['full_name'] ?? '').toString(),
      department: (json['department'] ?? '').toString(),
      designation: (json['designation'] ?? '').toString(),
      courses: (json['courses'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(),
    );
  }
}

class TimetableResponse {
  TimetableResponse({
    required this.sectionId,
    required this.days,
  });

  final int sectionId;
  final List<TimetableDay> days;

  factory TimetableResponse.fromJson(Map<String, dynamic> json) {
    return TimetableResponse(
      sectionId: (json['section_id'] as num?)?.toInt() ?? 0,
      days: (json['days'] as List<dynamic>? ?? [])
          .map((e) => TimetableDay.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class TimetableDay {
  TimetableDay({required this.day, required this.periods});

  final String day;
  final List<TimetablePeriod> periods;

  factory TimetableDay.fromJson(Map<String, dynamic> json) {
    return TimetableDay(
      day: (json['day'] ?? '').toString(),
      periods: (json['periods'] as List<dynamic>? ?? [])
          .map((e) => TimetablePeriod.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class TimetablePeriod {
  TimetablePeriod({required this.period, required this.primary, this.alt});

  final int period;
  final CourseSlot primary;
  final CourseSlot? alt;

  factory TimetablePeriod.fromJson(Map<String, dynamic> json) {
    return TimetablePeriod(
      period: (json['period'] as num?)?.toInt() ?? 0,
      primary: CourseSlot.fromJson((json['primary'] ?? {}) as Map<String, dynamic>),
      alt: json['alt'] == null
          ? null
          : CourseSlot.fromJson(json['alt'] as Map<String, dynamic>),
    );
  }
}

class CourseSlot {
  CourseSlot({
    required this.courseCode,
    required this.courseTitle,
    required this.courseNature,
    required this.facultyName,
    required this.facultyCode,
  });

  final String courseCode;
  final String courseTitle;
  final String courseNature;
  final String facultyName;
  final String facultyCode;

  factory CourseSlot.fromJson(Map<String, dynamic> json) {
    return CourseSlot(
      courseCode: (json['course_code'] ?? '').toString(),
      courseTitle: (json['course_title'] ?? '').toString(),
      courseNature: (json['course_nature'] ?? '').toString(),
      facultyName: (json['faculty_name'] ?? '').toString(),
      facultyCode: (json['faculty_code'] ?? '').toString(),
    );
  }
}

class StudentMarksResponse {
  StudentMarksResponse({required this.subjects});

  final List<SubjectMarks> subjects;

  factory StudentMarksResponse.fromJson(Map<String, dynamic> json) {
    return StudentMarksResponse(
      subjects: (json['subjects'] as List<dynamic>? ?? [])
          .map((e) => SubjectMarks.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class SubjectMarks {
  SubjectMarks({
    required this.courseCode,
    required this.courseName,
    required this.nature,
    required this.cat,
    required this.assignment,
    required this.lab,
  });

  final String courseCode;
  final String courseName;
  final String nature;
  final Map<String, num> cat;
  final Map<String, num> assignment;
  final Map<String, num> lab;

  factory SubjectMarks.fromJson(Map<String, dynamic> json) {
    Map<String, num> toNumMap(dynamic v) {
      final map = (v as Map<String, dynamic>?) ?? <String, dynamic>{};
      return map.map((k, value) => MapEntry(k, (value as num?) ?? 0));
    }

    return SubjectMarks(
      courseCode: (json['course_code'] ?? '').toString(),
      courseName: (json['course_name'] ?? '').toString(),
      nature: (json['nature'] ?? '').toString(),
      cat: toNumMap(json['cat']),
      assignment: toNumMap(json['assignment']),
      lab: toNumMap(json['lab']),
    );
  }
}

class StudentGradebookResponse {
  StudentGradebookResponse({
    required this.cgpa,
    required this.totalArrears,
    required this.semesters,
  });

  final double cgpa;
  final int totalArrears;
  final List<SemesterGrade> semesters;

  factory StudentGradebookResponse.fromJson(Map<String, dynamic> json) {
    return StudentGradebookResponse(
      cgpa: (json['cgpa'] as num?)?.toDouble() ?? 0,
      totalArrears: (json['total_arrears'] as num?)?.toInt() ?? 0,
      semesters: (json['semesters'] as List<dynamic>? ?? [])
          .map((e) => SemesterGrade.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class SemesterGrade {
  SemesterGrade({
    required this.semester,
    required this.gpa,
    required this.arrears,
    required this.courses,
  });

  final int semester;
  final double gpa;
  final int arrears;
  final List<CourseGrade> courses;

  factory SemesterGrade.fromJson(Map<String, dynamic> json) {
    return SemesterGrade(
      semester: (json['semester'] as num?)?.toInt() ?? 0,
      gpa: (json['gpa'] as num?)?.toDouble() ?? 0,
      arrears: (json['arrears'] as num?)?.toInt() ?? 0,
      courses: (json['courses'] as List<dynamic>? ?? [])
          .map((e) => CourseGrade.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class CourseGrade {
  CourseGrade({
    required this.courseCode,
    required this.courseName,
    required this.credits,
    required this.grade,
    required this.gradePoints,
    required this.result,
  });

  final String courseCode;
  final String courseName;
  final double credits;
  final String grade;
  final double gradePoints;
  final String result;

  factory CourseGrade.fromJson(Map<String, dynamic> json) {
    return CourseGrade(
      courseCode: (json['course_code'] ?? '').toString(),
      courseName: (json['course_name'] ?? '').toString(),
      credits: (json['credits'] as num?)?.toDouble() ?? 0,
      grade: (json['grade'] ?? '').toString(),
      gradePoints: (json['grade_points'] as num?)?.toDouble() ?? 0,
      result: (json['result'] ?? '').toString(),
    );
  }
}
