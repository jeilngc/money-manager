export interface TxLike {
  kind: "income" | "expense" | "transfer";
  amount: number;
  account_id: string;
  transfer_to_account_id?: string | null;
}

/** Returns the per-account balance changes a transaction causes. */
export function balanceDeltas(tx: TxLike): Array<{ accountId: string; delta: number }> {
  if (tx.kind === "income") return [{ accountId: tx.account_id, delta: tx.amount }];
  if (tx.kind === "expense") return [{ accountId: tx.account_id, delta: -tx.amount }];
  // transfer
  const deltas = [{ accountId: tx.account_id, delta: -tx.amount }];
  if (tx.transfer_to_account_id) {
    deltas.push({ accountId: tx.transfer_to_account_id, delta: tx.amount });
  }
  return deltas;
}

export function negate(deltas: Array<{ accountId: string; delta: number }>) {
  return deltas.map((d) => ({ ...d, delta: -d.delta }));
}

/** Merges two delta lists (e.g. reversal of old + application of new) into one per-account total. */
export function mergeDeltas(...lists: Array<Array<{ accountId: string; delta: number }>>) {
  const totals = new Map<string, number>();
  for (const list of lists) {
    for (const { accountId, delta } of list) {
      totals.set(accountId, (totals.get(accountId) ?? 0) + delta);
    }
  }
  return Array.from(totals.entries()).map(([accountId, delta]) => ({ accountId, delta }));
}
