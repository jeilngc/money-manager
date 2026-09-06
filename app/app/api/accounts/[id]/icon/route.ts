import { NextRequest, NextResponse } from "next/server";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";

// Cloudflare bindings (D1/R2) are only available per-request, never at build time.
export const dynamic = "force-dynamic";

const MAX_SIZE = 2 * 1024 * 1024;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { DB, ICONS } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await DB.prepare("SELECT id FROM accounts WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .first();
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Expected an image upload." }, { status: 400 });
  }

  const buffer = await req.arrayBuffer();
  if (buffer.byteLength > MAX_SIZE) {
    return NextResponse.json({ error: "Image is too large." }, { status: 413 });
  }

  const key = `icons/${user.id}/${id}.webp`;
  await ICONS.put(key, buffer, { httpMetadata: { contentType: "image/webp" } });

  await DB.prepare("UPDATE accounts SET icon_key = ? WHERE id = ?").bind(key, id).run();

  return NextResponse.json({ icon_key: key });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { DB, ICONS } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await DB.prepare("SELECT icon_key FROM accounts WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .first<{ icon_key: string | null }>();
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (account.icon_key) await ICONS.delete(account.icon_key);
  await DB.prepare("UPDATE accounts SET icon_key = NULL WHERE id = ?").bind(id).run();

  return NextResponse.json({ ok: true });
}
