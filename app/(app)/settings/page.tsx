import { SettingsPreferences } from "@/components/SettingsPreferences";
import { CategoryManager } from "@/components/CategoryManager";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";

export default async function SettingsPage() {
  const { DB } = cf();
  const user = await getSessionUser(DB);
  const { results } = await DB.prepare(
    "SELECT id, name, emoji, color, kind FROM categories WHERE user_id = ? ORDER BY kind, sort_order"
  )
    .bind(user!.id)
    .all();

  return (
    <main className="px-5 pb-8 pt-8">
      <header className="mb-7">
        <p className="text-sm text-mutedForeground">Customize Ledger</p>
        <h1 className="font-display text-3xl font-semibold text-foreground">Settings</h1>
      </header>
      <SettingsPreferences />
      <CategoryManager initialCategories={(results ?? []) as any} />
    </main>
  );
}
