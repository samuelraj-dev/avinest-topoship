import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../../../core/storage/token_storage.dart';
import '../data/auth_repository.dart';
import '../domain/models.dart';

class SessionState {
  const SessionState({
    required this.isAuthenticated,
    this.role,
    this.username,
  });

  final bool isAuthenticated;
  final String? role;
  final String? username;

  SessionState copyWith({
    bool? isAuthenticated,
    String? role,
    String? username,
  }) {
    return SessionState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      role: role ?? this.role,
      username: username ?? this.username,
    );
  }
}

class AuthController extends StateNotifier<AsyncValue<SessionState>> {
  AuthController(
    this._authRepository,
    this._tokenStorage,
    this._dio,
  ) : super(const AsyncData(SessionState(isAuthenticated: false)));

  final AuthRepository _authRepository;
  final TokenStorage _tokenStorage;
  final Dio _dio;

  bool _isRefreshing = false;

  Future<void> init() async {
    final accessToken = await _tokenStorage.getAccessToken();
    if (accessToken == null || accessToken.isEmpty) {
      state = const AsyncData(SessionState(isAuthenticated: false));
      return;
    }
    state = const AsyncData(SessionState(isAuthenticated: true));
  }

  Future<void> login(String username, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final response = await _authRepository.login(
        username: username,
        password: password,
      );
      await _persistTokens(response.token);
      return SessionState(
        isAuthenticated: true,
        role: response.role,
        username: response.username,
      );
    });
  }

  Future<void> logout() async {
    final refreshToken = await _tokenStorage.getRefreshToken();
    if (refreshToken != null && refreshToken.isNotEmpty) {
      try {
        await _authRepository.logout(refreshToken);
      } catch (_) {}
    }
    await _tokenStorage.clear();
    _dio.options.headers.remove('Authorization');
    state = const AsyncData(SessionState(isAuthenticated: false));
  }

  Future<String?> refreshAccessToken() async {
    if (_isRefreshing) return null;
    _isRefreshing = true;
    try {
      final refreshToken = await _tokenStorage.getRefreshToken();
      if (refreshToken == null || refreshToken.isEmpty) {
        await logout();
        return null;
      }
      final newTokens = await _authRepository.refresh(refreshToken);
      await _persistTokens(newTokens);
      return newTokens.accessToken;
    } catch (_) {
      await logout();
      return null;
    } finally {
      _isRefreshing = false;
    }
  }

  Future<void> _persistTokens(SessionTokens token) async {
    await _tokenStorage.saveTokens(
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    );
    _dio.options.headers['Authorization'] = 'Bearer ${token.accessToken}';
  }
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.watch(dioProvider));
});

final authControllerProvider =
    StateNotifierProvider<AuthController, AsyncValue<SessionState>>((ref) {
  return AuthController(
    ref.watch(authRepositoryProvider),
    ref.watch(tokenStorageProvider),
    ref.watch(dioProvider),
  );
});
