"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "default" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const sizePadding: Record<Size, string> = {
  sm: "py-2",
  default: "py-3",
  lg: "py-4",
};

const sizeGap: Record<Size, string> = {
  sm: "gap-2",
  default: "gap-2.5",
  lg: "gap-3",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "default", className, children, ...props }, ref) => {
    const base = cn(
      "relative inline-flex items-center justify-center whitespace-nowrap",
      "font-semibold uppercase tracking-wider text-sm",
      "transition-all duration-150 ease-crisp",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      "disabled:pointer-events-none disabled:opacity-50",
      "active:translate-y-px",
      sizeGap[size]
    );

    if (variant === "primary") {
      return (
        <button
          ref={ref}
          className={cn(base, "px-0 text-accent group", sizePadding[size], className)}
          {...props}
        >
          {children}
          <span
            aria-hidden
            className="absolute left-0 -bottom-0.5 h-0.5 w-full bg-accent origin-left scale-x-100 transition-transform duration-150 ease-crisp group-hover:scale-x-110"
          />
        </button>
      );
    }

    if (variant === "secondary") {
      return (
        <button
          ref={ref}
          className={cn(
            base,
            "border border-foreground text-foreground px-6 hover:bg-foreground hover:text-background",
            sizePadding[size],
            className
          )}
          {...props}
        >
          {children}
        </button>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(
          base,
          "px-4 text-mutedForeground hover:text-foreground group",
          sizePadding[size],
          className
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden
          className="absolute left-4 right-4 -bottom-0.5 h-px bg-foreground origin-left scale-x-0 transition-transform duration-150 ease-crisp group-hover:scale-x-100"
        />
      </button>
    );
  }
);

Button.displayName = "Button";
