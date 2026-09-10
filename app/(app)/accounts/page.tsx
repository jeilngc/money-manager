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
      <div className="mb-7 flex items-center justify-between">
        <div>
          <p className="text-sm text-mutedForeground">Manage your money</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Your cards</h1>
        </div>
        <Link
          href="/accounts/new"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primaryForeground shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Add account"
        >
          <Plus size={20} strokeWidth={2} />
        </Link>
      </div>

      <div className="surface mb-6 grid grid-cols-3 p-5">
        <div>
          <p className="mb-1 text-xs text-mutedForeground">Assets</p>
          <p className="tabular text-base font-bold text-foreground">{currencySymbol("PHP")}{formatMinor(assetTotal)}</p>
        </div>
        <div>
          <p className="mb-1 text-xs text-mutedForeground">Liabilities</p>
          <p className="tabular text-base font-bold text-secondary">{currencySymbol("PHP")}{formatMinor(liabilityTotal)}</p>
        </div>
        <div>
          <p className="mb-1 text-xs text-mutedForeground">Net total</p>
          <p className="tabular text-base font-bold text-foreground">{currencySymbol("PHP")}{formatMinor(assetTotal - liabilityTotal)}</p>
        </div>
      </div>

      {accounts.length === 0 ? (
        <p className="py-16 text-center text-mutedForeground">
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
      <p className="mb-3 mt-6 text-sm font-bold text-mutedForeground">{title}</p>
      <ul className="space-y-2">
        {accounts.map((a) => (
          <li key={a.id}>
            <Link
              href={`/accounts/${a.id}/edit`}
              className="surface flex items-center gap-4 p-4 transition-all duration-300 ease-crisp hover:-translate-y-0.5 hover:shadow-float"
            >
              <AccountIcon type={a.type as any} accountId={a.id} hasIcon={Boolean(a.icon_key)} size={44} />
              <span className="flex-1 text-base font-bold text-foreground">{a.name}</span>
              <span className={`tabular font-bold ${negative ? "text-secondary" : "text-foreground"}`}>
                {currencySymbol(a.currency)}{formatMinor(a.balance)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
