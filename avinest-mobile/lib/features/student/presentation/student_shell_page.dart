import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers.dart';
import '../../auth/presentation/auth_controller.dart';
import '../data/student_repository.dart';
import '../domain/student_models.dart';

final studentRepositoryProvider = Provider<StudentRepository>((ref) {
  return StudentRepository(ref.watch(dioProvider));
});

final studentProfileProvider = FutureProvider<StudentProfileResponse>((ref) {
  return ref.watch(studentRepositoryProvider).fetchProfile();
});
final enrolledCoursesProvider = FutureProvider<List<EnrolledCourse>>((ref) {
  return ref.watch(studentRepositoryProvider).fetchEnrolledCourses();
});
final myFacultiesProvider = FutureProvider<List<FacultyWithCourses>>((ref) {
  return ref.watch(studentRepositoryProvider).fetchMyFaculties();
});
final studentTimetableProvider = FutureProvider<TimetableResponse>((ref) {
  return ref.watch(studentRepositoryProvider).fetchTimetable();
});
final studentMarksProvider = FutureProvider<StudentMarksResponse>((ref) {
  return ref.watch(studentRepositoryProvider).fetchMarks();
});
final studentGradesProvider = FutureProvider<StudentGradebookResponse>((ref) {
  return ref.watch(studentRepositoryProvider).fetchGrades();
});

class StudentShellPage extends ConsumerStatefulWidget {
  const StudentShellPage({super.key});

  @override
  ConsumerState<StudentShellPage> createState() => _StudentShellPageState();
}

class _StudentShellPageState extends ConsumerState<StudentShellPage> {
  int _currentTab = 0;
  bool _syncingAll = false;
  static const _quickNavTabs = [0, 3, 5, 6];

  Future<void> _askAndRunSync({
    required String title,
    required Future<void> Function(String password) action,
    required VoidCallback onInvalidate,
  }) async {
    final controller = TextEditingController();
    final password = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: TextField(
          controller: controller,
          obscureText: true,
          decoration: const InputDecoration(
            labelText: 'Password',
            hintText: 'Enter your portal password',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('Sync'),
          ),
        ],
      ),
    );
    if (password == null || password.isEmpty) return;

    try {
      await action(password);
      onInvalidate();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Sync completed successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sync failed: $e')),
        );
      }
    }
  }

  Future<void> _syncAll() async {
    final controller = TextEditingController();
    final password = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sync All'),
        content: TextField(
          controller: controller,
          obscureText: true,
          decoration: const InputDecoration(labelText: 'Password'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('Start'),
          ),
        ],
      ),
    );
    if (password == null || password.isEmpty) return;
    setState(() => _syncingAll = true);
    try {
      await ref.read(studentRepositoryProvider).syncAll(password);
      ref.invalidate(studentTimetableProvider);
      ref.invalidate(studentMarksProvider);
      ref.invalidate(studentGradesProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Synced timetable, marks and grade book')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sync all failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _syncingAll = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final menuItems = const [
      _MenuItem('Dashboard', Icons.dashboard_outlined),
      _MenuItem('Profile', Icons.person_outline),
      _MenuItem('Courses', Icons.menu_book_outlined),
      _MenuItem('Timetable', Icons.schedule_outlined),
      _MenuItem('My Faculties', Icons.groups_2_outlined),
      _MenuItem('Marks', Icons.assignment_outlined),
      _MenuItem('Grade Book', Icons.school_outlined),
    ];

    final pages = <Widget>[
      _DashboardPage(
        syncingAll: _syncingAll,
        onSyncAll: _syncAll,
      ),
      const _ProfilePage(),
      const _CoursesPage(),
      _TimetablePage(
        onSync: () => _askAndRunSync(
          title: 'Sync Timetable',
          action: ref.read(studentRepositoryProvider).syncTimetable,
          onInvalidate: () => ref.invalidate(studentTimetableProvider),
        ),
      ),
      const _FacultiesPage(),
      _MarksPage(
        onSync: () => _askAndRunSync(
          title: 'Sync Marks',
          action: ref.read(studentRepositoryProvider).syncMarks,
          onInvalidate: () => ref.invalidate(studentMarksProvider),
        ),
      ),
      _GradebookPage(
        onSync: () => _askAndRunSync(
          title: 'Sync Grade Book',
          action: ref.read(studentRepositoryProvider).syncGrades,
          onInvalidate: () => ref.invalidate(studentGradesProvider),
        ),
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: const Color(0xFF1E3A8A),
        foregroundColor: Colors.white,
        title: const Text(
          'Avinest Student',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        actions: [
          IconButton(
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
          ),
        ],
      ),
      drawer: Drawer(
        child: Column(
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF2563EB), Color(0xFF4F46E5)],
                ),
              ),
              child: Align(
                alignment: Alignment.bottomLeft,
                child: Text(
                  'Student Portal',
                  style: Theme.of(context)
                      .textTheme
                      .titleLarge
                      ?.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
                ),
              ),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: menuItems.length,
                itemBuilder: (context, index) {
                  final item = menuItems[index];
                  return ListTile(
                    leading: Icon(item.icon),
                    title: Text(item.label),
                    selected: _currentTab == index,
                    selectedTileColor: const Color(0xFFDBEAFE),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    onTap: () {
                      setState(() => _currentTab = index);
                      Navigator.pop(context);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFE0E7FF), Color(0xFFF8FAFC), Color(0xFFFFFFFF)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: IndexedStack(index: _currentTab, children: pages),
      ),
      bottomNavigationBar: NavigationBar(
        indicatorColor: const Color(0xFFDBEAFE),
        selectedIndex: _quickNavTabs.indexOf(_currentTab).clamp(0, 3),
        onDestinationSelected: (index) =>
            setState(() => _currentTab = _quickNavTabs[index]),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.schedule), label: 'Timetable'),
          NavigationDestination(icon: Icon(Icons.assignment), label: 'Marks'),
          NavigationDestination(icon: Icon(Icons.school), label: 'Grades'),
        ],
      ),
    );
  }
}

