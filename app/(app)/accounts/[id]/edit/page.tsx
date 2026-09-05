import { notFound } from "next/navigation";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { AccountForm, AccountData } from "@/components/AccountForm";

export default async function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { DB } = cf();
  const user = await getSessionUser(DB);
  const account = await DB.prepare("SELECT * FROM accounts WHERE id = ? AND user_id = ?")
    .bind(id, user!.id)
    .first<AccountData>();

  if (!account) notFound();

  return <AccountForm account={account} />;
}
