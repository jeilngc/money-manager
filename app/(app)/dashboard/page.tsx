import { Dashboard } from "@/components/Dashboard";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";

interface AccountRow {
  balance: number;
  group_type: "asset" | "liability";
}

export default async function DashboardPage() {
  const { DB } = cf();
  const user = await getSessionUser(DB);
  const now = Date.now();
  const week = now - 7 * 86400000;
  const historyWindow = now - 370 * 86400000;

  const [accountResult, transactionResult, weekly, historyResult] = await Promise.all([
    DB.prepare("SELECT * FROM accounts WHERE user_id = ? AND archived = 0 ORDER BY sort_order, created_at").bind(user!.id).all(),
    DB.prepare(
      "SELECT t.*, c.name category_name, c.emoji category_emoji, a.name account_name FROM transactions t LEFT JOIN categories c ON c.id=t.category_id LEFT JOIN accounts a ON a.id=t.account_id WHERE t.user_id=? ORDER BY t.occurred_at DESC LIMIT 8"
    )
      .bind(user!.id)
      .all(),
    DB.prepare("SELECT COALESCE(SUM(amount), 0) total FROM transactions WHERE user_id=? AND kind='expense' AND occurred_at >= ?")
      .bind(user!.id, week)
      .first<{ total: number }>(),
    // Only income/expense drive net worth — transfers between the user's own
    // accounts net to zero, so they're excluded here.
    DB.prepare("SELECT kind, amount, occurred_at FROM transactions WHERE user_id = ? AND kind IN ('income','expense') AND occurred_at >= ? ORDER BY occurred_at ASC")
      .bind(user!.id, historyWindow)
      .all(),
  ]);

  const accounts = (accountResult.results ?? []) as AccountRow[];
  const netWorth = accounts.reduce((sum, a) => sum + (a.group_type === "liability" ? -a.balance : a.balance), 0);

  return (
    <Dashboard
      firstName={user!.firstName}
      accounts={accountResult.results as any}
      transactions={transactionResult.results as any}
      weeklyExpenses={weekly?.total ?? 0}
      netWorth={netWorth}
      history={(historyResult.results ?? []) as any}
    />
  );
}
