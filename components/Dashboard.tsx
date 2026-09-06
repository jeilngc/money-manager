"use client";

import Link from "next/link";
import { Bell, ChevronRight, CirclePlus, CreditCard, HandCoins, Landmark, MoreHorizontal, Send, WalletCards } from "lucide-react";
import { useRef } from "react";
import { AccountIcon } from "@/components/AccountIcon";
import { currencySymbol, formatMinor } from "@/lib/utils";

type Account = { id: string; name: string; type: string; currency: string; balance: number; icon_key: string | null };
type Transaction = { id: string; kind: "income" | "expense" | "transfer"; amount: number; note: string | null; occurred_at: number; category_name: string | null; category_emoji: string | null; account_name: string | null };

export function Dashboard({ firstName, accounts, transactions, weeklyExpenses }: { firstName: string; accounts: Account[]; transactions: Transaction[]; weeklyExpenses: number }) {
  const scroller = useRef<HTMLDivElement>(null);
  const name = firstName || "there";
  const days = [0, 0, 0, 0, 0, 0, 0];
  transactions.filter((t) => t.kind === "expense").forEach((t) => { const offset = Math.floor((Date.now() - t.occurred_at) / 86400000); if (offset >= 0 && offset < 7) days[6 - offset] += t.amount; });
  const max = Math.max(...days, 1);
  const swipe = (direction: number) => scroller.current?.scrollBy({ left: direction * (scroller.current.clientWidth - 18), behavior: "smooth" });

  return <main className="px-3 pb-5 pt-7">
    <header className="mb-4 flex items-center justify-between px-2">
      <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1c2e4e] text-sm font-bold text-accent">{name.slice(0, 1).toUpperCase()}</span><div><p className="text-xs text-mutedForeground">Good morning</p><h1 className="font-bold leading-tight">{name}</h1></div></div>
      <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-muted" aria-label="Notifications"><Bell size={19} /><span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent" /></button>
    </header>

    {accounts.length ? <><div ref={scroller} className="scroll-snap-x flex snap-x gap-3 overflow-x-auto px-2 pb-3" aria-label="Your accounts">
      {accounts.map((account, index) => <Link key={account.id} href={`/accounts/${account.id}/edit`} className={`snap-card min-w-full rounded-[28px] p-5 text-white ${index % 2 ? "bg-gradient-to-br from-[#30305a] to-[#1e3157]" : "bg-gradient-to-br from-[#164e43] to-[#23506d]"}`}>
        <div className="flex items-center justify-between text-xs font-medium text-[#c5d9d8]"><span>{account.name}</span><span className="rounded-full bg-white/15 px-3 py-1 text-accent">Available</span></div>
        <p className="mt-2 text-4xl font-bold tracking-tight">{currencySymbol(account.currency)}{formatMinor(account.balance)}</p>
        <div className="mt-9 flex items-center justify-between"><span className="flex items-center gap-2 text-sm tracking-[.2em] text-[#d5e4e5]"><CreditCard size={17} />••••</span><span className="font-bold italic">{account.type === "ewallet" ? "e-Wallet" : "VISA"}</span></div>
      </Link>)}
    </div><div className="mb-4 flex justify-center gap-1.5">{accounts.map((a, i) => <button key={a.id} onClick={() => swipe(i)} className={`h-1.5 rounded-full ${i === 0 ? "w-5 bg-accent" : "w-1.5 bg-mutedForeground/40"}`} aria-label={`Show ${a.name}`} />)}</div></> : <Link href="/accounts/new" className="surface mb-5 flex min-h-40 flex-col items-center justify-center gap-3 border border-dashed border-border text-mutedForeground"><CirclePlus className="text-accent" />Add your first account</Link>}

    <section className="mb-4 grid grid-cols-4 gap-2 px-1"><Link href="/transactions/new?kind=expense" className="action-tile"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accentForeground"><Send size={18} /></span>Send</Link><Link href="/transactions/new?kind=income" className="action-tile"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#213b5f] text-[#55e3cc]"><HandCoins size={18} /></span>Request</Link><Link href="/transactions/new?kind=transfer" className="action-tile"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#213b5f] text-[#55e3cc]"><Landmark size={18} /></span>Top up</Link><Link href="/accounts" className="action-tile"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#213b5f]"><MoreHorizontal size={19} /></span>More</Link></section>

    <section className="surface mb-5 p-5"><div className="flex items-start justify-between"><div><p className="text-sm text-[#94b7e6]">Spending this week</p><p className="mt-1 text-2xl font-bold">₱{formatMinor(weeklyExpenses)}</p></div><Link href="/stats" className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-accent">Insights</Link></div><div className="mt-5 flex h-20 items-end justify-between gap-2">{days.map((value, index) => <div key={index} className="flex flex-1 flex-col items-center gap-2"><div className={`w-full max-w-8 rounded-md ${index === 6 ? "bg-accent" : "bg-[#203555]"}`} style={{ height: `${Math.max(10, (value / max) * 64)}px` }} /><span className={`text-[10px] ${index === 6 ? "text-accent" : "text-mutedForeground"}`}>{["M","T","W","T","F","S","S"][index]}</span></div>)}</div></section>

    <section className="px-1"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Recent activity</h2><Link href="/transactions" className="flex items-center text-xs font-semibold text-[#50e0bb]">See all <ChevronRight size={14} /></Link></div><div className="space-y-2">{transactions.slice(0, 4).map((t) => <div key={t.id} className="surface flex items-center gap-3 p-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#243c5c] text-lg">{t.category_emoji ?? "•"}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{t.category_name ?? t.note ?? "Transfer"}</p><p className="truncate text-xs text-mutedForeground">{t.account_name ?? new Date(t.occurred_at).toLocaleDateString()}</p></div><div className="text-right"><p className={`text-sm font-bold ${t.kind === "income" ? "text-[#50e0bb]" : ""}`}>{t.kind === "income" ? "+" : t.kind === "expense" ? "−" : ""}₱{formatMinor(t.amount)}</p><p className="text-[10px] text-mutedForeground">{t.kind}</p></div></div>)}{!transactions.length && <p className="py-8 text-center text-sm text-mutedForeground">Your activity will appear here.</p>}</div></section>
  </main>;
}
