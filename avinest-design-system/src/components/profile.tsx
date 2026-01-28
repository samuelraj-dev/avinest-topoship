import { useEffect, useState } from "react";
import { cn } from "../libs/utils/cn";

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
  const [profile, setProfile] = useState<Profile | null>({
    role: "STUDENT",
    user: {
        id: 1,
        full_name: "Samuel Raj",
        username: "2117230080093",
        email: "samuelrajholyns@gmail.com",
        phone: "9445516488",
        avatar_url: "fdsafsa",
        created_at: "today"
    },
    student: {
        id: 1,
        register_number: "2117230080093",
        hosteler: false,
        lateral_entry: false,
        dob: "2005-05-26",
        gender: "Male",
        current_section_id: 3,
        created_at: "123"
    },
    faculty: null
  });

//   useEffect(() => {
//     api.get<Profile>("/me/profile").then((res) => {
//       setProfile(res.data);
//     });
//   }, []);

  if (!profile) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative px-6 py-12 mx-auto max-w-7xl">
          <div className="animate-slide-down">
            <h1 className="text-4xl font-bold tracking-tight text-fg mb-2">
              My Profile
            </h1>
            <p className="text-lg text-fg-muted">
              Personal and academic information
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-12 mx-auto max-w-7xl -mt-8 space-y-6">
        <div className="animate-scale-in">
          <UserCard user={profile.user} role={profile.role} />
        </div>

        <div className="stagger-children">
          {profile.role === "STUDENT" && (
            <StudentDetails student={profile.student} />
          )}

          {profile.role === "FACULTY" && (
            <FacultyDetails faculty={profile.faculty} />
          )}
        </div>
      </div>
    </div>
  );
}

function UserCard({ user, role }: { user: User; role: Role }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xl transition-all duration-300 hover:shadow-2xl">
      {/* Card Header with Avatar */}
      <div className="relative bg-gradient-to-br from-primary/5 to-transparent p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Status */}
          <div className="relative">
            <Avatar name={user.full_name} url={user.avatar_url} size="xl" />
            <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-success-500 border-4 border-surface shadow-lg" 
                 title="Online" />
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-fg mb-2">
              {user.full_name}
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Grid */}
      <div className="p-6 bg-surface">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            label="Username"
            value={user.username}
          />
          <InfoCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            label="Email"
            value={user.email}
          />
          <InfoCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
            label="Phone"
            value={user.phone}
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-muted/50 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-fg-muted group-hover:text-primary transition-colors">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-fg-muted uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-sm font-semibold text-fg truncate">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function StudentDetails({ student }: { student: Student }) {
  return (
    <Section title="Student Details">
      <DetailItem label="Register Number" value={student.register_number} />
      <DetailItem label="Gender" value={student.gender} />
      <DetailItem 
        label="Date of Birth" 
        value={new Date(student.dob).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })} 
      />
      <DetailItem
        label="Hosteler"
        value={student.hosteler ? "Yes" : "No"}
        badge={student.hosteler ? "success" : "default"}
      />
      <DetailItem
        label="Lateral Entry"
        value={student.lateral_entry ? "Yes" : "No"}
        badge={student.lateral_entry ? "info" : "default"}
      />
    </Section>
  );
}

function FacultyDetails({ faculty }: { faculty: Faculty }) {
  return (
    <Section title="Faculty Details">
      <DetailItem label="Staff Code" value={faculty.staff_code} />
      <DetailItem label="Department" value={faculty.department} />
      <DetailItem label="Designation" value={faculty.designation} />
      <DetailItem label="Biometric ID" value={faculty.biometric_id} />
      <DetailItem
        label="Date of Joining"
        value={new Date(faculty.date_of_joining).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      />
      <DetailItem label="Gender" value={faculty.gender} />
    </Section>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
      {/* Section Header */}
      <div className="relative bg-gradient-to-r from-primary/5 to-transparent px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-primary" />
          <h2 className="text-xl font-bold tracking-tight text-fg">
            {title}
          </h2>
        </div>
      </div>

      {/* Section Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ 
  label, 
  value,
  badge
}: { 
  label: string; 
  value: string;
  badge?: "success" | "info" | "default";
}) {
  return (
    <div className="group rounded-lg border border-border bg-muted/30 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm">
      <dt className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">
        {label}
      </dt>
      <dd className="flex items-center gap-2">
        <span className="text-base font-semibold text-fg">
          {value || "—"}
        </span>
        {badge && badge !== "default" && (
          <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            badge === "success" && "bg-success-50 text-success-700 border border-success-200",
            badge === "info" && "bg-info-50 text-info-700 border border-info-200"
          )}>
            {value}
          </span>
        )}
      </dd>
    </div>
  );
}

function Avatar({ 
  name, 
  url,
  size = "md"
}: { 
  name: string; 
  url?: string;
  size?: "md" | "lg" | "xl";
}) {
  const sizeClasses = {
    md: "h-16 w-16 text-xl",
    lg: "h-20 w-20 text-2xl",
    xl: "h-28 w-28 text-4xl"
  };

  if (url) {
    return (
      <img
        src={`http://localhost:5000/media/641cba103da64cee8ccbf22ce0f88396_1769185138575.JPG`}
        alt={name}
        className={cn(
          "rounded-full object-cover ring-4 ring-surface shadow-xl",
          sizeClasses[size]
        )}
        loading="lazy"
      />
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-center rounded-full font-bold",
      "bg-gradient-to-br from-primary to-primary/70 text-primary-fg",
      "ring-4 ring-surface shadow-xl",
      sizeClasses[size]
    )}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-10 w-48 bg-muted rounded-lg mb-3" />
          <div className="h-5 w-64 bg-muted rounded-lg" />
        </div>

        {/* Card Skeleton */}
        <div className="rounded-2xl border border-border bg-surface p-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="h-28 w-28 rounded-full bg-muted animate-pulse" />
            <div className="space-y-3 flex-1">
              <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
              <div className="h-6 w-32 bg-muted rounded-full animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>

        {/* Details Skeleton */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="h-8 w-40 bg-muted rounded-lg mb-4 animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}