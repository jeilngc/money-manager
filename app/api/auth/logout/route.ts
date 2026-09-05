import { NextResponse } from "next/server";
import { cf } from "@/lib/cloudflare";
import { deleteSession, sessionCookieOptions } from "@/lib/auth";

// Cloudflare bindings (D1/R2) are only available per-request, never at build time.
export const dynamic = "force-dynamic";

export async function POST() {
  const { DB } = cf();
  await deleteSession(DB);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieOptions().name, "", { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}
