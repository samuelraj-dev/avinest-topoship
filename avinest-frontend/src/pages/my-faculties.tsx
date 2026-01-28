import { useEffect } from "react"
import api from "../api/client"

export function MyFacultiesPage() {

    useEffect(() => {
        fetchMyFaculties();
    }, [])

    async function fetchMyFaculties() {
        const res = await api.get("/me/student/my-faculties");
        console.log(res.data);
    }

    return (
        // <h1>My Faculties</h1>
        <>
            <Card>
                hello
            </Card>
            <AccentCard>
                hello
            </AccentCard>
        </>
    )
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

