import { useEffect, useState } from "react";
import api from "../api/client";
import { SyncButton } from "../components/modal/confirm-sync";
import { useQuery } from "@tanstack/react-query";

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

export function StudentTimetable() {

    const [activeDay, setActiveDay] = useState<Weekday>("MON")

    async function syncFn(password: string) {
        await api.post("/me/student/sync/timetable", { password });
    }
    const { data, isLoading } = useQuery({
        queryKey: ["student-timetable"],
        queryFn: async () => {
        const res = await api.get<TimetableResponse>("/me/student/timetable")
        return res.data
        }
    })

    if (isLoading) {
        return <div>Loading timetable…</div>
    }

    if (!data) {
        return <div>No timetable available</div>
    }

    const grid = buildTimetableGrid(data)

    return (
        // <h1>timetable</h1>
        <>
            <SyncButton syncFn={syncFn} />
            <div className="mx-auto max-w-2xl space-y-4 p-4">
      {/* Day selector */}
      <DayTabs
        days={DAYS}
        active={activeDay}
        onChange={setActiveDay}
      />

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
        </>
        
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
          className={`
            rounded-full px-4 py-1 text-sm font-medium
            ${
              active === day
                ? "bg-primary text-white"
                : "bg-muted text-fg/70"
            }
          `}
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
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-fg/50">
        Period {period} · Free
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-bg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-fg/60">
          Period {period}
        </span>

        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
          {entry.primary.course_nature}
        </span>
      </div>

      <div>
        <div className="text-sm font-semibold">
          {entry.primary.course_title}
        </div>
        <div className="text-xs text-fg/60">
          {entry.primary.course_code}
        </div>
      </div>

      <div className="text-xs">
        👨‍🏫 {entry.primary.faculty_name} ({entry.primary.faculty_code})
      </div>

      {entry.alt && (
        <div className="mt-2 rounded-md border border-dashed border-border p-2 text-xs">
          <div className="font-semibold">
            {entry.alt.course_title}
          </div>
          <div className="text-fg/60">
            {entry.alt.course_code} · 👨‍🏫 {entry.alt.faculty_name} ({entry.alt.faculty_code})
          </div>
        </div>
      )}
    </div>
  )
}

// function TimetableCell({ entry }: { entry?: TimetablePeriod }) {
//   if (!entry) {
//     return (
//       <div className="h-20 rounded-md border border-border bg-muted/40 text-xs text-fg/40 flex items-center justify-center">
//         Free
//       </div>
//     )
//   }

//   return (
//     <div className="h-20 rounded-md border border-border bg-bg p-2 space-y-1">
//       <div className="text-xs font-semibold">{entry.primary.course_code}</div>
//       <div className="text-sm truncate">{entry.primary.course_title}</div>

//       <div className="flex items-center justify-between text-xs text-fg/60">
//         <span>{entry.primary.course_nature}</span>
//         <span>{entry.primary.faculty_code}</span>
//       </div>

//       {entry.alt && (
//         <div className="mt-1 border-t border-border pt-1 text-xs">
//           <div className="font-semibold">{entry.alt.course_code}</div>
//           <div className="truncate">{entry.alt.course_title}</div>
//         </div>
//       )}
//     </div>
//   )
// }