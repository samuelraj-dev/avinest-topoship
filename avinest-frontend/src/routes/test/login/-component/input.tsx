import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full
          px-4 py-2.5
          text-color-text-primary
          placeholder-color-text-muted
          bg-color-bg-secondary
          border border-color-border
          rounded-lg
          transition-all
          duration-200
          
          hover:border-color-border-hover
          
          focus:outline-none
          focus:ring-2
          focus:ring-color-primary
          focus:border-transparent
          
          disabled:opacity-50
          disabled:cursor-not-allowed
          disabled:bg-color-bg-tertiary
          
          ${error ? "border-color-danger focus:ring-color-danger" : ""}
          
          ${className || ""}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";