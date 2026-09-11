import { ProfileForm } from "@/components/ProfileForm";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";

export default async function ProfilePage() {
  const { DB } = cf();
  const user = await getSessionUser(DB);

  return <ProfileForm firstName={user!.firstName} lastName={user!.lastName} email={user!.email} />;
}
