import { NextRequest, NextResponse } from "next/server";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function PATCH(req: NextRequest) { const { firstName, lastName } = await req.json<{firstName?: string; lastName?: string}>(); if (!firstName?.trim() || !lastName?.trim()) return NextResponse.json({ error: "First and last name are required." }, { status: 400 }); const { DB } = cf(); const user = await getSessionUser(DB); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await DB.prepare("UPDATE users SET first_name=?, last_name=? WHERE id=?").bind(firstName.trim(), lastName.trim(), user.id).run(); return NextResponse.json({ ok: true }); }
