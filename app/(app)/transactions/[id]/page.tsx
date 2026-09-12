import { notFound } from "next/navigation";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { TransactionForm } from "@/components/TransactionForm";

interface TxRow {
  id: string;
  kind: "income" | "expense" | "transfer";
  amount: number;
  account_id: string;
  transfer_to_account_id: string | null;
  category_id: string | null;
  note: string | null;
  occurred_at: number;
}

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { DB } = cf();
  const user = await getSessionUser(DB);

  const [transaction, accounts, categories] = await Promise.all([
    DB.prepare(
      "SELECT id, kind, amount, account_id, transfer_to_account_id, category_id, note, occurred_at FROM transactions WHERE id = ? AND user_id = ?"
    )
      .bind(id, user!.id)
      .first<TxRow>(),
    DB.prepare("SELECT id, name FROM accounts WHERE user_id = ? AND archived = 0 ORDER BY group_type, sort_order")
      .bind(user!.id)
      .all(),
    DB.prepare("SELECT id, name, emoji, kind FROM categories WHERE user_id = ? ORDER BY kind, sort_order")
      .bind(user!.id)
      .all(),
  ]);

  if (!transaction) notFound();

  return (
    <TransactionForm
      accounts={(accounts.results ?? []) as any}
      categories={(categories.results ?? []) as any}
      transaction={transaction}
    />
  );
}
