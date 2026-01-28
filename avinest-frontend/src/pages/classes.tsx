import { useEffect } from "react";
import api from "../api/client";
import { Card } from "../components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { SyncButton } from "../components/modal/confirm-sync";

export type FacultySubjectItem = {
  course_id: number
  course_code: string
  course_title: string
}

export type FacultyClassSubjects = {
  class_name: string
  program: string
  semester: number
  section: string
  subjects: FacultySubjectItem[]
}


export function ClassesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["faculty-subjects"],
    queryFn: async () => {
      const res = await api.get<FacultyClassSubjects[]>(
        "/me/faculty/subjects"
      );
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ClassesHeader />

      {data?.map(cls => (
        <ClassSection
          key={cls.class_name}
          data={cls}
        />
      ))}
    </div>
  );
}


function ClassesHeader() {
  async function syncFn(password: string) {
    await api.post("/me/faculty/sync/faculty-subjects", { password });
  }

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">My Classes</h1>
        <p className="text-sm text-fg/60">
          Subjects assigned for the current semester
        </p>
      </div>

      <SyncButton syncFn={syncFn} />
    </div>
  );
}

function ClassSection({
  data,
}: {
  data: FacultyClassSubjects;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg">
      {/* Class header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h3 className="text-lg font-semibold">
            {data.class_name}
          </h3>
          <p className="text-sm text-fg/60">
            {data.subjects.length} subject
            {data.subjects.length > 1 && "s"}
          </p>
        </div>

        {/* future: expand/collapse icon */}
      </div>

      <div className="border-t border-border">
        {data.subjects.map(sub => (
          <FacultySubjectRow
            key={sub.course_id}
            subject={sub}
          />
        ))}
      </div>
    </div>
  );
}

function FacultySubjectRow({
  subject,
}: {
  subject: FacultySubjectItem;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3 hover:bg-muted">
      {/* Left: subject info */}
      <div>
        <p className="font-medium">
          {subject.course_title}
        </p>
        <p className="text-sm text-fg/60">
          {subject.course_code}
        </p>
      </div>

      {/* Right: actions (future-ready) */}
      <div className="flex items-center gap-3">
        <span className="rounded-md bg-muted px-2 py-1 text-xs">
          Theory
        </span>

        {/* future buttons */}
        {/* <Button size="sm" variant="ghost">Attendance</Button> */}
        {/* <Button size="sm" variant="ghost">Marks</Button> */}
      </div>
    </div>
  );
}



function SubjectRow({ subject }: { subject: FacultySubjectItem }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg p-2 hover:bg-muted">
      <div>
        <p className="font-medium">{subject.course_title}</p>
        <p className="text-sm text-fg/60">{subject.course_code}</p>
      </div>
    </div>
  )
}

function ClassSubjectsCard({
  data,
}: {
  data: FacultyClassSubjects
}) {
  return (
    <Card className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">
          {data.class_name}
        </h3>

        <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-fg/70">
          {data.subjects.length} subjects
        </span>
      </div>

      {/* Subjects */}
      <div className="divide-y divide-border">
        {data.subjects.map(sub => (
          <SubjectRow
            key={sub.course_id}
            subject={sub}
          />
        ))}
      </div>
    </Card>
  )
}
