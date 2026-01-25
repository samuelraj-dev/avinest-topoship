import { cn } from "../../lib/utils/cn";
import { Spinner } from "./spinner";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  className,
  ...props
}: Props) {
  return (
    <button
      disabled={loading || props.disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium",
        "transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        {
          primary: "bg-primary text-primary-fg hover:bg-primary/90",
          secondary: "bg-muted text-fg hover:bg-muted/80",
          danger: "bg-danger text-white hover:bg-danger/90",
        }[variant],
        {
          sm: "h-8 px-3 text-sm",
          md: "h-10 px-4",
          lg: "h-12 px-6 text-lg",
        }[size],
        className
      )}
      {...props}
    >{loading ? <Spinner /> : children}</button>
  );
}
