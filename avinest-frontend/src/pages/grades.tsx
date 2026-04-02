import { Award, TrendingUp, AlertCircle, CheckCircle, RefreshCw, Loader } from 'lucide-react';
import api from '../api/client';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { cn } from '../lib/utils/cn';
import { PageHeader } from '../components/page-header';
import { useState } from 'react';

type CourseGrade = {
  course_id: number;
  course_code: string;
  course_name: string;
  credits: number;
  grade: string;
  grade_points: number;
  result: 'CLEARED' | 'ARREAR';
};

type SemesterGrade = {
  semester: number;
  gpa: number;
  arrears: number;
  courses: CourseGrade[];
};

type GradebookResponse = {
  cgpa: number;
  total_arrears: number;
  semesters: SemesterGrade[];
};

export function GradebookPage() {
  const queryClient = useQueryClient();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['student-grades'],
    queryFn: async () => {
      const res = await api.get<GradebookResponse>('/me/student/grades');
      return res.data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (pwd: string) => {
      const res = await api.post('/me/student/sync/grades', { password: pwd });
      return res.data;
    },
    onSuccess: () => {
      setSyncMessage({ type: 'success', text: 'Grades synced successfully!' });
      setShowPasswordModal(false);
      setPassword('');
      queryClient.invalidateQueries({ queryKey: ['student-grades'] });
      setTimeout(() => setSyncMessage(null), 4000);
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || 'Failed to sync grades. Please try again.';
      setSyncMessage({ type: 'error', text: errorMsg });
      setTimeout(() => setSyncMessage(null), 4000);
    },
  });

  const handleSync = () => {
    if (!password.trim()) {
      setSyncMessage({ type: 'error', text: 'Please enter your password.' });
      setTimeout(() => setSyncMessage(null), 3000);
      return;
    }
    syncMutation.mutate(password);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-red-500">
        Something went wrong while loading grades.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start gap-4">
        <PageHeader
          title="Grade Book"
          subtitle="Academic Performance Overview"
        />
        <button
          onClick={() => setShowPasswordModal(true)}
          disabled={syncMutation.isPending}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
            syncMutation.isPending
              ? 'bg-muted border-border text-fg/50 cursor-not-allowed'
              : 'border-border bg-surface hover:border-border/80 text-fg/90'
          )}
        >
          <RefreshCw size={16} className={cn(syncMutation.isPending && 'animate-spin')} />
          <span className="text-sm font-medium">{syncMutation.isPending ? 'Syncing...' : 'Sync from IMS'}</span>
        </button>
      </div>

      {/* Sync Status Message */}
      {syncMessage && (
        <div className={cn(
          'p-4 rounded-lg border text-sm font-medium transition-all animate-in fade-in',
          syncMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        )}>
          {syncMessage.text}
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold">Sync Grades from IMS</h2>
              <p className="text-xs text-fg/60 mt-1">Enter your password to confirm synchronization</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-fg/80 uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !syncMutation.isPending) {
                    handleSync();
                  }
                }}
                placeholder="Enter your password"
                disabled={syncMutation.isPending}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-fg/90 placeholder:text-fg/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                autoFocus
              />
            </div>

            {/* Loading State */}
            {syncMutation.isPending && (
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                <Loader size={16} className="text-blue-400 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-400">Syncing grades...</p>
                  <p className="text-xs text-blue-400/70">This may take a moment</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                }}
                disabled={syncMutation.isPending}
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-surface hover:bg-muted text-fg/90 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSync}
                disabled={syncMutation.isPending || !password.trim()}
                className={cn(
                  'flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2',
                  syncMutation.isPending || !password.trim()
                    ? 'bg-blue-500/50 text-blue-400/60 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                )}
              >
                {syncMutation.isPending ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Syncing
                  </>
                ) : (
                  'Sync'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CGPA Card */}
      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Cumulative Performance</h2>
            <p className="text-xs text-fg/50 mt-1">Overall GPA across all semesters</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CGPA */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Award size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-fg/60 uppercase tracking-widest font-medium">CGPA</p>
              <p className="text-3xl font-bold mt-1">{data?.cgpa.toFixed(2)}</p>
            </div>
          </div>

          {/* Total Arrears */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-lg border",
              data?.total_arrears === 0
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-red-500/10 border-red-500/20"
            )}>
              {data?.total_arrears === 0 ? (
                <CheckCircle size={24} className="text-emerald-400" />
              ) : (
                <AlertCircle size={24} className="text-red-400" />
              )}
            </div>
            <div>
              <p className="text-xs text-fg/60 uppercase tracking-widest font-medium">Arrears</p>
              <p className="text-3xl font-bold mt-1">{data?.total_arrears ?? 0}</p>
            </div>
          </div>

          {/* Total Semesters */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-slate-500/10 border border-slate-500/20">
              <TrendingUp size={24} className="text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-fg/60 uppercase tracking-widest font-medium">Completed</p>
              <p className="text-3xl font-bold mt-1">{data?.semesters.length ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Semester-wise Breakdown */}
      <div className="space-y-4">
        {data?.semesters.map((semester) => (
          <SemesterCard key={semester.semester} semester={semester} />
        ))}
      </div>
    </div>
  );
}

