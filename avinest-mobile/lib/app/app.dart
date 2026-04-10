import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/network/api_client_setup.dart';
import '../features/auth/presentation/auth_controller.dart';
import 'router.dart';

class AvinestApp extends ConsumerStatefulWidget {
  const AvinestApp({super.key});

  @override
  ConsumerState<AvinestApp> createState() => _AvinestAppState();
}

class _AvinestAppState extends ConsumerState<AvinestApp> {
  @override
  void initState() {
    super.initState();
    Future<void>(() async {
      ref.read(apiClientSetupProvider);
      await ref.read(authControllerProvider.notifier).init();
    });
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'Avinest Mobile',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2563EB),
          primary: const Color(0xFF2563EB),
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        cardTheme: const CardThemeData(
          elevation: 0,
          margin: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(16)),
            side: BorderSide(color: Color(0xFFE2E8F0)),
          ),
        ),
        useMaterial3: true,
      ),
      routerConfig: router,
    );
  }
}