class _DashboardPage extends ConsumerWidget {
  const _DashboardPage({required this.syncingAll, required this.onSyncAll});
  final bool syncingAll;
  final Future<void> Function() onSyncAll;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(studentProfileProvider);
    final courses = ref.watch(enrolledCoursesProvider);
    final marks = ref.watch(studentMarksProvider);
    final grades = ref.watch(studentGradesProvider);
    final timetable = ref.watch(studentTimetableProvider);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(studentProfileProvider);
        ref.invalidate(enrolledCoursesProvider);
        ref.invalidate(studentMarksProvider);
        ref.invalidate(studentGradesProvider);
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Dashboard',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF0F172A),
                      ),
                ),
              ),
              FilledButton.icon(
                onPressed: syncingAll ? null : onSyncAll,
                icon: syncingAll
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.sync),
                label: Text(syncingAll ? 'Syncing...' : 'Sync All'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          profile.when(
            data: (p) => _HeroCard(
              title: 'Welcome ${p.user.fullName.split(' ').first}',
              subtitle: p.student?.registerNumber ?? p.user.username,
            ),
            loading: _loadingCard,
            error: _errorCard,
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _MetricAsyncCard(
                  title: 'Courses',
                  future: courses,
                  valueBuilder: (data) => '${data.length}',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _MetricAsyncCard(
                  title: 'CGPA',
                  future: grades,
                  valueBuilder: (data) => data.cgpa.toStringAsFixed(2),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _MetricAsyncCard(
                  title: 'Arrears',
                  future: grades,
                  valueBuilder: (data) => '${data.totalArrears}',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _MetricAsyncCard(
                  title: 'Subjects',
                  future: marks,
                  valueBuilder: (data) => '${data.subjects.length}',
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _MetricAsyncCard(
                  title: 'Total Credits',
                  future: courses,
                  valueBuilder: (data) => data
                      .fold<double>(0, (sum, c) => sum + c.credits)
                      .toStringAsFixed(1),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _MetricAsyncCard(
                  title: 'Today Classes',
                  future: timetable,
                  valueBuilder: (data) {
                    final now = DateTime.now();
                    const map = {
                      1: 'MON',
                      2: 'TUE',
                      3: 'WED',
                      4: 'THU',
                      5: 'FRI',
                      6: 'SAT',
                      7: 'SUN',
                    };
                    final day = map[now.weekday] ?? 'MON';
                    final periods = data.days
                        .where((d) => d.day == day)
                        .map((d) => d.periods.length)
                        .fold<int>(0, (a, b) => a + b);
                    return '$periods';
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProfilePage extends ConsumerWidget {
  const _ProfilePage();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(studentProfileProvider);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Profile', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 12),
        profile.when(
          data: (p) => Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(p.user.fullName, style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 8),
                  Text('Username: ${p.user.username}'),
                  Text('Email: ${p.user.email}'),
                  Text('Phone: ${p.user.phone}'),
                  if (p.student != null) ...[
                    const Divider(height: 24),
                    Text('Register: ${p.student!.registerNumber}'),
                    Text('Section: ${p.student!.currentSectionId}'),
                    Text('Gender: ${p.student!.gender}'),
                  ],
                ],
              ),
            ),
          ),
          loading: _loadingCard,
          error: _errorCard,
        ),
      ],
    );
  }
}

class _CoursesPage extends ConsumerWidget {
  const _CoursesPage();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final courses = ref.watch(enrolledCoursesProvider);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Enrolled Courses', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 12),
        courses.when(
          data: (items) => Column(
            children: _withGaps(
              items.map((c) {
                return Card(
                  surfaceTintColor: Colors.transparent,
                  child: ListTile(
                    title: Text(c.title),
                    subtitle: Text('${c.code}  ${c.nature.replaceAll('_', ' ')}'),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEEF2FF),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text('${c.credits} cr'),
                    ),
                  ),
                );
              }).toList(),
              gap: 10,
            ),
          ),
          loading: _loadingCard,
          error: _errorCard,
        ),
      ],
    );
  }
}

