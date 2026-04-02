// import api from "../api/client"
// import { useQuery } from "@tanstack/react-query";
// import { Skeleton } from "../components/ui/skeleton";
// import { PageHeader } from "../components/page-header";

// type EnrolledCourse = {
//   code: string;
//   title: string;
//   nature: string;
//   credits: number;
// }

// export function EnrolledCourses() {

//     const { data, isLoading, isError } = useQuery({
//       queryKey: ["my-faculty"],
//       queryFn: async () => {
//         const res = await api.get<EnrolledCourse[]>(
//           "/me/student/enrolled-courses"
//         );
//         return res.data;
//       },
//     });

//     if (isLoading) {
//       return <Skeleton />
//     }

//     if (isError) {
//       return <h1>something went terribly worng man.</h1>
//     }

//     return (
//       <div className="space-y-6 p-6">
//         <PageHeader
//           title="Enrolled Courses"
//           subtitle=""
//         />

//         {data?.map(course => (
//           <Section
//             course={course} >
//           </Section>
//         ))}

//       </div>
//     )
// }

// function Section({
//   course
// }: {
//   course: EnrolledCourse;
// }) {
//   return (
//     <div className="rounded-lg border border-border bg-surface">
//       <div className="flex items-center gap-4 px-6 py-2 border-b border-border">
//         {/* <Avatar name={faculty.full_name} url={faculty.avatar_url} /> */}
//         <div>
//           <h2 className="text-lg font-semibold tracking-tight pb-2">{course.title}</h2>
//           <h4 className="text-xs text-secondary">{course.code} | {course.nature} | {course.credits}</h4>
//         </div>

//       </div>
//     </div>
//   );
// }
import api from "../api/client";
import { useQuery } from "@tanstack/react-query";
// import { Skeleton } from "../components/ui/skeleton";
import { PageHeader } from "../components/page-header";
import { cn } from "../lib/utils/cn";

type EnrolledCourse = {
  code: string;
  title: string;
  nature: string;
  credits: number;
};

export function EnrolledCourses() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-enrolled-courses"],
    queryFn: async () => {
      const res = await api.get<EnrolledCourse[]>(
        "/me/student/enrolled-courses"
      );
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-danger">
        Something went wrong while loading courses.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Enrolled Courses"
        subtitle="All courses for the current semester"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map(course => (
          <CourseCard key={course.code} course={course} />
        ))}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: EnrolledCourse }) {
  return (
    <div
      className="
        group rounded-lg border border-border bg-surface
        p-4 transition
        hover:border-primary/40 hover:bg-muted/40
        cursor-pointer
      "
    >
      {/* Title */}
      <h3 className="text-sm font-semibold leading-snug line-clamp-2">
        {course.title}
      </h3>

      {/* Code */}
      <p className="mt-1 text-xs text-fg/60">
        {course.code}
      </p>

      {/* Meta */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="rounded-md bg-muted px-2 py-0.5 text-fg/70">
          {course.nature}
        </span>

        <span className="text-fg/60">
          {course.credits} credits
        </span>
      </div>

      {/* Hover hint */}
      <div className="mt-3 text-xs text-primary opacity-0 transition group-hover:opacity-100">
        View course →
      </div>
    </div>
  );
}

function Skeleton({ className, }: { className?: string; }) { return ( <div className={cn( "animate-pulse rounded-md bg-muted", className )} /> ); }