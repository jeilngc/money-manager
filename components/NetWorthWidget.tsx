"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatMinor, cn } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";

type HistoryTx = { kind: "income" | "expense"; amount: number; occurred_at: number };

const NET_WORTH_RANGES = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
  { label: "ALL", days: Infinity },
] as const;

const SUMMARY_RANGES = [
  { label: "Day", days: 1 },
  { label: "Week", days: 7 },
  { label: "Month", days: 30 },
] as const;

const HISTORY_WINDOW_DAYS = 370;

function dayKey(ms: number) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Smooth-looking line via quadratic segments through each point's midpoint — no chart library needed. */
function buildSmoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    d += ` Q ${p0.x} ${p0.y} ${(p0.x + p1.x) / 2} ${(p0.y + p1.y) / 2}`;
  }
  const last = points[points.length - 1];
  d += ` T ${last.x} ${last.y}`;
  return d;
}

export function NetWorthWidget({ netWorth, history }: { netWorth: number; history: HistoryTx[] }) {
  const { symbol } = useCurrency();
  const [netRange, setNetRange] = useState<(typeof NET_WORTH_RANGES)[number]["label"]>("3M");
  const [summaryRange, setSummaryRange] = useState<(typeof SUMMARY_RANGES)[number]["label"]>("Day");

  // Net daily delta — income minus expense. Transfers between the user's own
  // accounts are excluded from `history` entirely, since they cancel to zero.
  const dailyDelta = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of history) {
      const key = dayKey(t.occurred_at);
      const signed = t.kind === "income" ? t.amount : -t.amount;
      map.set(key, (map.get(key) ?? 0) + signed);
    }
    return map;
  }, [history]);

  // Reconstructs end-of-day net worth by walking backward from today's real
  // total and undoing each day's net effect — not stored data, but derived
  // directly from it.
  const fullSeries = useMemo(() => {
    const series: { ms: number; value: number }[] = [];
    let value = netWorth;
    for (let i = 0; i <= HISTORY_WINDOW_DAYS; i++) {
      const ms = Date.now() - i * 86400000;
      series.unshift({ ms, value });
      value -= dailyDelta.get(dayKey(ms)) ?? 0;
    }
    return series;
  }, [netWorth, dailyDelta]);

  const activeRange = NET_WORTH_RANGES.find((r) => r.label === netRange)!;
  const series = activeRange.days === Infinity ? fullSeries : fullSeries.slice(-(activeRange.days + 1));

  const values = series.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const width = 280;
  const height = 72;
  const points = series.map((p, i) => ({
    x: (i / Math.max(series.length - 1, 1)) * width,
    y: height - ((p.value - min) / span) * height,
  }));
  const linePath = buildSmoothPath(points);
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
    : "";

  const first = values[0] ?? netWorth;
  const changePct = first !== 0 ? ((netWorth - first) / Math.abs(first)) * 100 : 0;
  const isUp = changePct >= 0;

  const windowStart = Date.now() - SUMMARY_RANGES.find((r) => r.label === summaryRange)!.days * 86400000;
  const summary = history.reduce(
    (acc, t) => {
      if (t.occurred_at < windowStart) return acc;
      if (t.kind === "income") acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  return (
    <div className="surface mb-4 grid grid-cols-2 divide-x divide-border/50 overflow-hidden">
      {/* Left: net worth trend */}
      <div className="p-4">
        <p className="text-xs font-bold text-mutedForeground">Net Worth Trend</p>
        <p className="mt-1 text-xl font-bold text-foreground">
          {symbol}{formatMinor(netWorth)}
        </p>
        <span
          className={cn(
            "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
            isUp ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
          )}
        >
          {isUp ? "+" : ""}
          {changePct.toFixed(1)}%
        </span>

        <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-16 w-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0.35" />
              <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {areaPath && <path d={areaPath} fill="url(#netWorthFill)" />}
          {linePath && <path d={linePath} fill="none" stroke="rgb(var(--primary))" strokeWidth="2" strokeLinecap="round" />}
        </svg>

        <div className="mt-2 flex flex-wrap gap-1">
          {NET_WORTH_RANGES.map(({ label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setNetRange(label)}
              className={cn(
                "rounded-full px-2 py-1 text-[10px] font-bold transition-colors duration-300",
                netRange === label ? "bg-primary text-primaryForeground" : "bg-muted text-mutedForeground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: today / week / month summary */}
      <div className="p-4">
        <p className="text-xs font-bold text-mutedForeground">Today</p>
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ArrowUpRight size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] text-mutedForeground">Income</p>
              <p className="truncate text-sm font-bold text-primary">
                {symbol}{formatMinor(summary.income)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ArrowDownRight size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] text-mutedForeground">Expense</p>
              <p className="truncate text-sm font-bold text-destructive">
                {symbol}{formatMinor(summary.expense)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {SUMMARY_RANGES.map(({ label }) => (
            <button
              key={label}
              type="button"
              onClick={() => setSummaryRange(label)}
              className={cn(
                "rounded-full px-2 py-1 text-[10px] font-bold transition-colors duration-300",
                summaryRange === label ? "bg-primary text-primaryForeground" : "bg-muted text-mutedForeground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
