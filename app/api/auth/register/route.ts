import { NextRequest, NextResponse } from "next/server";
import { cf } from "@/lib/cloudflare";
import { hashPassword, createSession, sessionCookieOptions } from "@/lib/auth";
import { id, now } from "@/lib/utils";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/lib/defaultCategories";

// Cloudflare bindings (D1/R2) are only available per-request, never at build time.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json<{ email?: string; password?: string }>();

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Enter an email and a password of at least 8 characters." },
      { status: 400 }
    );
  }

  const { DB } = cf();

  const existing = await DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const userId = id();
  const { hash, salt } = await hashPassword(password);

  await DB.prepare(
    "INSERT INTO users (id, email, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(userId, email, hash, salt, now())
    .run();

  // Seed default categories so the app isn't empty on first login.
  const seed = DB.batch(
    [
      ...DEFAULT_EXPENSE_CATEGORIES.map((c, i) =>
        DB.prepare(
          "INSERT INTO categories (id, user_id, name, emoji, kind, color, sort_order) VALUES (?, ?, ?, ?, 'expense', ?, ?)"
        ).bind(id(), userId, c.name, c.emoji, c.color, i)
      ),
      ...DEFAULT_INCOME_CATEGORIES.map((c, i) =>
        DB.prepare(
          "INSERT INTO categories (id, user_id, name, emoji, kind, color, sort_order) VALUES (?, ?, ?, ?, 'income', ?, ?)"
        ).bind(id(), userId, c.name, c.emoji, c.color, i)
      ),
    ]
  );
  await seed;

  const sessionId = await createSession(DB, userId);
  const res = NextResponse.json({ id: userId, email });
  res.cookies.set(sessionCookieOptions().name, sessionId, sessionCookieOptions());
  return res;
}
