import { useEffect, useState } from "react";
import api from "../api/client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Clock, Book, User, RefreshCw, Loader } from "lucide-react";
import { cn } from "../lib/utils/cn";
import { PageHeader } from "../components/page-header";

type Weekday = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT"

type TimetablePeriod = {
  period: number;
  primary: {
    course_code: string
    course_title: string
    course_nature: "THEORY" | "LAB" | "LAB_ORIENTED_THEORY" | "INDUSTRY_ORIENTED"
    faculty_name: string
    faculty_code: string
  };
  alt: {
    course_code: string
    course_title: string
    course_nature: string
    faculty_name: string
    faculty_code: string
  } | null;
}

type TimetableDay = {
  day: Weekday
  periods: TimetablePeriod[]
}

type TimetableResponse = {
  section_id: number
  days: TimetableDay[]
}

const DAYS: Weekday[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT"]
const PERIODS = [1, 2, 3, 4, 5, 6, 7]

function buildTimetableGrid(data: TimetableResponse) {
  const grid: Record<Weekday, Record<number, TimetablePeriod>> = {
    MON: {}, TUE: {}, WED: {}, THU: {}, FRI: {}, SAT: {}
  }

  for (const day of data.days) {
    for (const p of day.periods) {
      grid[day.day][p.period] = p
    }
  }

  return grid
}

function getCourseTypeColor(nature: string): string {
  const colors: Record<string, string> = {
    "THEORY": "border-l-blue-500",
    "LAB": "border-l-emerald-500",
    "LAB_ORIENTED_THEORY": "border-l-violet-500",
    "INDUSTRY_ORIENTED": "border-l-amber-500"
  };
  return colors[nature] || "border-l-slate-500";
}

function getCourseTypeBadgeColor(nature: string): string {
  const colors: Record<string, string> = {
    "THEORY": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "LAB": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "LAB_ORIENTED_THEORY": "bg-violet-500/10 text-violet-400 border-violet-500/20",
    "INDUSTRY_ORIENTED": "bg-amber-500/10 text-amber-400 border-amber-500/20"
  };
  return colors[nature] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
}

export function StudentTimetable() {
  const queryClient = useQueryClient();
  const [activeDay, setActiveDay] = useState<Weekday>("MON")
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-timetable"],
    queryFn: async () => {
      const res = await api.get<TimetableResponse>("/me/student/timetable")
      return res.data
    }
  })

  const syncMutation = useMutation({
    mutationFn: async (pwd: string) => {
      const res = await api.post("/me/student/sync/timetable", { password: pwd });
      return res.data;
    },
    onSuccess: () => {
      setSyncMessage({ type: 'success', text: 'Timetable synced successfully!' });
      setShowPasswordModal(false);
      setPassword('');
      queryClient.invalidateQueries({ queryKey: ["student-timetable"] });
      setTimeout(() => setSyncMessage(null), 4000);
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || 'Failed to sync timetable. Please try again.';
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
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <PageHeader
          title="Time Table"
          subtitle="Class Schedule"
        />
        <div className="mt-6 p-6 text-sm text-red-500 rounded-lg border border-red-500/20 bg-red-500/10">
          Failed to load timetable. Please try again.
        </div>
      </div>
    );
  }

  const grid = buildTimetableGrid(data)
  const classesPerDay = Object.values(grid[activeDay]).length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start gap-4">
        <PageHeader
          title="Time Table"
          subtitle="Class Schedule"
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
          <span className="text-sm font-medium">{syncMutation.isPending ? 'Syncing...' : 'Sync Timetable'}</span>
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
              <h2 className="text-lg font-bold">Sync Timetable</h2>
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
                  <p className="text-sm font-medium text-blue-400">Syncing timetable...</p>
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

      {/* Day Selector */}
      <DayTabs
        days={DAYS}
        active={activeDay}
        onChange={setActiveDay}
      />

      {/* Day Summary */}
      <div className="rounded-lg border border-border bg-surface px-6 py-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-fg/60" />
          <span className="text-sm text-fg/80">
            {classesPerDay > 0 ? (
              <>
                <span className="font-semibold">{classesPerDay}</span>
                {' '}class{classesPerDay !== 1 ? 'es' : ''} scheduled
              </>
            ) : (
              <span>No classes scheduled</span>
            )}
          </span>
        </div>
      </div>

      {/* Periods */}
      <div className="space-y-3">
        {PERIODS.map(p => (
          <PeriodCard
            key={p}
            period={p}
            entry={grid[activeDay][p]}
          />
        ))}
      </div>
    </div>
  )
}

function DayTabs({
  days,
  active,
  onChange,
}: {
  days: Weekday[]
  active: Weekday
  onChange: (d: Weekday) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {days.map(day => (
        <button
          key={day}
          onClick={() => onChange(day)}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
            active === day
              ? 'bg-blue-500 text-white border border-blue-500'
              : 'bg-muted text-fg/70 border border-border hover:border-border/80'
          )}
        >
          {day}
        </button>
      ))}
    </div>
  )
}

function PeriodCard({
  period,
  entry,
}: {
  period: number
  entry?: TimetablePeriod
}) {
  if (!entry) {
    return (
      <div className="rounded-lg border border-border/50 bg-muted/30 px-6 py-4 text-sm text-fg/50">
        <div className="flex items-center gap-2">
          <Clock size={14} />
          Period {period} · Free
        </div>
      </div>
    )
  }

  const borderColor = getCourseTypeColor(entry.primary.course_nature);
  const badgeColor = getCourseTypeBadgeColor(entry.primary.course_nature);

  return (
    <div className={cn(
      'rounded-lg border border-border bg-surface overflow-hidden border-l-4 transition-all hover:border-border/80',
      borderColor
    )}>
      <div className="px-6 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-fg/60" />
            <span className="text-sm font-medium text-fg/80">Period {period}</span>
          </div>
          <span className={cn(
            'text-xs font-semibold px-2 py-1 rounded border',
            badgeColor
          )}>
            {entry.primary.course_nature.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Primary Course */}
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-bold text-fg/90">
              {entry.primary.course_title}
            </h3>
            <p className="text-xs font-mono text-fg/60 mt-0.5">
              {entry.primary.course_code}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-fg/70">
            <User size={13} />
            <span>{entry.primary.faculty_name}</span>
            <span className="text-fg/50">({entry.primary.faculty_code})</span>
          </div>
        </div>

        {/* Alternative Course */}
        {entry.alt && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
            <p className="text-xs font-semibold text-fg/60 uppercase tracking-widest">Alternative</p>
            <div>
              <h4 className="text-sm font-bold text-fg/90">
                {entry.alt.course_title}
              </h4>
              <p className="text-xs font-mono text-fg/60 mt-0.5">
                {entry.alt.course_code}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-fg/70">
              <User size={13} />
              <span>{entry.alt.faculty_name}</span>
              <span className="text-fg/50">({entry.alt.faculty_code})</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-muted', className)} />
  );
}