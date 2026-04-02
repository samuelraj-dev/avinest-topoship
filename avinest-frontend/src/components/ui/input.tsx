import { cn } from "../../lib/utils/cn";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-md border border-gray-300",
        "bg-bg px-3 text-fg font-light",
        "placeholder:text-sm placeholder:text-gray-400 placeholder:font-light",
        "transition",
        "focus:outline-none focus:ring-2 focus:ring-[#04b488]/40 focus:border-[#04b488]",
        "disabled:opacity-50",
        props.className
      )}
    />
  );
}
