import { cn } from "../libs/utils/cn";

type Props = {
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "outlined" | "elevated";
  hoverable?: boolean;
};

/**
 * Card Component
 * 
 * A container component for grouping related content with optional variants
 * and hover effects for interactive cards.
 * 
 * @example
 * <Card variant="elevated" hoverable>
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Content here</CardContent>
 * </Card>
 */
export function Card({ 
  className, 
  children, 
  variant = "default",
  hoverable = false 
}: Props) {
  return (
    <div
      className={cn(
        // Base styles
        "rounded-xl bg-surface transition-all duration-200",
        // Variants
        {
          default: "border border-border shadow-sm",
          outlined: "border-2 border-border",
          elevated: "border border-border/50 shadow-lg",
        }[variant],
        // Hoverable state
        hoverable && "hover:shadow-xl hover:-translate-y-0.5 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ 
  children,
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-6 pt-6 pb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ 
  children,
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn(
      "text-xl font-semibold tracking-tight text-fg",
      className
    )}>
      {children}
    </h3>
  );
}

export function CardDescription({ 
  children,
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn(
      "mt-1.5 text-sm text-fg-muted",
      className
    )}>
      {children}
    </p>
  );
}

export function CardContent({ 
  children,
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-6 pb-6", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ 
  children,
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "px-6 pb-6 pt-4 border-t border-border",
      className
    )}>
      {children}
    </div>
  );
}