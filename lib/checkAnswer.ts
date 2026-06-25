import type { Cell, ResultSet } from "@/data/exercises";

function rowKey(row: Cell[]): string {
  return JSON.stringify(row.map((c) => (c === null ? "__NULL__" : c)));
}

function columnsMatch(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((c, i) => c === b[i]);
}

export type CheckResult =
  | { kind: "match" }
  | { kind: "wrong-columns"; expected: string[]; got: string[] }
  | { kind: "wrong-row-count"; expected: number; got: number }
  | { kind: "wrong-rows" };

export function checkAnswer(
  actual: ResultSet,
  expected: ResultSet,
  orderMatters: boolean
): CheckResult {
  if (!columnsMatch(actual.columns, expected.columns)) {
    return { kind: "wrong-columns", expected: expected.columns, got: actual.columns };
  }
  if (actual.rows.length !== expected.rows.length) {
    return { kind: "wrong-row-count", expected: expected.rows.length, got: actual.rows.length };
  }
  if (orderMatters) {
    const same = actual.rows.every((row, i) => rowKey(row) === rowKey(expected.rows[i]));
    return same ? { kind: "match" } : { kind: "wrong-rows" };
  }
  const expectedCounts = new Map<string, number>();
  for (const row of expected.rows) {
    const k = rowKey(row);
    expectedCounts.set(k, (expectedCounts.get(k) ?? 0) + 1);
  }
  for (const row of actual.rows) {
    const k = rowKey(row);
    const c = expectedCounts.get(k);
    if (!c) return { kind: "wrong-rows" };
    if (c === 1) expectedCounts.delete(k);
    else expectedCounts.set(k, c - 1);
  }
  return { kind: "match" };
}
