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
  { href: "/settings", label: "Profile", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#101e36]/95 backdrop-blur-md">
      <ul className="mx-auto grid max-w-md grid-cols-5 px-2 pb-[max(.65rem,env(safe-area-inset-bottom))] pt-2">
        {TABS.map(({ href, label, icon: Icon, raised }) => {
          const active = href === "/transactions/new" ? pathname === href : pathname?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-semibold",
                  active ? "text-accent" : "text-mutedForeground",
                  raised && "-mt-7"
                )}
              >
                <span className={cn("flex items-center justify-center", raised && "h-14 w-14 rounded-full bg-accent text-accentForeground shadow-[0_0_0_4px_#0b1425]")}><Icon size={raised ? 25 : 20} strokeWidth={active ? 2.2 : 1.8} /></span>
                {!raised && <span>{label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
