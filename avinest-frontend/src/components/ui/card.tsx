import { cn } from "../../lib/utils/cn";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function Card({ className, children }: Props) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-bg",
        "shadow-sm dark:shadow-none",
        "border border-border/80",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: Props) {
  return (
    <div className={cn("px-6 pt-6", className)}>
      {children}
    </div>
  );
}

export function CardContent({ className, children }: Props) {
  return (
    <div className={cn("px-6 pb-6 pt-4", className)}>
      {children}
    </div>
  );
}
