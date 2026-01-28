import { cn } from "../libs/utils/cn";
import { Spinner } from "./spinner";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

/**
 * Button Component
 * 
 * A flexible button component with multiple variants, sizes, and states.
 * Supports loading state with spinner and icon placement.
 * 
 * @example
 * <Button variant="primary" size="md" loading={isLoading}>
 *   Save Changes
 * </Button>
 * 
 * <Button variant="outline" leftIcon={<PlusIcon />}>
 *   Add New
 * </Button>
 */
export function Button({
  variant = "primary",
  size = "md",
  loading,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: Props) {
  const isDisabled = loading || disabled;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "rounded-lg font-semibold",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        
        {
          primary: [
            "bg-primary text-primary-fg",
            "hover:bg-primary/90 hover:shadow-md",
            "active:scale-[0.98]",
          ],
          secondary: [
            "bg-muted text-fg",
            "hover:bg-muted/80 hover:shadow-sm",
            "active:scale-[0.98]",
          ],
          outline: [
            "border-2 border-border bg-transparent text-fg",
            "hover:bg-muted hover:border-border-strong",
            "active:scale-[0.98]",
          ],
          ghost: [
            "bg-transparent text-fg",
            "hover:bg-muted",
            "active:scale-[0.98]",
          ],
          danger: [
            "bg-danger text-white",
            "hover:bg-danger/90 hover:shadow-md",
            "active:scale-[0.98]",
          ],
        }[variant],
        
        {
          sm: "h-9 px-3 text-sm",
          md: "h-10 px-4 text-base",
          lg: "h-12 px-6 text-lg",
        }[size],
        
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={size === "sm" ? "sm" : "md"} />
          {children}
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

/**
 * Icon Button - Square button for icon-only actions
 */
export function IconButton({
  size = "md",
  variant = "ghost",
  className,
  children,
  ...props
}: Props) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "aspect-square p-0",
        {
          sm: "w-9 h-9",
          md: "w-10 h-10",
          lg: "w-12 h-12",
        }[size],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}