class _TimetablePage extends ConsumerStatefulWidget {
  const _TimetablePage({required this.onSync});
  final Future<void> Function() onSync;

  @override
  ConsumerState<_TimetablePage> createState() => _TimetablePageState();
}

class _TimetablePageState extends ConsumerState<_TimetablePage> {
  String _selectedDay = 'MON';

  @override
  Widget build(BuildContext context) {
    final timetable = ref.watch(studentTimetableProvider);
    const orderedDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(child: Text('Timetable', style: Theme.of(context).textTheme.headlineSmall)),
            OutlinedButton.icon(
              onPressed: widget.onSync,
              icon: const Icon(Icons.sync),
              label: const Text('Sync'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        timetable.when(
          data: (data) {
            final byDay = {for (final d in data.days) d.day: d.periods};
            final periods = byDay[_selectedDay] ?? const <TimetablePeriod>[];
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: orderedDays.map((day) {
                      final selected = day == _selectedDay;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(day),
                          selected: selected,
                          showCheckmark: false,
                          selectedColor: const Color(0xFF2563EB),
                          backgroundColor: Colors.white,
                          labelStyle: TextStyle(
                            color: selected ? Colors.white : const Color(0xFF334155),
                            fontWeight: FontWeight.w600,
                          ),
                          onSelected: (_) => setState(() => _selectedDay = day),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 12),
                if (periods.isEmpty)
                  const Card(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: Text('No classes scheduled for this day.'),
                    ),
                  ),
                ..._withGaps(
                  periods
                      .map(
                        (p) => Card(
                          elevation: 2,
                          shadowColor: Colors.black12,
                          child: Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(16),
                              gradient: LinearGradient(
                                colors: [
                                  Colors.white,
                                  _natureColor(p.primary.courseNature).withValues(alpha: 0.08),
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                            ),
                            child: ListTile(
                              title: Text('P${p.period}  ${p.primary.courseCode}'),
                              subtitle: Text(
                                '${p.primary.courseTitle}\n${p.primary.facultyName} (${p.primary.facultyCode})',
                              ),
                              isThreeLine: true,
                            ),
                          ),
                        ),
                      )
                      .toList(),
                  gap: 10,
                ),
              ],
            );
          },
          loading: _loadingCard,
          error: _errorCard,
        ),
      ],
    );
  }
}

