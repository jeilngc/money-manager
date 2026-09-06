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
    <div className="px-5 py-8">
      <div className="flex items-center justify-between mb-7">
        <div><p className="text-sm text-mutedForeground">Manage your money</p><h1 className="text-3xl font-bold tracking-tight">Your cards</h1></div>
        <Link
          href="/accounts/new"
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-accent text-accentForeground hover:opacity-90 transition-opacity"
          aria-label="Add account"
        >
          <Plus size={20} strokeWidth={1.5} />
        </Link>
      </div>

      <div className="surface grid grid-cols-3 p-5 mb-5">
        <div>
          <p className="text-xs text-mutedForeground mb-1">Assets</p>
          <p className="text-base font-bold tabular">{currencySymbol("PHP")}{formatMinor(assetTotal)}</p>
        </div>
        <div>
          <p className="text-xs text-mutedForeground mb-1">Liabilities</p>
          <p className="text-base font-bold tabular text-accent">{currencySymbol("PHP")}{formatMinor(liabilityTotal)}</p>
        </div>
        <div>
          <p className="text-xs text-mutedForeground mb-1">Net total</p>
          <p className="text-base font-bold tabular">{currencySymbol("PHP")}{formatMinor(assetTotal - liabilityTotal)}</p>
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
      <p className="text-sm font-semibold text-mutedForeground mb-3 mt-6">{title}</p>
      <ul className="space-y-2">
        {accounts.map((a) => (
          <li key={a.id}>
            <Link
              href={`/accounts/${a.id}/edit`}
              className="surface flex items-center gap-4 p-4 hover:bg-muted transition-colors duration-150"
            >
              <AccountIcon type={a.type as any} accountId={a.id} hasIcon={Boolean(a.icon_key)} size={44} />
              <span className="flex-1 text-base font-semibold">{a.name}</span>
              <span className={`font-semibold tabular ${negative ? "text-accent" : "text-foreground"}`}>
                {currencySymbol(a.currency)}{formatMinor(a.balance)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
