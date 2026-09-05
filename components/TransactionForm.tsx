"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { toMinor } from "@/lib/utils";

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

export function TransactionForm({ accounts, categories }: { accounts: Account[]; categories: Category[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<"expense" | "income" | "transfer">("expense");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id ?? accounts[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState<string>("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
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
      const res = await fetch("/api/transactions", {
        method: "POST",
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

  return (
    <form onSubmit={handleSubmit} className="px-6 md:px-16 py-10 max-w-lg">
      <h1 className="text-4xl font-semibold tracking-tight mb-10">New transaction</h1>

      <div className="mb-8 flex gap-3">
        {(["expense", "income", "transfer"] as const).map((k) => (
          <button
            type="button"
            key={k}
            onClick={() => setKind(k)}
            className={`flex-1 h-12 border text-sm uppercase tracking-wider transition-colors duration-150 ${
              kind === k ? "border-accent text-accent" : "border-border text-mutedForeground"
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
          className="w-full h-12 md:h-14 bg-input border border-border text-foreground px-4 focus:border-accent focus:outline-none"
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
            className="w-full h-12 md:h-14 bg-input border border-border text-foreground px-4 focus:border-accent focus:outline-none"
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
            className="w-full h-12 md:h-14 bg-input border border-border text-foreground px-4 focus:border-accent focus:outline-none"
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

      <Button type="submit" disabled={loading || !accountId} className="mt-6">
        {loading ? "Saving\u2026" : "Save transaction"}
      </Button>
    </form>
  );
}
