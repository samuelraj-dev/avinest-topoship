import { cn } from "../libs/utils/cn";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

/**
 * Spinner Component
 * 
 * A loading spinner with multiple size options
 */
export function Spinner({ size = "md", className }: Props) {
  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        {
          sm: "h-4 w-4",
          md: "h-5 w-5",
          lg: "h-6 w-6",
        }[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}