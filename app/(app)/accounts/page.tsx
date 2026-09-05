import Link from "next/link";
import { Plus } from "lucide-react";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { AccountIcon } from "@/components/AccountIcon";
import { currencySymbol, formatMinor } from "@/lib/utils";

interface AccountRow {
  id: string;
  name: string;
  type: string;
  group_type: "asset" | "liability";
  currency: string;
  balance: number;
  icon_key: string | null;
}

export default async function AccountsPage() {
  const { DB } = cf();
  const user = await getSessionUser(DB);
  const { results } = await DB.prepare(
    "SELECT * FROM accounts WHERE user_id = ? AND archived = 0 ORDER BY group_type, sort_order, created_at"
  )
    .bind(user!.id)
    .all<AccountRow>();

  const accounts = results ?? [];
  const assets = accounts.filter((a) => a.group_type === "asset");
  const liabilities = accounts.filter((a) => a.group_type === "liability");
  const assetTotal = assets.reduce((sum, a) => sum + a.balance, 0);
  const liabilityTotal = liabilities.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="px-6 md:px-16 py-10">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">Accounts</h1>
        <Link
          href="/accounts/new"
          className="w-11 h-11 flex items-center justify-center border border-foreground hover:bg-foreground hover:text-background transition-colors duration-150"
          aria-label="Add account"
        >
          <Plus size={20} strokeWidth={1.5} />
        </Link>
      </div>

      <div className="grid grid-cols-3 border-t border-b border-border py-6 mb-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-mutedForeground mb-1">Assets</p>
          <p className="font-mono text-lg tabular">{currencySymbol("PHP")}{formatMinor(assetTotal)}</p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-mutedForeground mb-1">Liabilities</p>
          <p className="font-mono text-lg tabular text-accent">{currencySymbol("PHP")}{formatMinor(liabilityTotal)}</p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-mutedForeground mb-1">Total</p>
          <p className="font-mono text-lg tabular">{currencySymbol("PHP")}{formatMinor(assetTotal - liabilityTotal)}</p>
        </div>
      </div>

      {accounts.length === 0 ? (
        <p className="text-mutedForeground py-16 text-center">
          No accounts yet. Add your first one to start tracking balances.
        </p>
      ) : (
        <>
          {assets.length > 0 && <AccountGroup title="Assets" accounts={assets} />}
          {liabilities.length > 0 && <AccountGroup title="Liabilities" accounts={liabilities} negative />}
        </>
      )}
    </div>
  );
}

function AccountGroup({ title, accounts, negative }: { title: string; accounts: AccountRow[]; negative?: boolean }) {
  return (
    <div className="mb-8">
      <p className="font-mono text-xs uppercase tracking-widest text-mutedForeground mb-3 mt-6">{title}</p>
      <ul className="border-t border-border">
        {accounts.map((a) => (
          <li key={a.id} className="border-b border-border">
            <Link
              href={`/accounts/${a.id}/edit`}
              className="flex items-center gap-4 py-4 hover:bg-muted transition-colors duration-150"
            >
              <AccountIcon type={a.type as any} accountId={a.id} hasIcon={Boolean(a.icon_key)} size={44} />
              <span className="flex-1 text-base">{a.name}</span>
              <span className={`font-mono tabular ${negative ? "text-accent" : "text-foreground"}`}>
                {currencySymbol(a.currency)}{formatMinor(a.balance)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
