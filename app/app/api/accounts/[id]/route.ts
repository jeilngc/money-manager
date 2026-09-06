import { NextRequest, NextResponse } from "next/server";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";

// Cloudflare bindings (D1/R2) are only available per-request, never at build time.
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { DB } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await DB.prepare("SELECT * FROM accounts WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .first();

  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ account });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { DB } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json<{ name?: string; type?: string; group_type?: string; currency?: string }>();

  const existing = await DB.prepare("SELECT id FROM accounts WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .first();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await DB.prepare(
    `UPDATE accounts SET
       name = COALESCE(?, name),
       type = COALESCE(?, type),
       group_type = COALESCE(?, group_type),
       currency = COALESCE(?, currency)
     WHERE id = ? AND user_id = ?`
  )
    .bind(body.name ?? null, body.type ?? null, body.group_type ?? null, body.currency ?? null, id, user.id)
    .run();

  const account = await DB.prepare("SELECT * FROM accounts WHERE id = ?").bind(id).first();
  return NextResponse.json({ account });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { DB } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Archive rather than hard-delete so historical transactions still resolve to a real account.
  await DB.prepare("UPDATE accounts SET archived = 1 WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .run();

  return NextResponse.json({ ok: true });
}