function SemesterCard({ semester }: { semester: SemesterGrade }) {
  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden transition-all hover:border-border/80">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border border-l-4 border-l-violet-500 flex justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-bold">Semester {semester.semester}</h3>
          <p className="text-xs text-fg/50 mt-1">
            {semester.courses.length} courses • {semester.arrears} arrear{semester.arrears !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-xs text-fg/60 uppercase tracking-widest font-medium">Semester GPA</p>
            <p className="text-2xl font-bold text-blue-400">{semester.gpa.toFixed(2)}</p>
          </div>
          {semester.arrears > 0 && (
            <div className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
              {semester.arrears} Arrear{semester.arrears !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-3 py-2 font-bold text-xs uppercase tracking-widest text-fg/60">Code</th>
                <th className="text-left px-3 py-2 font-bold text-xs uppercase tracking-widest text-fg/60">Course Name</th>
                <th className="text-center px-3 py-2 font-bold text-xs uppercase tracking-widest text-fg/60">Credits</th>
                <th className="text-center px-3 py-2 font-bold text-xs uppercase tracking-widest text-fg/60">Grade</th>
                <th className="text-center px-3 py-2 font-bold text-xs uppercase tracking-widest text-fg/60">Points</th>
                <th className="text-center px-3 py-2 font-bold text-xs uppercase tracking-widest text-fg/60">Status</th>
              </tr>
            </thead>
            <tbody>
              {semester.courses.map((course, idx) => (
                <tr
                  key={course.course_id}
                  className={cn(
                    'border-b border-border/30 transition-colors hover:bg-muted/50',
                    idx === semester.courses.length - 1 && 'border-b-0'
                  )}
                >
                  <td className="px-3 py-3">
                    <span className="font-mono text-xs text-fg/70">{course.course_code}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-fg/90">{course.course_name}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="font-medium">{course.credits}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={cn('font-bold text-lg', getGradeColor(course.grade))}>
                      {course.grade}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="font-medium">{course.grade_points.toFixed(2)}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={cn(
                      'text-xs font-semibold',
                      course.result === 'CLEARED'
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    )}>
                      {course.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-4 space-y-3">
        {semester.courses.map((course) => (
          <div
            key={course.course_id}
            className="rounded border border-border/50 bg-muted/30 p-4 space-y-2"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-fg/60">{course.course_code}</p>
                <p className="text-sm font-bold mt-1 line-clamp-2">{course.course_name}</p>
              </div>
              <span className={cn('text-xl font-bold text-center', getGradeColor(course.grade))}>
                {course.grade}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs border-t border-border/50 pt-2">
              <div>
                <span className="text-fg/60">Credits</span>
                <p className="font-medium">{course.credits}</p>
              </div>
              <div>
                <span className="text-fg/60">Points</span>
                <p className="font-medium">{course.grade_points.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-fg/60">Status</span>
                <p className={cn(
                  'font-semibold',
                  course.result === 'CLEARED'
                    ? 'text-emerald-400'
                    : 'text-red-400'
                )}>
                  {course.result}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getGradeColor(grade: string): string {
  const gradeMap: Record<string, string> = {
    'O': 'text-emerald-400',
    'A+': 'text-emerald-400',
    'A': 'text-blue-400',
    'B+': 'text-blue-400',
    'B': 'text-slate-400',
    'C': 'text-yellow-400',
    'RA': 'text-red-400',
    'SA': 'text-red-400',
  };
  return gradeMap[grade] || 'text-fg/80';
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-muted', className)} />
  );
}