import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { PieChart } from "@/components/PieChart";
import { StatsBreakdown } from "@/components/StatsBreakdown";
import { currencySymbol, formatMinor, formatMonthLabel, startOfMonth, endOfMonth } from "@/lib/utils";

interface CategoryTotal {
  category_id: string | null;
  name: string | null;
  emoji: string | null;
  color: string | null;
  total: number;
}

// Warm, muted categorical palette — shared with StatsBreakdown/PieChart so a
// category without its own saved color always renders identically everywhere.
const FALLBACK_COLORS = [
  "#8FA47D", "#C18C5D", "#C9A66B", "#5D7052", "#A6927C", "#B98B7B", "#9C9C8A", "#8C6A4E",
];

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

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; kind?: string }>;
}) {
  const { month, kind: kindParam } = await searchParams;
  const { DB } = cf();
  const user = await getSessionUser(DB);

  const current = parseMonthParam(month);
  const kind = kindParam === "income" ? "income" : "expense";
  const from = startOfMonth(current).getTime();
  const to = endOfMonth(current).getTime();
  const prev = new Date(current.getFullYear(), current.getMonth() - 1, 1);
  const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);

  const [categoryResult, totalsResult] = await Promise.all([
    DB.prepare(
      `SELECT t.category_id as category_id, c.name as name, c.emoji as emoji, c.color as color, SUM(t.amount) as total
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = ? AND t.kind = ? AND t.occurred_at BETWEEN ? AND ?
       GROUP BY t.category_id
       ORDER BY total DESC`
    )
      .bind(user!.id, kind, from, to)
      .all<CategoryTotal>(),
    DB.prepare(
      `SELECT kind, COALESCE(SUM(amount), 0) as total FROM transactions
       WHERE user_id = ? AND kind IN ('income','expense') AND occurred_at BETWEEN ? AND ?
       GROUP BY kind`
    )
      .bind(user!.id, from, to)
      .all<{ kind: string; total: number }>(),
  ]);

  const rows = categoryResult.results ?? [];
  const kindTotal = rows.reduce((s, r) => s + r.total, 0);

  const totalsByKind: Record<"income" | "expense", number> = { income: 0, expense: 0 };
  for (const row of totalsResult.results ?? []) {
    if (row.kind === "income" || row.kind === "expense") totalsByKind[row.kind] = row.total;
  }

  const slices = rows.map((r, i) => ({
    label: r.name ?? "Uncategorized",
    value: r.total,
    color: r.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    emoji: r.emoji ?? "\u{1F4CC}",
  }));

  return (
    <div className="px-6 md:px-16 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/stats?month=${monthParam(prev)}&kind=${kind}`} className="p-1 text-mutedForeground hover:text-foreground">
          <ChevronLeft size={20} strokeWidth={1.5} />
        </Link>
        <h1 className="text-xl font-semibold tracking-tight w-32">{formatMonthLabel(current)}</h1>
        <Link href={`/stats?month=${monthParam(next)}&kind=${kind}`} className="p-1 text-mutedForeground hover:text-foreground">
          <ChevronRight size={20} strokeWidth={1.5} />
        </Link>
      </div>

      <div className="flex border-t border-b border-border mb-10">
        {(["income", "expense"] as const).map((k) => (
          <Link
            key={k}
            href={`/stats?month=${monthParam(current)}&kind=${k}`}
            className={`flex-1 py-4 text-center border-b-2 -mb-px transition-colors duration-300 ${
              kind === k ? "border-primary text-foreground" : "border-transparent text-mutedForeground"
            }`}
          >
            <span className="font-mono text-xs uppercase tracking-widest">{k === "income" ? "Income" : "Expenses"}</span>
            <span className="block font-mono text-lg tabular mt-1">
              {currencySymbol("PHP")}{formatMinor(totalsByKind[k])}
            </span>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-mutedForeground py-16 text-center">No {kind} recorded this month.</p>
      ) : (
        <>
          <div className="flex justify-center mb-10">
            <PieChart data={slices} />
          </div>

          <StatsBreakdown rows={rows} kind={kind} kindTotal={kindTotal} from={from} to={to} />
        </>
      )}
    </div>
  );
}
