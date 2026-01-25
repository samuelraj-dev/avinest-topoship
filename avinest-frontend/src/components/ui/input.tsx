import { cn } from "../../lib/utils/cn";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-md border border-border",
        "bg-bg px-3 text-fg",
        "placeholder:text-fg/50",
        "transition",
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
        "disabled:opacity-50",
        props.className
      )}
    />
  );
}
