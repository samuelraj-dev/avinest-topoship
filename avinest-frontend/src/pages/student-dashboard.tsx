import { useQueries, useQueryClient } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Book, Clock, AlertCircle, CheckCircle, RefreshCw, Loader } from 'lucide-react';
import api from '../api/client';
import { cn } from '../lib/utils/cn';
import { useState } from 'react';

type Profile = {
  role: "STUDENT";
  user: { id: number; full_name: string; email: string; avatar_url?: string };
  student: { register_number: string; current_section_id: number };
  faculty: null;
};

type EnrolledCourse = {
  code: string;
  title: string;
  nature: string;
  credits: number;
};

type TimetablePeriod = {
  period: number;
  primary: { course_code: string; course_title: string; course_nature: string; faculty_name: string };
  alt: any;
};

type TimetableResponse = {
  section_id: number;
  days: { day: string; periods: TimetablePeriod[] }[];
};

type CourseGrade = {
  course_code: string;
  course_name: string;
  credits: number;
  grade: string;
  grade_points: number;
  result: 'CLEARED' | 'ARREAR';
};

type GradebookResponse = {
  cgpa: number;
  total_arrears: number;
  semesters: { semester: number; gpa: number; arrears: number; courses: CourseGrade[] }[];
};

type SubjectMarks = {
  course_code: string;
  course_name: string;
  nature: string;
  cat: Record<string, number>;
  assignment: Record<string, number>;
  lab: Record<string, number>;
};

type SubjectMarksResponse = {
  subjects: SubjectMarks[];
};

