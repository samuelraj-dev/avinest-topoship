import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/presentation/auth_controller.dart';
import '../providers.dart';

final apiClientSetupProvider = Provider<void>((ref) {
  final dio = ref.watch(dioProvider);
  final tokenStorage = ref.watch(tokenStorageProvider);

  dio.interceptors.clear();
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await tokenStorage.getAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (err, handler) async {
        final request = err.requestOptions;
        final isUnauthorized = err.response?.statusCode == 401;
        final isAuthPath = request.path.contains('/auth/login') ||
            request.path.contains('/auth/refresh');
        final alreadyRetried = request.extra['retried'] == true;

        if (!isUnauthorized || isAuthPath || alreadyRetried) {
          handler.next(err);
          return;
        }

        final controller = ref.read(authControllerProvider.notifier);
        final refreshedToken = await controller.refreshAccessToken();
        if (refreshedToken == null) {
          handler.next(err);
          return;
        }

        request.extra['retried'] = true;
        request.headers['Authorization'] = 'Bearer $refreshedToken';
        final retryResponse = await dio.fetch(request);
        handler.resolve(retryResponse);
      },
    ),
  );
});
