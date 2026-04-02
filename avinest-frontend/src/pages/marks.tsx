import { Book, Microscope, ClipboardCheck, RefreshCw, Loader } from 'lucide-react';
import api from '../api/client';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { cn } from '../lib/utils/cn';
import { PageHeader } from '../components/page-header';
import { useState } from 'react';

type SubjectMarks = {
  course_code: string;
  course_name: string;
  nature: "THEORY" | "LAB" | "LAB_ORIENTED_THEORY" | "INDUSTRY_ORIENTED";
  cat: Record<string, number>;
  assignment: Record<string, number>;
  lab: Record<string, number>;
};

type SubjectMarksResponse = {
  subjects: SubjectMarks[];
};

// Display read-only marks inline
function MarkDisplay({
  label,
  value,
  max,
}: {
  label: string;
  value: number | undefined | null;
  max?: number;
}) {
  return (
    <div className="text-sm py-1">
      <span className="font-bold uppercase text-fg/80">{label}:</span>
      {!(value === undefined || value === null) ? (
        <span className="ml-2 text-fg/90">
          {value}/{max}
        </span>
      ) : (
        <span className="ml-2 text-fg/40">—</span>
      )}
    </div>
  );
}

export function MarksPage() {
  const queryClient = useQueryClient();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['student-marks'],
    queryFn: async () => {
      const res = await api.get<SubjectMarksResponse>('/me/student/marks');
      return res.data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (pwd: string) => {
      const res = await api.post('/me/student/sync/marks', { password: pwd });
      return res.data;
    },
    onSuccess: () => {
      setSyncMessage({ type: 'success', text: 'Marks synced successfully!' });
      setShowPasswordModal(false);
      setPassword('');
      queryClient.invalidateQueries({ queryKey: ['student-marks'] });
      setTimeout(() => setSyncMessage(null), 4000);
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || 'Failed to sync marks. Please try again.';
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
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-red-500">
        Something went wrong while loading marks.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start gap-4">
        <PageHeader title="Assessment Marks" subtitle="Course Performance Management" />
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
          <span className="text-sm font-medium">{syncMutation.isPending ? 'Syncing...' : 'Sync Marks'}</span>
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
              <h2 className="text-lg font-bold">Sync Marks from IMS</h2>
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
                  <p className="text-sm font-medium text-blue-400">Syncing marks...</p>
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

      <div className="grid gap-4">
        {data?.subjects?.map((course) => (
          <CourseCard key={course.course_code} course={course} />
        ))}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: SubjectMarks }) {
  const isTheory = course.nature === 'THEORY';
  const isLabOriented = course.nature === 'LAB_ORIENTED_THEORY';
  const isLab = course.nature === 'LAB';
  const isIndustry = course.nature === 'INDUSTRY_ORIENTED';

  const hasCAT = isTheory || isLabOriented || isIndustry;
  const hasLab = isLab || isLabOriented;

  // Minimal accent color based on course type
  const getAccentColor = (): string => {
    if (isLab) return 'border-l-emerald-500';
    if (isLabOriented) return 'border-l-violet-500';
    if (isIndustry) return 'border-l-amber-500';
    return 'border-l-slate-400';
  };

  return (
    <div className={`group rounded-lg border border-border bg-surface overflow-hidden transition-all hover:border-border/80 border-l-4 ${getAccentColor()}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex justify-between items-start gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{course.course_name}</h2>
          <p className="text-xs font-mono text-fg/50 uppercase mt-1">{course.course_code}</p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-muted text-fg/70 whitespace-nowrap">
          {course.nature.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="p-6">
        {/* CAT & Assignments - side by side on large screens, stack on small */}
        {hasCAT && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* CAT Marks */}
            {course.cat && (
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                  <ClipboardCheck size={14} />
                  <h3 className="text-xs font-bold uppercase tracking-widest">CAT Marks</h3>
                  {isTheory && <span className="text-[9px] text-fg/40 italic ml-auto">6 pts/CO</span>}
                  {isLabOriented && <span className="text-[9px] text-fg/40 italic ml-auto">4 pts/CO</span>}
                </div>
                <div className="space-y-1 rounded p-3 bg-muted/30">
                  {['co1', 'co2', 'co3', 'co4', 'co5'].map((co) => (
                    <MarkDisplay
                      key={co}
                      label={co}
                      value={course.cat[co]}
                      max={25}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Assignments */}
            {course.assignment && (
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                  <Book size={14} />
                  <h3 className="text-xs font-bold uppercase tracking-widest">Assignments</h3>
                </div>
                <div className="space-y-1 rounded p-3 bg-muted/30">
                  {['a1', 'a2', 'a3', 'a4', 'a5'].map((key) => (
                    <MarkDisplay
                      key={key}
                      label={key}
                      value={course.assignment[key]}
                      max={10}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lab Assessment - full width */}
        {hasLab && course.lab && (
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
              <Microscope size={14} />
              <h3 className="text-xs font-bold uppercase tracking-widest">Lab Assessment</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 rounded p-3 bg-muted/30">
              {['cycle1', 'cycle2', 'cycle3'].map((cycle) => (
                <MarkDisplay
                  key={cycle}
                  label={cycle}
                  value={course.lab[cycle]}
                  max={100}
                />
              ))}
              <div className="col-span-2 sm:col-span-1">
                <MarkDisplay
                  label="mock exam"
                  value={course.lab['mock']}
                  max={100}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-muted', className)} />
  );
}