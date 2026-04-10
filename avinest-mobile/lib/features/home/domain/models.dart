class ProfileResponse {
  ProfileResponse({
    required this.role,
    required this.user,
    required this.student,
  });

  final String role;
  final User user;
  final Student? student;

  factory ProfileResponse.fromJson(Map<String, dynamic> json) {
    return ProfileResponse(
      role: json['role'] as String,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      student: json['student'] == null
          ? null
          : Student.fromJson(json['student'] as Map<String, dynamic>),
    );
  }
}

class User {
  User({
    required this.id,
    required this.fullName,
    required this.username,
    required this.email,
  });

  final int id;
  final String fullName;
  final String username;
  final String email;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      fullName: json['full_name'] as String? ?? '',
      username: json['username'] as String? ?? '',
      email: json['email'] as String? ?? '',
    );
  }
}

class Student {
  Student({
    required this.registerNumber,
    required this.currentSectionId,
  });

  final String registerNumber;
  final int currentSectionId;

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      registerNumber: json['register_number'] as String? ?? '',
      currentSectionId: json['current_section_id'] as int? ?? 0,
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
  final int credits;

  factory EnrolledCourse.fromJson(Map<String, dynamic> json) {
    return EnrolledCourse(
      code: json['code'] as String? ?? '',
      title: json['title'] as String? ?? '',
      nature: json['nature'] as String? ?? '',
      credits: json['credits'] as int? ?? 0,
    );
  }
}
