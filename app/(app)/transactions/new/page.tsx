import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { TransactionForm } from "@/components/TransactionForm";

export default async function NewTransactionPage() {
  const { DB } = cf();
  const user = await getSessionUser(DB);

  const [accounts, categories] = await Promise.all([
    DB.prepare("SELECT id, name FROM accounts WHERE user_id = ? AND archived = 0 ORDER BY group_type, sort_order")
      .bind(user!.id)
      .all(),
    DB.prepare("SELECT id, name, emoji, kind FROM categories WHERE user_id = ? ORDER BY kind, sort_order")
      .bind(user!.id)
      .all(),
  ]);

  return (
    <TransactionForm
      accounts={(accounts.results ?? []) as any}
      categories={(categories.results ?? []) as any}
    />
  );
}
