import { NextRequest, NextResponse } from "next/server";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";

// Cloudflare bindings (D1/R2) are only available per-request, never at build time.
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { DB } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await DB.prepare("SELECT id FROM categories WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .first();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json<{ name?: string; emoji?: string; color?: string }>();
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name can't be empty." }, { status: 400 });
  }

  await DB.prepare("UPDATE categories SET name = ?, emoji = COALESCE(?, emoji), color = COALESCE(?, color) WHERE id = ?")
    .bind(body.name.trim(), body.emoji ?? null, body.color ?? null, id)
    .run();

  const category = await DB.prepare("SELECT * FROM categories WHERE id = ?").bind(id).first();
  return NextResponse.json({ category });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { DB } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await DB.prepare("SELECT id, name FROM categories WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .first<{ id: string; name: string }>();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const usage = await DB.prepare("SELECT COUNT(*) as count FROM transactions WHERE category_id = ?")
    .bind(id)
    .first<{ count: number }>();
  const count = usage?.count ?? 0;

  const confirmed = req.nextUrl.searchParams.get("confirm") === "true";
  if (count > 0 && !confirmed) {
    return NextResponse.json(
      { needsConfirmation: true, count, name: existing.name },
      { status: 409 }
    );
  }

  // Transactions keep their category_id -> NULL via the FK's ON DELETE SET NULL,
  // so past transactions survive and just show as Uncategorized.
  await DB.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();

  return NextResponse.json({ ok: true, reassigned: count });
}
