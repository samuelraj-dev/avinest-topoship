import { Card, CardContent, CardHeader } from "./ui/card";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="flex items-center justify-center">
        <h1 className="text-xl tracking-tight leading-tight text-[#44475b] font-[535]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-text-muted">
            {subtitle}
          </p>
        )}
      </CardHeader>

      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
