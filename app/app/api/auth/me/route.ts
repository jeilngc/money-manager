import { NextResponse } from "next/server";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";

// Cloudflare bindings (D1/R2) are only available per-request, never at build time.
export const dynamic = "force-dynamic";

export async function GET() {
  const { DB } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}
