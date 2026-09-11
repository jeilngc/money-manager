"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full border border-border/50 transition-colors duration-300 ease-crisp",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "inline-block h-6 w-6 transform rounded-full bg-card shadow-soft transition-transform duration-300 ease-crisp",
          checked ? "translate-x-7" : "translate-x-1"
        )}
      />
    </button>
  );
}
