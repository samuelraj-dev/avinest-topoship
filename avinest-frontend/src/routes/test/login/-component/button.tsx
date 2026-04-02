import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      loading = false,
      variant = "primary",
      size = "md",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex
      items-center
      justify-center
      font-medium
      rounded-lg
      transition-all
      duration-200
      disabled:opacity-50
      disabled:cursor-not-allowed
      focus:outline-none
      focus:ring-2
      focus:ring-offset-2
      focus:ring-color-primary
    `;

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    };

    const variantStyles = {
      primary: `
        bg-color-primary
        hover:bg-color-primary-hover
        active:bg-color-primary-active
        text-color-primary-fg
        shadow-sm
        hover:shadow-md
      `,
      secondary: `
        bg-color-bg-secondary
        hover:bg-color-bg-tertiary
        border border-color-border
        text-color-text-primary
      `,
      danger: `
        bg-color-danger
        hover:opacity-90
        text-white
        shadow-sm
      `,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseStyles}
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${className || ""}
        `}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="w-4 h-4 mr-2 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";