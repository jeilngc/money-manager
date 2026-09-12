"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { X, Trash2, Pencil, Wallet, Calendar, StickyNote } from "lucide-react";
import { formatMinor } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";

export interface TransactionDetail {
  id: string;
  kind: "income" | "expense" | "transfer";
  amount: number;
  note: string | null;
  occurred_at: number;
  category_name: string | null;
  category_emoji: string | null;
  account_name: string | null;
}

export function TransactionDetailModal({
  transaction,
  onClose,
  onDeleted,
}: {
  transaction: TransactionDetail;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const router = useRouter();
  const { symbol } = useCurrency();
  const [deleting, setDeleting] = useState(false);

  const isIncome = transaction.kind === "income";
  const isExpense = transaction.kind === "expense";
  const dateLabel = new Date(transaction.occurred_at).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  async function handleDelete() {
    if (!confirm("Delete this transaction? This can't be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted(transaction.id);
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} aria-hidden />

      {/* Sheet — bg-card + text tokens mean this is already correct in both
          themes (cream in light, dark forest-night surface in dark) with no
          special-cased colors needed. */}
      <div className="app-shell relative w-full">
        <div className="relative max-h-[85vh] overflow-y-auto rounded-t-[2rem] border-t border-border/50 bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-lift transition-colors duration-300">
          <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-border" aria-hidden />

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-mutedForeground transition-colors duration-300 hover:bg-accent"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-2xl">
              {transaction.category_emoji ?? (transaction.kind === "transfer" ? "\u21C4" : "\u2022")}
            </span>
            <h2 className="mt-3 font-display text-lg font-semibold text-foreground">
              {transaction.category_name ?? (transaction.kind === "transfer" ? "Transfer" : "Uncategorized")}
            </h2>
            {/* Plain sans-serif for the amount, not the display serif used for headings */}
            <p className={`mt-2 text-4xl font-bold ${isIncome ? "text-primary" : isExpense ? "text-destructive" : "text-foreground"}`}>
              {isExpense ? "\u2212" : isIncome ? "+" : ""}
              {symbol}
              {formatMinor(transaction.amount)}
            </p>
          </div>

          <div className="surface mt-6 divide-y divide-border/50 overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <Calendar size={17} className="flex-shrink-0 text-mutedForeground" />
              <span className="flex-1 text-sm text-mutedForeground">Date &amp; time</span>
              <span className="text-right text-sm font-semibold text-foreground">{dateLabel}</span>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Wallet size={17} className="flex-shrink-0 text-mutedForeground" />
              <span className="flex-1 text-sm text-mutedForeground">Account</span>
              <span className="text-right text-sm font-semibold text-foreground">{transaction.account_name ?? "—"}</span>
            </div>
            <div className="flex items-start gap-3 p-4">
              <StickyNote size={17} className="mt-0.5 flex-shrink-0 text-mutedForeground" />
              <span className="flex-1 text-sm text-mutedForeground">Note</span>
              <span className="max-w-[60%] text-right text-sm font-semibold text-foreground">
                {transaction.note || "No note"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => router.push(`/transactions/${transaction.id}/edit`)}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primaryForeground shadow-soft transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <Pencil size={16} /> Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border-thick border-destructive text-sm font-bold text-destructive transition-all duration-300 hover:bg-destructive/10 active:scale-95 disabled:opacity-50"
            >
              <Trash2 size={16} /> {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
