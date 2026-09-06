export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function id(): string {
  return crypto.randomUUID();
}

export function now(): number {
  return Date.now();
}

/** Format an integer amount stored in minor units (centavos) as a display string, e.g. 123456 -> "1,234.56" */
export function formatMinor(minor: number): string {
  const value = minor / 100;
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Parse a user-entered amount string like "1,234.56" into minor units (integer centavos). */
export function toMinor(input: string): number {
  const cleaned = input.replace(/,/g, "").trim();
  const value = parseFloat(cleaned || "0");
  if (Number.isNaN(value)) return 0;
  return Math.round(value * 100);
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  PHP: "\u20B1",
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  JPY: "\u00A5",
};

export function currencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? currency + " ";
}

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}
