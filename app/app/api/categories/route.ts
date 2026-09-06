import { NextRequest, NextResponse } from "next/server";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { id } from "@/lib/utils";

// Cloudflare bindings (D1/R2) are only available per-request, never at build time.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { DB } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kind = req.nextUrl.searchParams.get("kind");
  const query = kind
    ? DB.prepare("SELECT * FROM categories WHERE user_id = ? AND kind = ? ORDER BY sort_order").bind(user.id, kind)
    : DB.prepare("SELECT * FROM categories WHERE user_id = ? ORDER BY kind, sort_order").bind(user.id);

  const { results } = await query.all();
  return NextResponse.json({ categories: results });
}

export async function POST(req: NextRequest) {
  const { DB } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json<{ name?: string; emoji?: string; kind?: string; color?: string }>();
  if (!body.name || !body.kind) {
    return NextResponse.json({ error: "Name and kind are required." }, { status: 400 });
  }

  const categoryId = id();
  await DB.prepare(
    "INSERT INTO categories (id, user_id, name, emoji, kind, color, sort_order) VALUES (?, ?, ?, ?, ?, ?, 999)"
  )
    .bind(categoryId, user.id, body.name, body.emoji ?? "\u{1F4CC}", body.kind, body.color ?? "#FF3D00")
    .run();

  const category = await DB.prepare("SELECT * FROM categories WHERE id = ?").bind(categoryId).first();
  return NextResponse.json({ category });
}
