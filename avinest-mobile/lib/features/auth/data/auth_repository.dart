import 'package:dio/dio.dart';

import '../domain/models.dart';

class AuthRepository {
  AuthRepository(this._dio);

  final Dio _dio;

  Future<LoginResponse> login({
    required String username,
    required String password,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/login',
      data: {
        'username': username,
        'password': password,
      },
    );
    return LoginResponse.fromJson(response.data!);
  }

  Future<SessionTokens> refresh(String refreshToken) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/refresh',
      data: {'refresh_token': refreshToken},
    );
    return SessionTokens.fromJson(response.data!);
  }

  Future<void> logout(String refreshToken) async {
    await _dio.post<void>(
      '/auth/logout',
      data: {'refresh_token': refreshToken},
    );
  }
}
