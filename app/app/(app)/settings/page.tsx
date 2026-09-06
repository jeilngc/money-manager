import { ProfileForm } from "@/components/ProfileForm";
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
    <>
      <ProfileForm firstName={user!.firstName} lastName={user!.lastName} email={user!.email} />
      <div className="px-5 pt-5 pb-8">
        <CategoryManager initialCategories={(results ?? []) as any} />
      </div>
    </>
  );
}
