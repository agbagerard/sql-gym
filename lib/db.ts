import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import { SCHEMA_SQL } from "@/data/schemas";
import type { Cell, ResultSet } from "@/data/exercises";

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

async function fetchWasm(): Promise<ArrayBuffer> {
  const res = await fetch("/sql-wasm.wasm");
  if (!res.ok) {
    throw new Error(`Failed to fetch /sql-wasm.wasm: ${res.status} ${res.statusText}`);
  }
  return res.arrayBuffer();
}

function loadSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    sqlJsPromise = fetchWasm().then((wasmBinary) => initSqlJs({ wasmBinary }));
  }
  return sqlJsPromise;
}

export async function createSeededDb(): Promise<Database> {
  const SQL = await loadSqlJs();
  const db = new SQL.Database();
  db.run(SCHEMA_SQL);
  return db;
}

export type RunResult =
  | { kind: "ok"; result: ResultSet }
  | { kind: "empty" }
  | { kind: "error"; message: string };

export function runQuery(db: Database, sql: string): RunResult {
  try {
    const results = db.exec(sql);
    if (results.length === 0) return { kind: "empty" };
    const last = results[results.length - 1];
    return {
      kind: "ok",
      result: {
        columns: last.columns,
        rows: last.values.map((row) =>
          row.map((cell): Cell => {
            if (cell === null) return null;
            if (typeof cell === "number" || typeof cell === "string") return cell;
            return String(cell);
          })
        ),
      },
    };
  } catch (e) {
    return { kind: "error", message: e instanceof Error ? e.message : String(e) };
  }
}
