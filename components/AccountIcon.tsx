"use client";

import { Banknote, Landmark, Smartphone, CreditCard, PiggyBank, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const FALLBACK_ICONS = {
  cash: Banknote,
  bank: Landmark,
  ewallet: Smartphone,
  card: CreditCard,
  savings: PiggyBank,
  other: Wallet,
} as const;

export function AccountIcon({
  type,
  accountId,
  hasIcon,
  size = 40,
  className,
}: {
  type: keyof typeof FALLBACK_ICONS;
  accountId: string;
  hasIcon?: boolean | null;
  size?: number;
  className?: string;
}) {
  if (hasIcon) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/icons/${accountId}`}
        alt=""
        width={size}
        height={size}
        className={cn("flex-shrink-0 rounded-2xl border border-border/50 bg-muted object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  const Icon = FALLBACK_ICONS[type] ?? Wallet;
  return (
    <div
      className={cn("flex flex-shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-muted text-primary", className)}
      style={{ width: size, height: size }}
    >
      <Icon size={size * 0.5} strokeWidth={2} />
    </div>
  );
}
