import { NextRequest, NextResponse } from "next/server";
import { cf } from "@/lib/cloudflare";
import { verifyPassword, createSession, sessionCookieOptions } from "@/lib/auth";

// Cloudflare bindings (D1/R2) are only available per-request, never at build time.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json<{ email?: string; password?: string }>();

  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const { DB } = cf();
  const user = await DB.prepare(
    "SELECT id, password_hash, password_salt FROM users WHERE email = ?"
  )
    .bind(email)
    .first<{ id: string; password_hash: string; password_salt: string }>();

  if (!user || !(await verifyPassword(password, user.password_hash, user.password_salt))) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const sessionId = await createSession(DB, user.id);
  const res = NextResponse.json({ id: user.id, email });
  res.cookies.set(sessionCookieOptions().name, sessionId, sessionCookieOptions());
  return res;
}
