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
      <CardHeader>
        <h1 className="text-xl font-semibold  tracking-tight leading-tight">
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
