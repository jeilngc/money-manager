import { redirect } from "next/navigation";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { BottomNav } from "@/components/BottomNav";

// Cloudflare bindings (D1/R2) are only available per-request, so every page
// under this layout must render dynamically — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { DB } = cf();
  const user = await getSessionUser(DB);
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-container mx-auto">{children}</div>
      <BottomNav />
    </div>
  );
}
