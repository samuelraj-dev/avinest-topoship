import api from "../api/client"
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../components/ui/skeleton";
import { PageHeader } from "../components/page-header";
import { PYTHON_MEDIA_BASE_URL } from "../lib/utils/constants";

type MyFaculty = {
  id: number;
  staff_code: string;
  full_name: string;
  email: string;
  designation: string
  department: string;
  courses: string[];
  avatar_url: string;
}

export function MyFacultiesPage() {

    const { data, isLoading, isError } = useQuery({
      queryKey: ["my-faculty"],
      queryFn: async () => {
        const res = await api.get<MyFaculty[]>(
          "/me/student/my-faculties"
        );
        return res.data;
      }
    });

    if (isLoading) {
      return <Skeleton />
    }

    if (isError) {
      return <h1>something went terribly worng man.</h1>
    }

    return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="My Faculty"
          subtitle="Faculty details"
        />

        {data?.map(faculty => (
          <Section
            faculty={faculty}
            key={faculty.staff_code}
          />
        ))}

      </div>
    )
}

function Section({
  faculty
}: {
  faculty: MyFaculty;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-4 px-6 py-2 border-b border-border">
        <Avatar name={faculty.full_name} url={faculty.avatar_url} />
        <div>
          <h2 className="text-lg font-semibold tracking-tight pb-2">{faculty.full_name}</h2>
          <h4 className="text-xs text-secondary">{faculty.staff_code} | {faculty.designation} | {faculty.department}</h4>
        </div>

      </div>
      <div className="px-6 py-2">
        <div className="text-sm pb-2">
          <span className="font-semibold">Email: </span> {faculty.email}
        </div>
        <div className="text-sm">
          <h2 className="font-semibold">Courses handling:</h2>
          <div className="pl-3">
            {faculty.courses?.map(course => (
              <div key={course}>- {course}</div>
            ))}
          </div>
        </div>
        {/* <Info label="Username" value={user.username} />
        <Info label="Email" value={user.email} />
        <Info label="Phone" value={user.phone} /> */}
      </div>


      {/* <div className="px-6 py-2">{children}</div> */}
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

  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-lg font-semibold">
      {initial}
    </div>
  );
}

export function AccentCard(props) {
  return (
    <Card
      className="border border-border"
      style={{
        boxShadow: `
          var(--shadow-lg),
          0 0 60px -15px rgb(var(--app-primary) / 0.5)
        `,
      }}
      {...props}
    />
  );
}


function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        rounded-3xl
        bg-surface
        border border-border
        p-5
        ${className}
      `}
    >
      {children}
    </div>
  );
}

