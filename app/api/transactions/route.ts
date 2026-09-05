import { NextRequest, NextResponse } from "next/server";
import { cf } from "@/lib/cloudflare";
import { getSessionUser } from "@/lib/auth";
import { id, now } from "@/lib/utils";
import { balanceDeltas } from "@/lib/balance";

// Cloudflare bindings (D1/R2) are only available per-request, never at build time.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { DB } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  let query = `
    SELECT t.*, c.name as category_name, c.emoji as category_emoji, c.color as category_color,
           a.name as account_name
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
    LEFT JOIN accounts a ON a.id = t.account_id
    WHERE t.user_id = ?`;
  const binds: (string | number)[] = [user.id];

  if (from) {
    query += " AND t.occurred_at >= ?";
    binds.push(Number(from));
  }
  if (to) {
    query += " AND t.occurred_at <= ?";
    binds.push(Number(to));
  }
  query += " ORDER BY t.occurred_at DESC, t.created_at DESC";

  const { results } = await DB.prepare(query)
    .bind(...binds)
    .all();

  return NextResponse.json({ transactions: results });
}

export async function POST(req: NextRequest) {
  const { DB } = cf();
  const user = await getSessionUser(DB);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json<{
    kind?: "income" | "expense" | "transfer";
    amount?: number;
    account_id?: string;
    category_id?: string | null;
    transfer_to_account_id?: string | null;
    note?: string | null;
    occurred_at?: number;
  }>();

  if (!body.kind || !body.amount || body.amount <= 0 || !body.account_id) {
    return NextResponse.json({ error: "Kind, a positive amount, and an account are required." }, { status: 400 });
  }
  if (body.kind === "transfer" && (!body.transfer_to_account_id || body.transfer_to_account_id === body.account_id)) {
    return NextResponse.json({ error: "Pick a different destination account for the transfer." }, { status: 400 });
  }

  const txId = id();
  const occurredAt = body.occurred_at ?? now();
  const deltas = balanceDeltas({
    kind: body.kind,
    amount: body.amount,
    account_id: body.account_id,
    transfer_to_account_id: body.transfer_to_account_id,
  });

  await DB.batch([
    DB.prepare(
      `INSERT INTO transactions
         (id, user_id, account_id, category_id, kind, amount, note, occurred_at, transfer_to_account_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      txId,
      user.id,
      body.account_id,
      body.category_id ?? null,
      body.kind,
      body.amount,
      body.note ?? null,
      occurredAt,
      body.transfer_to_account_id ?? null,
      now()
    ),
    ...deltas.map((d) =>
      DB.prepare("UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?").bind(
        d.delta,
        d.accountId,
        user.id
      )
    ),
  ]);

  const transaction = await DB.prepare("SELECT * FROM transactions WHERE id = ?").bind(txId).first();
  return NextResponse.json({ transaction });
}
