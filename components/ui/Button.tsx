"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "default" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-6 text-sm",
  default: "h-12 px-8 text-base",
  lg: "h-14 px-10 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "default", className, children, ...props }, ref) => {
    const base = cn(
      "inline-flex items-center justify-center gap-2 rounded-full font-bold",
      "transition-all duration-300 ease-crisp",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
      "disabled:pointer-events-none disabled:opacity-50",
      "active:scale-95",
      sizeClasses[size]
    );

    if (variant === "primary") {
      return (
        <button
          ref={ref}
          className={cn(
            base,
            "bg-primary text-primaryForeground shadow-soft",
            "hover:scale-[1.03] hover:shadow-[0_6px_24px_-4px_rgba(93,112,82,0.3)]",
            className
          )}
          {...props}
        >
          {children}
        </button>
      );
    }

    if (variant === "secondary") {
      return (
        <button
          ref={ref}
          className={cn(
            base,
            "border-thick border-secondary bg-transparent text-secondary",
            "hover:scale-[1.03] hover:bg-secondary/10",
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
        className={cn(base, "text-primary hover:bg-primary/10", className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
