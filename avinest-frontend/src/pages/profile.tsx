import { useEffect, useState } from "react";
import api from "../api/client";
import { PYTHON_MEDIA_BASE_URL } from "../lib/utils/constants";

type Role = "STUDENT" | "FACULTY";

type User = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  avatar_url?: string;
  created_at: string;
};

type Student = {
  id: number;
  register_number: string;
  hosteler: boolean;
  lateral_entry: boolean;
  dob: string;
  gender: string;
  current_section_id: number;
  created_at: string;
};

type Faculty = {
  id: number;
  staff_code: string;
  department: string;
  designation: string;
  biometric_id: string;
  anna_university_code: string;
  date_of_joining: string;
  dob: string;
  gender: string;
  created_at: string;
};

type Profile =
  | {
      role: "STUDENT";
      user: User;
      student: Student;
      faculty: null;
    }
  | {
      role: "FACULTY";
      user: User;
      student: null;
      faculty: Faculty;
    };

export function ProfilePage() {

    const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    api.get<Profile>("/me/profile").then(res => {
      setProfile(res.data);
    });
  }, []);

  if (!profile) {
    return <Skeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="My Profile"
        subtitle="Personal and academic information"
      />

      <UserCard user={profile.user} role={profile.role} />

      {profile.role === "STUDENT" && (
        <StudentDetails student={profile.student} />
      )}

      {profile.role === "FACULTY" && (
        <FacultyDetails faculty={profile.faculty} />
      )}
    </div>
  );

}


function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {subtitle && (
        <p className="text-sm text-fg/60">{subtitle}</p>
      )}
    </div>
  );
}


// function UserCard({ user, role }: { user: User; role: Role }) {
//   return (
//     <div className="rounded-lg border border-border bg-bg">
//       <div className="flex items-center gap-4 border-b border-border p-6">
//         <Avatar name={user.full_name} url={user.avatar_url} />
//         <div>
//           <p className="text-xl font-semibold">{user.full_name}</p>
//           <p className="text-sm text-fg/60">{role}</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
//         <Info label="Username" value={user.username} />
//         <Info label="Email" value={user.email} />
//         <Info label="Phone" value={user.phone} />
//       </div>
//     </div>
//   );
// }
function UserCard({ user, role }: { user: User; role: Role }) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-4 border-b border-border px-6 py-4">
        <Avatar name={user.full_name} url={user.avatar_url} />
        <div>
          <p className="text-xl font-semibold tracking-tight">
            {user.full_name}
          </p>
          <p className="text-sm text-fg-muted">{role}</p>
        </div>
      </div>

      <div className="px-6 py-2">
        <Info label="Username" value={user.username} />
        <Info label="Email" value={user.email} />
        <Info label="Phone" value={user.phone} />
      </div>
    </div>
  );
}



function StudentDetails({ student }: { student: Student }) {
  return (
    <Section title="Student Details">
      <Info label="Register Number" value={student.register_number} />
      <Info label="Gender" value={student.gender} />
      <Info label="Date of Birth" value={student.dob} />
      <Info
        label="Hosteler"
        value={student.hosteler ? "Yes" : "No"}
      />
      <Info
        label="Lateral Entry"
        value={student.lateral_entry ? "Yes" : "No"}
      />
    </Section>
  );
}

function FacultyDetails({ faculty }: { faculty: Faculty }) {
  return (
    <Section title="Faculty Details">
      <Info label="Staff Code" value={faculty.staff_code} />
      <Info label="Department" value={faculty.department} />
      <Info label="Designation" value={faculty.designation} />
      <Info label="Biometric ID" value={faculty.biometric_id} />
      <Info
        label="Date of Joining"
        value={faculty.date_of_joining}
      />
    </Section>
  );
}

// function Section({
//   title,
//   children,
// }: {
//   title: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="rounded-lg border border-border bg-bg p-6">
//       <h2 className="mb-4 text-lg font-semibold">{title}</h2>
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//         {children}
//       </div>
//     </div>
//   );
// }
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <div className="px-6 py-2">{children}</div>
    </div>
  );
}


function Avatar({ name, url }: { name: string; url?: string }) {
  if (url) {
    return (
      <img
        src={`${PYTHON_MEDIA_BASE_URL}/${url}`}
        alt={name}
        className="h-16 w-16 rounded-full object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-lg font-semibold">
      {name[0]}
    </div>
  );
}


// function Info({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="flex flex-col gap-1 rounded-md border border-border/60 bg-muted/30 px-4 py-3">
//       <span className="text-xs uppercase tracking-wide text-fg/50">
//         {label}
//       </span>
//       <span className="text-sm font-medium text-fg">
//         {value || "—"}
//       </span>
//     </div>
//   );
// }
function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-border/60 py-3 sm:grid-cols-2">
      <span className="text-sm text-fg-muted">{label}</span>
      <span className="text-sm font-medium text-fg">
        {value || "—"}
      </span>
    </div>
  );
}



function Skeleton() {
  return (
    <div className="rounded-lg border border-border bg-bg p-6">
      <div className="h-6 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
