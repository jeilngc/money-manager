import { Dashboard } from "@/components/Dashboard";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";

export default async function DashboardPage() {
  const { DB } = cf(); const user = await getSessionUser(DB); const now = Date.now(); const week = now - 7 * 86400000;
  const [accountResult, transactionResult, weekly] = await Promise.all([
    DB.prepare("SELECT * FROM accounts WHERE user_id = ? AND archived = 0 ORDER BY sort_order, created_at").bind(user!.id).all(),
    DB.prepare("SELECT t.*, c.name category_name, c.emoji category_emoji, a.name account_name FROM transactions t LEFT JOIN categories c ON c.id=t.category_id LEFT JOIN accounts a ON a.id=t.account_id WHERE t.user_id=? ORDER BY t.occurred_at DESC LIMIT 8").bind(user!.id).all(),
    DB.prepare("SELECT COALESCE(SUM(amount), 0) total FROM transactions WHERE user_id=? AND kind='expense' AND occurred_at >= ?").bind(user!.id, week).first<{total:number}>(),
  ]);
  return <Dashboard firstName={user!.firstName} accounts={accountResult.results as any} transactions={transactionResult.results as any} weeklyExpenses={weekly?.total ?? 0} />;
}
