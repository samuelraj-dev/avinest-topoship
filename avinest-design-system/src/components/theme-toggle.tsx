import { useState } from "react";
import { getTheme, toggleTheme, type Theme } from "../libs/utils/theme";
import { cn } from "../libs/utils/cn";

export function ThemeToggle({ 
  className, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [theme, setTheme] = useState<Theme>(getTheme());

  const handleToggle = () => {
    setTheme(toggleTheme());
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        // Base styles
        "group relative inline-flex items-center gap-2.5",
        "h-10 px-4 rounded-lg",
        "font-medium text-sm",
        
        // Colors - subtle background with border
        "bg-surface border-2 border-border",
        "text-fg-secondary",
        
        // Hover state
        "hover:bg-muted hover:border-border-strong",
        "hover:text-fg",
        
        // Focus state
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2",
        
        // Smooth transitions
        "transition-all duration-200",
        
        // Active state
        "active:scale-[0.98]",
        
        className
      )}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      {...props}
    >
      {/* Icon container with rotation animation */}
      <span 
        className={cn(
          "inline-flex items-center justify-center",
          "transition-transform duration-500 ease-out",
          theme === "dark" ? "rotate-180" : "rotate-0"
        )}
      >
        {theme === "light" ? (
          // Moon icon for dark mode
          <svg 
            className="w-5 h-5 text-fg-secondary group-hover:text-primary transition-colors"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
            />
          </svg>
        ) : (
          // Sun icon for light mode
          <svg 
            className="w-5 h-5 text-fg-secondary group-hover:text-warning-500 transition-colors"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
            />
          </svg>
        )}
      </span>

      {/* Text label */}
      <span className="select-none">
        {theme === "light" ? "Dark" : "Light"}
      </span>
    </button>
  );
}

/**
 * Compact version - Icon only for space-constrained areas
 */
export function ThemeToggleCompact({ 
  className, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [theme, setTheme] = useState<Theme>(getTheme());

  const handleToggle = () => {
    setTheme(toggleTheme());
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        // Base styles
        "group relative inline-flex items-center justify-center",
        "w-10 h-10 rounded-lg",
        
        // Colors
        "bg-surface border-2 border-border",
        "text-fg-secondary",
        
        // Hover state
        "hover:bg-muted hover:border-border-strong",
        "hover:text-fg",
        
        // Focus state
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2",
        
        // Smooth transitions
        "transition-all duration-200",
        
        // Active state
        "active:scale-[0.98]",
        
        className
      )}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      {...props}
    >
      {/* Icon with rotation animation */}
      <span 
        className={cn(
          "inline-flex items-center justify-center",
          "transition-transform duration-500 ease-out",
          theme === "dark" ? "rotate-180" : "rotate-0"
        )}
      >
        {theme === "light" ? (
          <svg 
            className="w-5 h-5 text-fg-secondary group-hover:text-primary transition-colors"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
            />
          </svg>
        ) : (
          <svg 
            className="w-5 h-5 text-fg-secondary group-hover:text-warning-500 transition-colors"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
            />
          </svg>
        )}
      </span>
    </button>
  );
}

/**
 * Toggle Switch Style - Alternative design
 */
export function ThemeToggleSwitch({ 
  className, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [theme, setTheme] = useState<Theme>(getTheme());

  const handleToggle = () => {
    setTheme(toggleTheme());
  };

  const isDark = theme === "dark";

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative inline-flex items-center h-10 w-20 rounded-full",
        "transition-all duration-300 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2",
        isDark ? "bg-primary/20" : "bg-warning-100",
        className
      )}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      role="switch"
      aria-checked={isDark}
      {...props}
    >
      {/* Track */}
      <span
        className={cn(
          "absolute inset-0 rounded-full border-2 transition-colors",
          isDark ? "border-primary/30" : "border-warning-300"
        )}
      />
      
      {/* Slider */}
      <span
        className={cn(
          "relative inline-flex items-center justify-center",
          "h-8 w-8 rounded-full shadow-md",
          "transform transition-all duration-300 ease-out",
          "bg-surface border-2",
          isDark 
            ? "translate-x-11 border-primary" 
            : "translate-x-1 border-warning-500"
        )}
      >
        {/* Icon inside slider */}
        {isDark ? (
          <svg 
            className="w-4 h-4 text-primary"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
            />
          </svg>
        ) : (
          <svg 
            className="w-4 h-4 text-warning-600"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
            />
          </svg>
        )}
      </span>
    </button>
  );
}