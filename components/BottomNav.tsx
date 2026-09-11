"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CirclePlus, CreditCard, House, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/stats", label: "Insights", icon: BarChart3 },
  { href: "/transactions/new", label: "Add", icon: CirclePlus, raised: true },
  { href: "/accounts", label: "Cards", icon: CreditCard },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-40 px-4" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {/*
        bg-card/70 (not a hardcoded white) is what makes this work in dark mode:
        --card resolves to a near-white paper tone in light mode and a dark
        forest-night surface in dark mode, so the same class produces the
        right glassmorphism in both themes.
      */}
      <ul className="mx-auto flex max-w-sm items-center justify-between rounded-full border border-border/50 bg-card/70 px-3 py-2 shadow-float backdrop-blur-md transition-colors duration-300">
        {TABS.map(({ href, label, icon: Icon, raised }) => {
          const active = href === "/transactions/new" ? pathname === href : pathname?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                className={cn(
                  "relative flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-bold transition-all duration-300 ease-crisp",
                  active ? "text-primary" : "text-mutedForeground",
                  raised &&
                    "-mt-8 h-14 w-14 border border-border/30 bg-primary text-primaryForeground shadow-soft hover:scale-105 hover:shadow-[0_6px_24px_-4px_rgba(93,112,82,0.3)] active:scale-95"
                )}
              >
                <Icon size={raised ? 24 : 20} strokeWidth={active ? 2.4 : 2} />
                {!raised && <span>{label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
