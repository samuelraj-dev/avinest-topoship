class SessionTokens {
  SessionTokens({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
    required this.tokenType,
  });

  final String accessToken;
  final String refreshToken;
  final int? expiresIn;
  final String? tokenType;

  factory SessionTokens.fromJson(Map<String, dynamic> json) {
    return SessionTokens(
      accessToken: json['access_token'] as String,
      refreshToken: json['refresh_token'] as String,
      expiresIn: json['expires_in'] as int?,
      tokenType: json['token_type'] as String?,
    );
  }
}

class LoginResponse {
  LoginResponse({
    required this.id,
    required this.username,
    required this.role,
    required this.fullName,
    required this.token,
  });

  final int id;
  final String username;
  final String role;
  final String? fullName;
  final SessionTokens token;

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      id: json['id'] as int,
      username: json['username'] as String,
      role: json['role'] as String,
      fullName: json['full_name'] as String?,
      token: SessionTokens.fromJson(json['token'] as Map<String, dynamic>),
    );
  }
}
