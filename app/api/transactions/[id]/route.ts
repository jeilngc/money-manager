import { NextRequest, NextResponse } from "next/server";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { balanceDeltas, mergeDeltas, negate } from "@/lib/balance";

// Cloudflare bindings (D1/R2) are only available per-request, never at build time.
export const dynamic = "force-dynamic";

interface TxRow {
  id: string;
  account_id: string;
  category_id: string | null;
  kind: "income" | "expense" | "transfer";
  amount: number;
  note: string | null;
  occurred_at: number;
  transfer_to_account_id: string | null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { DB } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await DB.prepare("SELECT * FROM transactions WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .first<TxRow>();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json<Partial<TxRow>>();
  const updated: TxRow = {
    ...existing,
    ...body,
    id: existing.id,
  };

  const reversal = negate(balanceDeltas(existing));
  const application = balanceDeltas(updated);
  const netDeltas = mergeDeltas(reversal, application);

  await DB.batch([
    DB.prepare(
      `UPDATE transactions SET
         account_id = ?, category_id = ?, kind = ?, amount = ?, note = ?, occurred_at = ?, transfer_to_account_id = ?
       WHERE id = ?`
    ).bind(
      updated.account_id,
      updated.category_id,
      updated.kind,
      updated.amount,
      updated.note,
      updated.occurred_at,
      updated.transfer_to_account_id,
      updated.id
    ),
    ...netDeltas
      .filter((d) => d.delta !== 0)
      .map((d) =>
        DB.prepare("UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?").bind(
          d.delta,
          d.accountId,
          user.id
        )
      ),
  ]);

  const transaction = await DB.prepare("SELECT * FROM transactions WHERE id = ?").bind(id).first();
  return NextResponse.json({ transaction });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { DB } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await DB.prepare("SELECT * FROM transactions WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .first<TxRow>();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const reversal = negate(balanceDeltas(existing));

  await DB.batch([
    DB.prepare("DELETE FROM transactions WHERE id = ?").bind(id),
    ...reversal.map((d) =>
      DB.prepare("UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?").bind(
        d.delta,
        d.accountId,
        user.id
      )
    ),
  ]);

  return NextResponse.json({ ok: true });
}
