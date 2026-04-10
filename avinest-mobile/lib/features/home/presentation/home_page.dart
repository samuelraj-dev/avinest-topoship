import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/student_repository.dart';
import '../domain/models.dart';

final studentRepositoryProvider = Provider<StudentRepository>((ref) {
  return StudentRepository(ref.watch(dioProvider));
});

final profileProvider = FutureProvider<ProfileResponse>((ref) {
  return ref.watch(studentRepositoryProvider).fetchProfile();
});

final coursesProvider = FutureProvider<List<EnrolledCourse>>((ref) {
  return ref.watch(studentRepositoryProvider).fetchCourses();
});

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(profileProvider);
    final coursesAsync = ref.watch(coursesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Avinest'),
        actions: [
          IconButton(
            onPressed: () async {
              await ref.read(authControllerProvider.notifier).logout();
            },
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(profileProvider);
          ref.invalidate(coursesProvider);
          await Future.wait([
            ref.read(profileProvider.future),
            ref.read(coursesProvider.future),
          ]);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            profileAsync.when(
              data: (profile) => _ProfileCard(profile: profile),
              loading: () => const _LoadingCard(),
              error: (error, _) => _ErrorCard(message: error.toString()),
            ),
            const SizedBox(height: 16),
            Text(
              'Enrolled Courses',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            coursesAsync.when(
              data: (courses) => Column(
                children: [
                  for (final course in courses)
                    Card(
                      child: ListTile(
                        title: Text(course.title),
                        subtitle: Text('${course.code}  ${course.nature}'),
                        trailing: Text('${course.credits} cr'),
                      ),
                    ),
                ],
              ),
              loading: () => const _LoadingCard(),
              error: (error, _) => _ErrorCard(message: error.toString()),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  const _ProfileCard({required this.profile});

  final ProfileResponse profile;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              profile.user.fullName.isEmpty ? 'User' : profile.user.fullName,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 6),
            Text('Role: ${profile.role}'),
            Text('Username: ${profile.user.username}'),
            Text('Email: ${profile.user.email}'),
            if (profile.student != null) ...[
              const SizedBox(height: 8),
              Text('Register no: ${profile.student!.registerNumber}'),
              Text('Section id: ${profile.student!.currentSectionId}'),
            ],
          ],
        ),
      ),
    );
  }
}

class _LoadingCard extends StatelessWidget {
  const _LoadingCard();

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(20),
        child: Center(child: CircularProgressIndicator()),
      ),
    );
  }
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Text(
          'Failed to load data: $message',
          style: TextStyle(color: Theme.of(context).colorScheme.error),
        ),
      ),
    );
  }
}
