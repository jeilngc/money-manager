import { NextRequest, NextResponse } from "next/server";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { id, now } from "@/lib/utils";

// Cloudflare bindings (D1/R2) are only available per-request, never at build time.
export const dynamic = "force-dynamic";

export async function GET() {
  const { DB } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { results } = await DB.prepare(
    "SELECT * FROM accounts WHERE user_id = ? AND archived = 0 ORDER BY group_type, sort_order, created_at"
  )
    .bind(user.id)
    .all();

  return NextResponse.json({ accounts: results });
}

export async function POST(req: NextRequest) {
  const { DB } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json<{
    name?: string;
    type?: string;
    group_type?: string;
    currency?: string;
    balance?: number;
  }>();

  if (!body.name || !body.type || !body.group_type) {
    return NextResponse.json({ error: "Name, type, and group are required." }, { status: 400 });
  }

  const accountId = id();
  await DB.prepare(
    `INSERT INTO accounts (id, user_id, name, type, group_type, currency, balance, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`
  )
    .bind(
      accountId,
      user.id,
      body.name,
      body.type,
      body.group_type,
      body.currency ?? "PHP",
      body.balance ?? 0,
      now()
    )
    .run();

  const account = await DB.prepare("SELECT * FROM accounts WHERE id = ?").bind(accountId).first();
  return NextResponse.json({ account });
}
