import 'package:dio/dio.dart';

import '../domain/models.dart';

class StudentRepository {
  StudentRepository(this._dio);

  final Dio _dio;

  Future<ProfileResponse> fetchProfile() async {
    final response = await _dio.get<Map<String, dynamic>>('/me/profile');
    return ProfileResponse.fromJson(response.data!);
  }

  Future<List<EnrolledCourse>> fetchCourses() async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/me/student/enrolled-courses',
    );
    final coursesJson = (response.data?['courses'] as List<dynamic>? ?? [])
        .cast<Map<String, dynamic>>();
    return coursesJson.map(EnrolledCourse.fromJson).toList();
  }
}
