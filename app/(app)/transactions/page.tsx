import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { currencySymbol, formatMinor, formatMonthLabel, startOfMonth, endOfMonth } from "@/lib/utils";

interface TxRow {
  id: string;
  kind: "income" | "expense" | "transfer";
  amount: number;
  note: string | null;
  occurred_at: number;
  category_name: string | null;
  category_emoji: string | null;
  account_name: string | null;
}

function parseMonthParam(month?: string): Date {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    return new Date(y, m - 1, 1);
  }
  return startOfMonth(new Date());
}

function monthParam(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dayLabel(ms: number) {
  return new Date(ms).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const { DB } = cf();
  const user = await getSessionUser(DB);

  const current = parseMonthParam(month);
  const from = startOfMonth(current).getTime();
  const to = endOfMonth(current).getTime();
  const prev = new Date(current.getFullYear(), current.getMonth() - 1, 1);
  const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);

  const { results } = await DB.prepare(
    `SELECT t.*, c.name as category_name, c.emoji as category_emoji, a.name as account_name
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     LEFT JOIN accounts a ON a.id = t.account_id
     WHERE t.user_id = ? AND t.occurred_at BETWEEN ? AND ?
     ORDER BY t.occurred_at DESC, t.created_at DESC`
  )
    .bind(user!.id, from, to)
    .all<TxRow>();

  const transactions = results ?? [];
  const income = transactions.filter((t) => t.kind === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.kind === "expense").reduce((s, t) => s + t.amount, 0);

  const groups = new Map<string, TxRow[]>();
  for (const t of transactions) {
    const key = dayLabel(t.occurred_at);
    groups.set(key, [...(groups.get(key) ?? []), t]);
  }

  return (
    <div className="px-6 md:px-16 py-10 relative min-h-[70vh]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/transactions?month=${monthParam(prev)}`} className="p-1 text-mutedForeground hover:text-foreground">
            <ChevronLeft size={20} strokeWidth={1.5} />
          </Link>
          <h1 className="text-xl font-semibold tracking-tight w-32">{formatMonthLabel(current)}</h1>
          <Link href={`/transactions?month=${monthParam(next)}`} className="p-1 text-mutedForeground hover:text-foreground">
            <ChevronRight size={20} strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-b border-border py-6 mb-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-mutedForeground mb-1">Income</p>
          <p className="font-mono text-lg tabular">{currencySymbol("PHP")}{formatMinor(income)}</p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-mutedForeground mb-1">Expenses</p>
          <p className="font-mono text-lg tabular text-accent">{currencySymbol("PHP")}{formatMinor(expenses)}</p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-mutedForeground mb-1">Total</p>
          <p className="font-mono text-lg tabular">{currencySymbol("PHP")}{formatMinor(income - expenses)}</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="text-mutedForeground py-16 text-center">No transactions this month yet.</p>
      ) : (
        Array.from(groups.entries()).map(([day, rows]) => (
          <div key={day} className="mb-6">
            <p className="font-mono text-xs uppercase tracking-widest text-mutedForeground mb-2">{day}</p>
            <ul className="border-t border-border">
              {rows.map((t) => (
                <li key={t.id} className="flex items-center gap-4 py-4 border-b border-border">
                  <span className="text-2xl w-8 text-center">{t.category_emoji ?? (t.kind === "transfer" ? "\u21C4" : "\u2022")}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{t.category_name ?? (t.kind === "transfer" ? "Transfer" : "Uncategorized")}</p>
                    <p className="text-sm text-mutedForeground truncate">{t.note || t.account_name}</p>
                  </div>
                  <span className={`font-mono tabular ${t.kind === "income" ? "text-foreground" : t.kind === "expense" ? "text-accent" : "text-mutedForeground"}`}>
                    {t.kind === "expense" ? "\u2212" : t.kind === "income" ? "+" : ""}
                    {currencySymbol("PHP")}{formatMinor(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      <Link
        href="/transactions/new"
        className="fixed bottom-24 right-6 md:right-16 w-14 h-14 bg-accent text-accentForeground flex items-center justify-center shadow-none hover:opacity-90 transition-opacity duration-150"
        aria-label="Add transaction"
      >
        <Plus size={26} strokeWidth={1.75} />
      </Link>
    </div>
  );
}
