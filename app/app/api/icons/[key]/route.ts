import { NextRequest, NextResponse } from "next/server";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";

// Cloudflare bindings (D1/R2) are only available per-request, never at build time.
export const dynamic = "force-dynamic";

// key is the account id — the actual R2 key is icons/{user_id}/{account_id}.webp,
// scoped to the logged-in user so people can't guess each other's icon URLs.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const { DB, ICONS } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const object = await ICONS.get(`icons/${user.id}/${key}.webp`);
  if (!object) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(object.body as unknown as ReadableStream, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