class _FacultiesPage extends ConsumerWidget {
  const _FacultiesPage();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final faculties = ref.watch(myFacultiesProvider);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('My Faculties', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 12),
        faculties.when(
          data: (items) => Column(
            children: _withGaps(
              items.map((f) {
                return Card(
                  child: ListTile(
                    title: Text(f.fullName),
                    subtitle: Text(
                      '${f.staffCode} • ${f.department}\n${f.courses.join(', ')}',
                    ),
                    isThreeLine: true,
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(f.designation, style: const TextStyle(fontSize: 12)),
                    ),
                  ),
                );
              }).toList(),
              gap: 10,
            ),
          ),
          loading: _loadingCard,
          error: _errorCard,
        ),
      ],
    );
  }
}

class _MarksPage extends ConsumerWidget {
  const _MarksPage({required this.onSync});
  final Future<void> Function() onSync;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final marks = ref.watch(studentMarksProvider);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(child: Text('Marks', style: Theme.of(context).textTheme.headlineSmall)),
            OutlinedButton.icon(
              onPressed: onSync,
              icon: const Icon(Icons.sync),
              label: const Text('Sync'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        marks.when(
          data: (res) => Column(
            children: _withGaps(
              res.subjects.map((s) {
                return Card(
                  elevation: 2,
                  shadowColor: Colors.black12,
                  child: ExpansionTile(
                    tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    title: Text(s.courseName),
                    subtitle: Text('${s.courseCode} • ${s.nature.replaceAll('_', ' ')}'),
                    trailing: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDCFCE7),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text('CAT ${_avg(s.cat).toStringAsFixed(1)}'),
                    ),
                    children: [
                      _MarksGrid(
                        title: 'CAT',
                        data: s.cat,
                        keys: const ['co1', 'co2', 'co3', 'co4', 'co5'],
                      ),
                      const SizedBox(height: 10),
                      _MarksGrid(
                        title: 'Assignments',
                        data: s.assignment,
                        keys: const ['a1', 'a2', 'a3', 'a4', 'a5'],
                      ),
                      const SizedBox(height: 10),
                      _MarksGrid(
                        title: 'Lab',
                        data: s.lab,
                        keys: const ['cycle1', 'cycle2', 'cycle3', 'mock'],
                      ),
                    ],
                  ),
                );
              }).toList(),
              gap: 12,
            ),
          ),
          loading: _loadingCard,
          error: _errorCard,
        ),
      ],
    );
  }

  double _avg(Map<String, num> values) {
    if (values.isEmpty) return 0;
    final nums = values.values.toList();
    return nums.reduce((a, b) => a + b) / nums.length;
  }
}

