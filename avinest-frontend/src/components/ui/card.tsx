import { cn } from "../../lib/utils/cn";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function Card({ className, children }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-bg",
        "shadow-sm dark:shadow-none",
        "border border-border/80",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 pt-6">
      {children}
    </div>
  );
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 pb-6 pt-4">
      {children}
    </div>
  );
}
