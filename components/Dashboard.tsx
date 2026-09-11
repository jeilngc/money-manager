"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ChevronRight, CirclePlus, Repeat, Settings as SettingsIcon, WalletCards } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatMinor } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";
import { NetWorthWidget } from "@/components/NetWorthWidget";

type Account = { id: string; name: string; type: string; currency: string; balance: number; icon_key: string | null };
type Transaction = { id: string; kind: "income" | "expense" | "transfer"; amount: number; note: string | null; occurred_at: number; category_name: string | null; category_emoji: string | null; account_name: string | null };
type HistoryTx = { kind: "income" | "expense"; amount: number; occurred_at: number };

// Two earth tones alternating across account cards — moss and clay, never a third hue
const CARD_THEMES = [
  "bg-gradient-to-br from-[#5D7052] to-[#3F5138]",
  "bg-gradient-to-br from-[#C18C5D] to-[#9C6E44]",
];

function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Dashboard({
  firstName,
  accounts,
  transactions,
  weeklyExpenses,
  netWorth,
  history,
}: {
  firstName: string;
  accounts: Account[];
  transactions: Transaction[];
  weeklyExpenses: number;
  netWorth: number;
  history: HistoryTx[];
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);
  const { symbol } = useCurrency();
  const name = firstName || "there";
  const days = [0, 0, 0, 0, 0, 0, 0];
  transactions
    .filter((t) => t.kind === "expense")
    .forEach((t) => {
      const offset = Math.floor((Date.now() - t.occurred_at) / 86400000);
      if (offset >= 0 && offset < 7) days[6 - offset] += t.amount;
    });
  const max = Math.max(...days, 1);

  // The greeting and date reflect the visitor's own clock, so they're read
  // client-side after mount rather than from the server's request time.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const dateLabel = now ? now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) : "";
  const greeting = now ? greetingFor(now.getHours()) : "Hello";

  // Tracks which card is actually centered as the user swipes, so the dot
  // indicator reflects real position instead of always showing the first dot.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const index = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
      setActiveCard(index);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [accounts.length]);

  const goToCard = (index: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  return (
    <main className="relative px-3 pb-5 pt-7">
      <div className="blob pointer-events-none absolute -top-10 right-0 h-56 w-56 bg-secondary/10" aria-hidden />

      <header className="relative mb-5 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[55%_45%_60%_40%/45%_55%_45%_55%] bg-primary/10 font-display text-sm font-bold text-primary">
            {name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="text-xs text-mutedForeground">{dateLabel}</p>
            <h1 className="font-display text-lg font-semibold leading-tight text-foreground">
              {greeting}, {name}
            </h1>
          </div>
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground transition-colors duration-300 hover:bg-accent"
        >
          <SettingsIcon size={19} />
        </Link>
      </header>

      <NetWorthWidget netWorth={netWorth} history={history} />

      {accounts.length ? (
        <>
          <div ref={scroller} className="scroll-snap-x relative flex snap-x gap-3 overflow-x-auto px-2 pb-3" aria-label="Your accounts">
            {accounts.map((account, index) => (
              <Link
                key={account.id}
                href={`/accounts/${account.id}/edit`}
                className={`snap-card min-w-full shrink-0 rounded-[2rem] p-6 text-[#F3F4F1] shadow-soft transition-all duration-300 ease-crisp ${
                  index === activeCard ? "scale-100 opacity-100" : "scale-[0.95] opacity-70"
                } ${CARD_THEMES[index % CARD_THEMES.length]}`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-white/70">
                  <span>{account.name}</span>
                  <span className="rounded-full bg-white/15 px-3 py-1">Available</span>
                </div>
                <p className="mt-3 text-4xl font-bold tracking-tight">
                  {symbol}{formatMinor(account.balance)}
                </p>
                <div className="mt-9 flex items-center justify-between text-sm text-white/70">
                  <span className="tracking-[.25em]">••••</span>
                  <span className="font-display italic">{account.type === "ewallet" ? "e-Wallet" : "Card"}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mb-5 flex justify-center gap-1.5">
            {accounts.map((a, i) => (
              <button
                key={a.id}
                onClick={() => goToCard(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ease-crisp ${i === activeCard ? "w-5 bg-primary" : "w-1.5 bg-border"}`}
                aria-label={`Show ${a.name}`}
              />
            ))}
          </div>
        </>
      ) : (
        <Link href="/accounts/new" className="surface mb-5 flex min-h-40 flex-col items-center justify-center gap-3 border-dashed text-mutedForeground">
          <CirclePlus className="text-primary" />
          Add your first account
        </Link>
      )}

      <section className="mb-5 grid grid-cols-4 gap-2 px-1">
        <Link href="/transactions/new?kind=expense" className="action-tile">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primaryForeground">
            <ArrowUpRight size={18} />
          </span>
          Expense
        </Link>
        <Link href="/transactions/new?kind=income" className="action-tile">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/15 text-secondary">
            <ArrowDownLeft size={18} />
          </span>
          Income
        </Link>
        <Link href="/transactions/new?kind=transfer" className="action-tile">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/15 text-secondary">
            <Repeat size={18} />
          </span>
          Transfer
        </Link>
        <Link href="/accounts" className="action-tile">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/15 text-secondary">
            <WalletCards size={18} />
          </span>
          Cards
        </Link>
      </section>

      <section className="surface mb-5 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-mutedForeground">Spending this week</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {symbol}{formatMinor(weeklyExpenses)}
            </p>
          </div>
          <Link href="/stats" className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary">
            Insights
          </Link>
        </div>
        <div className="mt-5 flex h-20 items-end justify-between gap-2">
          {days.map((value, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={`w-full max-w-8 rounded-full transition-all duration-300 ${index === 6 ? "bg-primary" : "bg-muted"}`}
                style={{ height: `${Math.max(10, (value / max) * 64)}px` }}
              />
              <span className={`text-[10px] font-bold ${index === 6 ? "text-primary" : "text-mutedForeground"}`}>
                {["M", "T", "W", "T", "F", "S", "S"][index]}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-1">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">Recent activity</h2>
          <Link href="/transactions" className="flex items-center text-xs font-bold text-primary">
            See all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="space-y-2">
          {transactions.slice(0, 4).map((t) => (
            <div key={t.id} className="surface flex items-center gap-3 p-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-lg">{t.category_emoji ?? "•"}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{t.category_name ?? t.note ?? "Transfer"}</p>
                <p className="truncate text-xs text-mutedForeground">{t.account_name ?? new Date(t.occurred_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${t.kind === "income" ? "text-primary" : "text-foreground"}`}>
                  {t.kind === "income" ? "+" : t.kind === "expense" ? "−" : ""}{symbol}{formatMinor(t.amount)}
                </p>
                <p className="text-[10px] text-mutedForeground">{t.kind}</p>
              </div>
            </div>
          ))}
          {!transactions.length && <p className="py-8 text-center text-sm text-mutedForeground">Your activity will appear here.</p>}
        </div>
      </section>
    </main>
  );
}
