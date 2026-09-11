"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useCurrency, type CurrencyCode } from "@/lib/currency";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";

const CURRENCY_OPTIONS: { value: CurrencyCode; label: string; symbol: string }[] = [
  { value: "PHP", label: "Philippine Peso", symbol: "₱" },
  { value: "THB", label: "Thai Baht", symbol: "฿" },
];

export function SettingsPreferences() {
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const isDark = theme === "dark";

  return (
    <section className="surface mb-5 p-5">
      <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Appearance</h2>
      <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {isDark ? <Moon size={17} /> : <Sun size={17} />}
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">Dark mode</p>
            <p className="text-xs text-mutedForeground">{isDark ? "On — easy on the eyes at night" : "Off — bright and paper-like"}</p>
          </div>
        </div>
        <Switch checked={isDark} onCheckedChange={toggleTheme} label="Toggle dark mode" />
      </div>

      <h2 className="mb-4 mt-7 font-display text-lg font-semibold text-foreground">Currency</h2>
      <p className="mb-3 -mt-3 text-sm text-mutedForeground">Symbols update across the app automatically.</p>
      <div role="radiogroup" aria-label="Currency" className="flex gap-2 rounded-full bg-muted p-1">
        {CURRENCY_OPTIONS.map(({ value, label, symbol }) => {
          const active = currency === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={label}
              onClick={() => setCurrency(value)}
              className={cn(
                "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold transition-all duration-300 ease-crisp",
                active ? "bg-primary text-primaryForeground shadow-soft" : "text-mutedForeground hover:text-foreground"
              )}
            >
              <span>{symbol}</span>
              {value}
            </button>
          );
        })}
      </div>
    </section>
  );
}