export function StudentDashboard() {
  const queryClient = useQueryClient();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [syncStatus, setSyncStatus] = useState<{
    timetable?: 'idle' | 'loading' | 'success' | 'error';
    marks?: 'idle' | 'loading' | 'success' | 'error';
    grades?: 'idle' | 'loading' | 'success' | 'error';
  }>({ timetable: 'idle', marks: 'idle', grades: 'idle' });
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const results = useQueries({
    queries: [
      {
        queryKey: ['profile'],
        queryFn: async () => {
          const res = await api.get<Profile>('/me/profile');
          return res.data;
        },
      },
      {
        queryKey: ['enrolled-courses'],
        queryFn: async () => {
          const res = await api.get<{ courses: EnrolledCourse[] }>('/me/student/enrolled-courses');
          return res.data?.courses || [];
        },
      },
      {
        queryKey: ['student-timetable'],
        queryFn: async () => {
          const res = await api.get<TimetableResponse>('/me/student/timetable');
          return res.data;
        },
      },
      {
        queryKey: ['student-grades'],
        queryFn: async () => {
          const res = await api.get<GradebookResponse>('/me/student/grades');
          return res.data;
        },
      },
      {
        queryKey: ['student-marks'],
        queryFn: async () => {
          const res = await api.get<SubjectMarksResponse>('/me/student/marks');
          return res.data;
        },
      },
    ],
  });

  const [profileResult, coursesResult, timetableResult, gradesResult, marksResult] = results;

  const isLoading = results.some((r) => r.isLoading);

  const handleSyncAll = async () => {
    if (!password.trim()) {
      setSyncMessage({ type: 'error', text: 'Please enter your password.' });
      setTimeout(() => setSyncMessage(null), 3000);
      return;
    }

    setIsSyncing(true);
    setSyncStatus({ timetable: 'loading', marks: 'loading', grades: 'loading' });

    try {
      // Sync timetable
      try {
        setSyncStatus((prev) => ({ ...prev, timetable: 'loading' }));
        await api.post('/me/student/sync/timetable', { password });
        setSyncStatus((prev) => ({ ...prev, timetable: 'success' }));
      } catch (err) {
        setSyncStatus((prev) => ({ ...prev, timetable: 'error' }));
      }

      // Sync marks
      try {
        setSyncStatus((prev) => ({ ...prev, marks: 'loading' }));
        await api.post('/me/student/sync/marks', { password });
        setSyncStatus((prev) => ({ ...prev, marks: 'success' }));
      } catch (err) {
        setSyncStatus((prev) => ({ ...prev, marks: 'error' }));
      }

      // Sync grades
      try {
        setSyncStatus((prev) => ({ ...prev, grades: 'loading' }));
        await api.post('/me/student/sync/grades', { password });
        setSyncStatus((prev) => ({ ...prev, grades: 'success' }));
      } catch (err) {
        setSyncStatus((prev) => ({ ...prev, grades: 'error' }));
      }

      setSyncMessage({ type: 'success', text: 'Sync completed! Check individual statuses above.' });
      queryClient.invalidateQueries();
      setShowPasswordModal(false);
      setPassword('');
      setTimeout(() => setSyncMessage(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const profile = profileResult.data;
  const courses = coursesResult.data || [];
  const timetable = timetableResult.data;
  const grades = gradesResult.data;
  const marks = marksResult.data;

  // Calculate metrics
  const totalCourses = courses.length;
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const classesToday = timetable?.days.find((d) => d.day === 'MON')?.periods.length || 0;
  const cgpa = grades?.cgpa || 0;
  const arrears = grades?.total_arrears || 0;
  
  const courseTypes = {
    theory: courses.filter((c) => c?.nature === 'THEORY').length,
    lab: courses.filter((c) => c?.nature === 'LAB' && !c?.nature?.includes('ORIENTED')).length,
    labOriented: courses.filter((c) => c?.nature === 'LAB_ORIENTED_THEORY').length,
    industry: courses.filter((c) => c?.nature === 'INDUSTRY_ORIENTED').length,
  };

  // Calculate average marks across all courses
  const avgCat = marks?.subjects.length
    ? marks.subjects.reduce((sum, s) => {
        const catValues = Object.values(s.cat).filter((v) => v !== undefined && v !== null);
        return sum + (catValues.length > 0 ? catValues.reduce((a, b) => a + b, 0) / catValues.length : 0);
      }, 0) / marks.subjects.length
    : 0;

  // Get latest semester GPA
  const latestSemesterGpa = grades?.semesters[grades.semesters.length - 1]?.gpa || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {profile?.user.full_name.split(' ')[0]}</h1>
          <p className="text-fg/60 mt-1">Registration: {profile?.student.register_number}</p>
        </div>
        <button
          onClick={() => setShowPasswordModal(true)}
          disabled={isSyncing}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
            isSyncing
              ? 'bg-muted border-border text-fg/50 cursor-not-allowed'
              : 'border-border bg-surface hover:border-border/80 text-fg/90'
          )}
        >
          <RefreshCw size={16} className={cn(isSyncing && 'animate-spin')} />
          <span className="text-sm font-medium">{isSyncing ? 'Syncing...' : 'Sync All'}</span>
        </button>
      </div>

      {/* Sync Status Message */}
      {syncMessage && (
        <div
          className={cn(
            'p-4 rounded-lg border text-sm font-medium transition-all animate-in fade-in',
            syncMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          )}
        >
          {syncMessage.text}
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold">Sync All Data</h2>
              <p className="text-xs text-fg/60 mt-1">
                Syncing will update your timetable, marks, and grades from IMS
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-fg/80 uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSyncing) {
                    handleSyncAll();
                  }
                }}
                placeholder="Enter your password"
                disabled={isSyncing}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-fg/90 placeholder:text-fg/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                autoFocus
              />
            </div>

            {/* Sync Progress */}
            {isSyncing && (
              <div className="space-y-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <SyncProgressItem
                  label="Timetable"
                  status={syncStatus.timetable || 'idle'}
                />
                <SyncProgressItem label="Marks" status={syncStatus.marks || 'idle'} />
                <SyncProgressItem label="Grades" status={syncStatus.grades || 'idle'} />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setSyncStatus({ timetable: 'idle', marks: 'idle', grades: 'idle' });
                }}
                disabled={isSyncing}
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-surface hover:bg-muted text-fg/90 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSyncAll}
                disabled={isSyncing || !password.trim()}
                className={cn(
                  'flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2',
                  isSyncing || !password.trim()
                    ? 'bg-blue-500/50 text-blue-400/60 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                )}
              >
                {isSyncing ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Syncing
                  </>
                ) : (
                  'Sync All'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<BarChart3 size={20} />}
          label="CGPA"
          value={cgpa.toFixed(2)}
          color="blue"
        />
        <MetricCard
          icon={<Book size={20} />}
          label="Total Courses"
          value={totalCourses.toString()}
          color="emerald"
        />
        <MetricCard
          icon={<TrendingUp size={20} />}
          label="Avg. CAT"
          value={avgCat.toFixed(1)}
          color="violet"
        />
        <MetricCard
          icon={arrears > 0 ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          label="Arrears"
          value={arrears.toString()}
          color={arrears > 0 ? 'red' : 'emerald'}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Academic Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Distribution */}
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-bold mb-4">Course Distribution</h2>
            <div className="grid grid-cols-4 gap-4">
              <CourseTypeBar label="Theory" count={courseTypes.theory} color="blue" />
              <CourseTypeBar label="Lab" count={courseTypes.lab} color="emerald" />
              <CourseTypeBar label="Lab Oriented" count={courseTypes.labOriented} color="violet" />
              <CourseTypeBar label="Industry" count={courseTypes.industry} color="amber" />
            </div>
          </div>

          {/* Recent Marks Overview */}
          {marks?.subjects && marks.subjects.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="text-lg font-bold mb-4">Top Performing Courses</h2>
              <div className="space-y-2">
                {marks.subjects
                  .map((s) => {
                    const catAvg = Object.values(s.cat).filter(
                      (v) => v !== undefined && v !== null
                    ).length
                      ? Object.values(s.cat)
                          .filter((v) => v !== undefined && v !== null)
                          .reduce((a, b) => a + b, 0) /
                        Object.values(s.cat).filter((v) => v !== undefined && v !== null).length
                      : 0;
                    return { course: s.course_code, avg: catAvg };
                  })
                  .sort((a, b) => b.avg - a.avg)
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.course} className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <span className="text-sm font-mono">{item.course}</span>
                      <span className="text-sm font-bold text-emerald-400">{item.avg.toFixed(1)}/25</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-6">
          {/* Credits Summary */}
          <div className="rounded-lg border border-border bg-surface p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-fg/70 mb-4">Credits</h3>
            <p className="text-3xl font-bold text-blue-400 mb-1">{totalCredits}</p>
            <p className="text-xs text-fg/60">total credits enrolled</p>
          </div>

          {/* Semester Performance */}
          {grades?.semesters && grades.semesters.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-fg/70 mb-3">
                Latest Semester
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-fg/60 mb-1">Semester {grades.semesters[grades.semesters.length - 1].semester}</p>
                  <p className="text-2xl font-bold">{latestSemesterGpa.toFixed(2)}</p>
                </div>
                <div className="text-xs text-fg/60">
                  {grades.semesters[grades.semesters.length - 1].courses.length} courses taken
                </div>
              </div>
            </div>
          )}

          {/* Classes Today */}
          {timetable?.days && (
            <div className="rounded-lg border border-border bg-surface p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-fg/70 mb-4 flex items-center gap-2">
                <Clock size={14} /> Today's Schedule
              </h3>
              <p className="text-3xl font-bold mb-1">{classesToday}</p>
              <p className="text-xs text-fg/60">classes scheduled</p>
            </div>
          )}
        </div>
      </div>

      {/* All Courses List */}
      {courses.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-bold mb-4">Enrolled Courses</h2>
          <div className="grid gap-2">
            {courses.map((course) => (
              <div key={course.code} className="flex items-center justify-between p-3 rounded bg-muted/30">
                <div>
                  <p className="text-sm font-mono font-bold">{course.code}</p>
                  <p className="text-xs text-fg/60">{course.title}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">{course.nature.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-semibold text-blue-400">{course.credits} credits</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'emerald' | 'violet' | 'red' | 'amber';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-fg/70">{label}</span>
        <div className="opacity-70">{icon}</div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function CourseTypeBar({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: 'blue' | 'emerald' | 'violet' | 'amber';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/20 border-blue-500/40',
    emerald: 'bg-emerald-500/20 border-emerald-500/40',
    violet: 'bg-violet-500/20 border-violet-500/40',
    amber: 'bg-amber-500/20 border-amber-500/40',
  };

  return (
    <div className="text-center">
      <div className={`rounded-lg border p-3 h-20 flex items-center justify-center ${colorClasses[color]}`}>
        <p className="text-2xl font-bold">{count}</p>
      </div>
      <p className="text-xs text-fg/60 mt-2">{label}</p>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
}

function SyncProgressItem({
  label,
  status,
}: {
  label: string;
  status: 'idle' | 'loading' | 'success' | 'error';
}) {
  const statusConfig = {
    idle: { icon: null, text: 'Pending', color: 'text-fg/60' },
    loading: { icon: <Loader size={14} className="animate-spin" />, text: 'Syncing...', color: 'text-blue-400' },
    success: { icon: <CheckCircle size={14} />, text: 'Success', color: 'text-emerald-400' },
    error: { icon: <AlertCircle size={14} />, text: 'Failed', color: 'text-red-400' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-fg/80">{label}</span>
      <div className={cn('flex items-center gap-2 text-xs font-medium', config.color)}>
        {config.icon}
        <span>{config.text}</span>
      </div>
    </div>
  );
}