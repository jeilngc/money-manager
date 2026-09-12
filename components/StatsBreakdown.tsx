"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatMinor } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";
import { TransactionDetailModal, type TransactionDetail } from "@/components/TransactionDetailModal";

interface CategoryTotal {
  category_id: string | null;
  name: string | null;
  emoji: string | null;
  color: string | null;
  total: number;
}

const FALLBACK_COLORS = [
  "#8FA47D", "#C18C5D", "#C9A66B", "#5D7052", "#A6927C", "#B98B7B", "#9C9C8A", "#8C6A4E",
];

export function StatsBreakdown({
  rows,
  kind,
  kindTotal,
  from,
  to,
}: {
  rows: CategoryTotal[];
  kind: "income" | "expense";
  kindTotal: number;
  from: number;
  to: number;
}) {
  const { symbol } = useCurrency();
  const [expanded, setExpanded] = useState<string | null>(null); // category_id, or "none" for Uncategorized
  const [txByCategory, setTxByCategory] = useState<Record<string, TransactionDetail[]>>({});
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<TransactionDetail | null>(null);

  async function toggleCategory(key: string) {
    if (expanded === key) {
      setExpanded(null);
      return;
    }
    setExpanded(key);
    if (txByCategory[key]) return; // already fetched this session

    setLoadingCategory(key);
    try {
      const params = new URLSearchParams({ kind, from: String(from), to: String(to), category_id: key });
      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json<{ transactions?: TransactionDetail[] }>();
      setTxByCategory((prev) => ({ ...prev, [key]: data.transactions ?? [] }));
    } finally {
      setLoadingCategory(null);
    }
  }

  function handleDeleted(id: string) {
    setTxByCategory((prev) => {
      const next: typeof prev = {};
      for (const [key, list] of Object.entries(prev)) next[key] = list.filter((t) => t.id !== id);
      return next;
    });
    setSelected(null);
  }

  return (
    <>
      <ul className="border-t border-border">
        {rows.map((r, i) => {
          const key = r.category_id ?? "none";
          const color = r.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length];
          const isOpen = expanded === key;
          const transactions = txByCategory[key];

          return (
            <li key={key} className="border-b border-border">
              <button
                type="button"
                onClick={() => toggleCategory(key)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 py-4 text-left transition-colors duration-300 hover:bg-muted/50"
              >
                <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
                <span className="w-7 text-center text-xl">{r.emoji ?? "\u{1F4CC}"}</span>
                <span className="flex-1 font-semibold text-foreground">{r.name ?? "Uncategorized"}</span>
                <span className="w-14 text-right font-mono text-sm text-mutedForeground">
                  {kindTotal > 0 ? ((r.total / kindTotal) * 100).toFixed(1) : "0.0"}%
                </span>
                <span className="tabular w-28 text-right font-mono text-foreground">
                  {symbol}{formatMinor(r.total)}
                </span>
                <ChevronDown
                  size={16}
                  className={`flex-shrink-0 text-mutedForeground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="pb-3 pl-11">
                  {loadingCategory === key ? (
                    <p className="py-3 text-sm text-mutedForeground">Loading…</p>
                  ) : !transactions || transactions.length === 0 ? (
                    <p className="py-3 text-sm text-mutedForeground">No transactions.</p>
                  ) : (
                    <ul className="space-y-1">
                      {transactions.map((t) => (
                        <li key={t.id}>
                          <button
                            type="button"
                            onClick={() => setSelected(t)}
                            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors duration-300 hover:bg-muted"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {t.note || t.account_name || "Transaction"}
                              </p>
                              <p className="text-xs text-mutedForeground">
                                {new Date(t.occurred_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </p>
                            </div>
                            <span className="tabular font-mono text-sm font-semibold text-foreground">
                              {symbol}{formatMinor(t.amount)}
                            </span>
                            <ChevronRight size={14} className="flex-shrink-0 text-mutedForeground" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {selected && (
        <TransactionDetailModal transaction={selected} onClose={() => setSelected(null)} onDeleted={handleDeleted} />
      )}
    </>
  );
}
