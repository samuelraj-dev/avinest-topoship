import 'package:dio/dio.dart';

import '../domain/student_models.dart';

class StudentRepository {
  StudentRepository(this._dio);

  final Dio _dio;

  Future<StudentProfileResponse> fetchProfile() async {
    final response = await _dio.get<Map<String, dynamic>>('/me/profile');
    return StudentProfileResponse.fromJson(response.data ?? {});
  }

  Future<List<EnrolledCourse>> fetchEnrolledCourses() async {
    final response = await _dio.get<List<dynamic>>('/me/student/enrolled-courses');
    final list = (response.data ?? []).cast<dynamic>();
    return list
        .map((e) => EnrolledCourse.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<FacultyWithCourses>> fetchMyFaculties() async {
    final response = await _dio.get<List<dynamic>>('/me/student/my-faculties');
    final list = (response.data ?? []).cast<dynamic>();
    return list
        .map((e) => FacultyWithCourses.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<TimetableResponse> fetchTimetable() async {
    final response = await _dio.get<Map<String, dynamic>>('/me/student/timetable');
    return TimetableResponse.fromJson(response.data ?? {});
  }

  Future<StudentMarksResponse> fetchMarks() async {
    final response = await _dio.get<Map<String, dynamic>>('/me/student/marks');
    return StudentMarksResponse.fromJson(response.data ?? {});
  }

  Future<StudentGradebookResponse> fetchGrades() async {
    final response = await _dio.get<Map<String, dynamic>>('/me/student/grades');
    return StudentGradebookResponse.fromJson(response.data ?? {});
  }

  Future<void> syncTimetable(String password) async {
    await _dio.post<void>('/me/student/sync/timetable', data: {'password': password});
  }

  Future<void> syncMarks(String password) async {
    await _dio.post<void>('/me/student/sync/marks', data: {'password': password});
  }

  Future<void> syncGrades(String password) async {
    await _dio.post<void>('/me/student/sync/grades', data: {'password': password});
  }

  Future<void> syncAll(String password) async {
    await syncTimetable(password);
    await syncMarks(password);
    await syncGrades(password);
  }
}
