"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { toMinor, formatMinor } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
}
interface Category {
  id: string;
  name: string;
  emoji: string;
  kind: "income" | "expense";
}
interface ExistingTransaction {
  id: string;
  kind: "income" | "expense" | "transfer";
  amount: number;
  account_id: string;
  transfer_to_account_id: string | null;
  category_id: string | null;
  note: string | null;
  occurred_at: number;
}

export function TransactionForm({
  accounts,
  categories,
  initialKind = "expense",
  transaction,
}: {
  accounts: Account[];
  categories: Category[];
  initialKind?: "expense" | "income" | "transfer";
  transaction?: ExistingTransaction;
}) {
  const router = useRouter();
  const isEdit = Boolean(transaction);
  const [kind, setKind] = useState<"expense" | "income" | "transfer">(transaction?.kind ?? initialKind);
  const [amount, setAmount] = useState(transaction ? formatMinor(transaction.amount) : "");
  const [accountId, setAccountId] = useState(transaction?.account_id ?? accounts[0]?.id ?? "");
  const [toAccountId, setToAccountId] = useState(
    transaction?.transfer_to_account_id ?? accounts[1]?.id ?? accounts[0]?.id ?? ""
  );
  const [categoryId, setCategoryId] = useState<string>(transaction?.category_id ?? "");
  const [note, setNote] = useState(transaction?.note ?? "");
  const [date, setDate] = useState(() =>
    transaction ? new Date(transaction.occurred_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const visibleCategories = categories.filter((c) => c.kind === kind);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const minor = toMinor(amount);
    if (minor <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/transactions/${transaction!.id}` : "/api/transactions", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          amount: minor,
          account_id: accountId,
          transfer_to_account_id: kind === "transfer" ? toAccountId : null,
          category_id: kind === "transfer" ? null : categoryId || null,
          note: note || null,
          occurred_at: new Date(date + "T12:00:00").getTime(),
        }),
      });
      const data = await res.json<{ error?: string }>();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save the transaction.");
        return;
      }
      router.push("/transactions");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!transaction) return;
    if (!confirm("Delete this transaction? This can't be undone.")) return;
    await fetch(`/api/transactions/${transaction.id}`, { method: "DELETE" });
    router.push("/transactions");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 md:px-16 py-10 max-w-lg">
      <h1 className="text-4xl font-semibold tracking-tight mb-10">{isEdit ? "Edit transaction" : "New transaction"}</h1>

      <div className="mb-8 flex gap-3">
        {(["expense", "income", "transfer"] as const).map((k) => (
          <button
            type="button"
            key={k}
            onClick={() => setKind(k)}
            className={`flex-1 h-12 border text-sm uppercase tracking-wider transition-colors duration-150 ${
              kind === k ? "border-primary text-primary" : "border-border text-mutedForeground"
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          inputMode="decimal"
          autoFocus
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="mb-6">
        <Label htmlFor="account">{kind === "transfer" ? "From account" : "Account"}</Label>
        <select
          id="account"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="w-full h-12 md:h-14 rounded-2xl bg-input border border-border text-foreground px-4 focus:border-primary focus:outline-none"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {kind === "transfer" ? (
        <div className="mb-6">
          <Label htmlFor="toAccount">To account</Label>
          <select
            id="toAccount"
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            className="w-full h-12 md:h-14 rounded-2xl bg-input border border-border text-foreground px-4 focus:border-primary focus:outline-none"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="mb-6">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full h-12 md:h-14 rounded-2xl bg-input border border-border text-foreground px-4 focus:border-primary focus:outline-none"
          >
            <option value="">Uncategorized</option>
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-6">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="mb-6">
        <Label htmlFor="note">Note</Label>
        <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
      </div>

      <FieldError>{error}</FieldError>

      <Button type="submit" disabled={loading || !accountId} className="mt-6 w-full">
        {loading ? "Saving\u2026" : isEdit ? "Save changes" : "Save transaction"}
      </Button>

      {isEdit && (
        <button type="button" onClick={handleDelete} className="mt-4 block text-sm font-bold text-destructive">
          Delete transaction
        </button>
      )}
    </form>
  );
}