class _GradebookPage extends ConsumerWidget {
  const _GradebookPage({required this.onSync});
  final Future<void> Function() onSync;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final grades = ref.watch(studentGradesProvider);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Expanded(child: Text('Grade Book', style: Theme.of(context).textTheme.headlineSmall)),
            OutlinedButton.icon(
              onPressed: onSync,
              icon: const Icon(Icons.sync),
              label: const Text('Sync'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        grades.when(
          data: (g) => Column(
            children: [
              Card(
                elevation: 2,
                shadowColor: Colors.black12,
                child: ListTile(
                  title: const Text('Cumulative CGPA'),
                  subtitle: Text('Arrears: ${g.totalArrears}'),
                  trailing: Text(g.cgpa.toStringAsFixed(2)),
                ),
              ),
              const SizedBox(height: 12),
              ..._withGaps(
                g.semesters.map(
                  (s) => Card(
                    elevation: 2,
                    shadowColor: Colors.black12,
                    child: ExpansionTile(
                      tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      childrenPadding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                      title: Text('Semester ${s.semester}'),
                      subtitle: Text('GPA ${s.gpa.toStringAsFixed(2)} • ${s.arrears} arrears'),
                      children: _withGaps(
                        s.courses.map(
                          (c) => Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: ListTile(
                              title: Text(c.courseName),
                              subtitle: Text(c.courseCode),
                              trailing: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: _gradeBadgeBg(c.grade),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text('${c.grade} (${c.result})'),
                              ),
                            ),
                          ),
                        ).toList(),
                        gap: 8,
                      ),
                    ),
                  ),
                ).toList(),
                gap: 12,
              ),
            ],
          ),
          loading: _loadingCard,
          error: _errorCard,
        ),
      ],
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.title, required this.subtitle});
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: const LinearGradient(
          colors: [Color(0xFF2563EB), Color(0xFF4338CA)],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(color: Colors.white70)),
        ],
      ),
    );
  }
}

class _MetricAsyncCard<T> extends StatelessWidget {
  const _MetricAsyncCard({
    required this.title,
    required this.future,
    required this.valueBuilder,
  });

  final String title;
  final AsyncValue<T> future;
  final String Function(T data) valueBuilder;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: const Color(0xFFEFF6FF),
      elevation: 1.5,
      shadowColor: Colors.black12,
      surfaceTintColor: Colors.transparent,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: future.when(
          data: (data) => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 4),
              Text(
                valueBuilder(data),
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF1E3A8A),
                    ),
              ),
            ],
          ),
          loading: () => const Center(child: CircularProgressIndicator(strokeWidth: 2)),
          error: (e, _) => Text('Error', style: TextStyle(color: Theme.of(context).colorScheme.error)),
        ),
      ),
    );
  }
}

Widget _loadingCard() => const Card(
      child: Padding(
        padding: EdgeInsets.all(20),
        child: Center(child: CircularProgressIndicator()),
      ),
    );

Widget _errorCard(Object error, StackTrace stack) => Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Text('Failed to load: $error'),
      ),
    );

class _MenuItem {
  const _MenuItem(this.label, this.icon);
  final String label;
  final IconData icon;
}

Color _natureColor(String nature) {
  switch (nature) {
    case 'THEORY':
      return const Color(0xFF3B82F6);
    case 'LAB':
      return const Color(0xFF10B981);
    case 'LAB_ORIENTED_THEORY':
      return const Color(0xFF8B5CF6);
    case 'INDUSTRY_ORIENTED':
      return const Color(0xFFF59E0B);
    default:
      return const Color(0xFF64748B);
  }
}

Color _gradeBadgeBg(String grade) {
  switch (grade) {
    case 'O':
    case 'A+':
      return const Color(0xFFDCFCE7);
    case 'A':
    case 'B+':
      return const Color(0xFFDBEAFE);
    case 'B':
    case 'C':
      return const Color(0xFFFEF3C7);
    default:
      return const Color(0xFFFEE2E2);
  }
}

class _MarksGrid extends StatelessWidget {
  const _MarksGrid({
    required this.title,
    required this.data,
    required this.keys,
  });

  final String title;
  final Map<String, num> data;
  final List<String> keys;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.w700,
            color: Color(0xFF1E3A8A),
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: keys.map((key) {
            final v = data[key];
            return Container(
              width: 92,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    key.toUpperCase(),
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFF64748B),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    v == null ? '--' : '$v',
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

List<Widget> _withGaps(List<Widget> children, {double gap = 8}) {
  if (children.isEmpty) return children;
  final out = <Widget>[];
  for (var i = 0; i < children.length; i++) {
    out.add(children[i]);
    if (i != children.length - 1) {
      out.add(SizedBox(height: gap));
    }
  }
  return out;
}
