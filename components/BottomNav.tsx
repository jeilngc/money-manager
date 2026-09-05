"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Receipt, PieChart, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/transactions", label: "Trans.", icon: Receipt },
  { href: "/stats", label: "Stats", icon: PieChart },
  { href: "/accounts", label: "Accounts", icon: Wallet },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
      <ul className="grid grid-cols-3 max-w-container mx-auto">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-3 min-h-[44px]",
                  "transition-colors duration-150",
                  active ? "text-accent" : "text-mutedForeground hover:text-foreground"
                )}
              >
                <Icon size={22} strokeWidth={1.5} />
                <span className="font-mono text-[10px] uppercase tracking-widest">{label}</span>
                {active && <span className="absolute mt-7 h-0.5 w-8 bg-accent" aria-hidden />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
