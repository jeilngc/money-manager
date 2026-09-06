"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { IconUpload } from "@/components/IconUpload";
import { AccountIcon } from "@/components/AccountIcon";
import { formatMinor, toMinor } from "@/lib/utils";

const TYPES = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
  { value: "ewallet", label: "E-Wallet" },
  { value: "card", label: "Card" },
  { value: "savings", label: "Savings" },
  { value: "other", label: "Other" },
] as const;

export interface AccountData {
  id: string;
  name: string;
  type: string;
  group_type: "asset" | "liability";
  currency: string;
  balance: number;
  icon_key: string | null;
}

export function AccountForm({ account }: { account?: AccountData }) {
  const router = useRouter();
  const isEdit = Boolean(account);

  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<string>(account?.type ?? "cash");
  const [groupType, setGroupType] = useState<"asset" | "liability">(account?.group_type ?? "asset");
  const [balance, setBalance] = useState(account ? formatMinor(account.balance) : "0.00");
  const [iconBlob, setIconBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Give the account a name.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        group_type: groupType,
        currency: "PHP",
        balance: toMinor(balance),
      };

      const res = await fetch(isEdit ? `/api/accounts/${account!.id}` : "/api/accounts", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json<{ account?: { id: string }; error?: string }>();
      if (!res.ok || !data.account) {
        setError(data.error ?? "Couldn't save the account.");
        return;
      }

      if (iconBlob) {
        await fetch(`/api/accounts/${data.account.id}/icon`, {
          method: "POST",
          headers: { "Content-Type": "image/webp" },
          body: iconBlob,
        });
      }

      router.push("/accounts");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!account) return;
    if (!confirm(`Remove ${account.name}? Its past transactions will stay on record.`)) return;
    await fetch(`/api/accounts/${account.id}`, { method: "DELETE" });
    router.push("/accounts");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 md:px-16 py-10 max-w-lg">
      <h1 className="text-4xl font-semibold tracking-tight mb-10">
        {isEdit ? "Edit account" : "New account"}
      </h1>

      <div className="mb-8">
        <Label>Icon</Label>
        {previewUrl ? (
          <IconUpload previewUrl={previewUrl} onChange={(blob, url) => { setIconBlob(blob); setPreviewUrl(url); }} />
        ) : isEdit && account?.icon_key ? (
          <div className="flex items-center gap-4">
            <AccountIcon type={type as any} accountId={account.id} hasIcon size={64} />
            <IconUpload onChange={(blob, url) => { setIconBlob(blob); setPreviewUrl(url); }} />
          </div>
        ) : (
          <IconUpload onChange={(blob, url) => { setIconBlob(blob); setPreviewUrl(url); }} />
        )}
      </div>

      <div className="mb-6">
        <Label htmlFor="name">Name</Label>
        <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gcash" />
      </div>

      <div className="mb-6">
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full h-12 md:h-14 bg-input border border-border text-foreground px-4 focus:border-accent focus:outline-none"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <Label>Classification</Label>
        <div className="flex gap-3">
          {(["asset", "liability"] as const).map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => setGroupType(g)}
              className={`flex-1 h-12 border text-sm uppercase tracking-wider transition-colors duration-150 ${
                groupType === g ? "border-accent text-accent" : "border-border text-mutedForeground"
              }`}
            >
              {g === "asset" ? "Asset" : "Liability"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <Label htmlFor="balance">{isEdit ? "Current balance" : "Starting balance"}</Label>
        <Input
          id="balance"
          inputMode="decimal"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <FieldError>{error}</FieldError>

      <div className="flex items-center gap-6 mt-10">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving\u2026" : isEdit ? "Save changes" : "Create account"}
        </Button>
        {isEdit && (
          <Button type="button" variant="ghost" onClick={handleDelete}>
            Remove
          </Button>
        )}
      </div>
    </form>
  );
}
