"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Database } from "sql.js";
import ExercisePrompt from "@/components/ExercisePrompt";
import SqlEditor from "@/components/SqlEditor";
import ResultsTable from "@/components/ResultsTable";
import FeedbackPanel from "@/components/FeedbackPanel";
import { createSeededDb, runQuery, type RunResult } from "@/lib/db";
import { checkAnswer, type CheckResult } from "@/lib/checkAnswer";
import { EXERCISES, type Exercise } from "@/data/exercises";

export default function ExerciseClient({ exercise }: { exercise: Exercise }) {
  const exerciseNumber = EXERCISES.findIndex((e) => e.slug === exercise.slug) + 1;

  const dbRef = useRef<Database | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [sql, setSql] = useState(exercise.starterSql);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    createSeededDb()
      .then((db) => {
        if (cancelled) {
          db.close();
          return;
        }
        dbRef.current = db;
        setDbReady(true);
      })
      .catch((e) => {
        if (!cancelled) setDbError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
      dbRef.current?.close();
      dbRef.current = null;
    };
  }, []);

  const handleRun = useCallback(() => {
    const db = dbRef.current;
    if (!db) return;
    const result = runQuery(db, sql);
    setRunResult(result);
    if (result.kind === "ok") {
      setCheckResult(checkAnswer(result.result, exercise.expected, exercise.orderMatters));
    } else {
      setCheckResult(null);
    }
  }, [sql, exercise]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-12 sm:py-16">
      <nav>
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500 hover:text-accent"
        >
          ← sql-gym
        </Link>
      </nav>

      <ExercisePrompt exercise={exercise} number={exerciseNumber} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
            Your query
          </h2>
          <button
            onClick={handleRun}
            disabled={!dbReady}
            className="rounded bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {dbReady ? "Run (⌘/Ctrl ⏎)" : "Loading…"}
          </button>
        </div>
        <SqlEditor value={sql} onChange={setSql} onRun={handleRun} />
        {dbError && <p className="text-sm text-red-600">DB failed to load: {dbError}</p>}
      </section>

      {runResult && (
        <section className="space-y-3">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
            Results
          </h2>
          {runResult.kind === "error" && (
            <pre className="overflow-x-auto rounded bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {runResult.message}
            </pre>
          )}
          {runResult.kind === "empty" && (
            <p className="text-sm text-zinc-500">Query produced no result set.</p>
          )}
          {runResult.kind === "ok" && <ResultsTable result={runResult.result} />}
        </section>
      )}

      {runResult && (
        <section className="space-y-3">
          <MatchIndicator
            runResult={runResult}
            checkResult={checkResult}
            exercise={exercise}
          />
          <button
            onClick={() => setShowFeedback((v) => !v)}
            className="rounded border border-zinc-400 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {showFeedback ? "Hide explanation" : "Reveal explanation"}
          </button>
          {showFeedback && <FeedbackPanel exercise={exercise} />}
        </section>
      )}
    </main>
  );
}

function MatchIndicator({
  runResult,
  checkResult,
  exercise,
}: {
  runResult: RunResult;
  checkResult: CheckResult | null;
  exercise: Exercise;
}) {
  if (runResult.kind !== "ok" || !checkResult) return null;

  if (checkResult.kind === "match") {
    if (exercise.matchIsTrap) {
      return (
        <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          ✓ Matches the expected result on SQLite — but this isn't the query you want in production. Reveal the explanation to see why.
        </p>
      );
    }
    return (
      <p className="rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
        ✓ Matches.
      </p>
    );
  }

  let msg: string;
  if (checkResult.kind === "wrong-columns") {
    msg = `Columns don't match. Expected [${checkResult.expected.join(", ")}], got [${checkResult.got.join(", ")}].`;
  } else if (checkResult.kind === "wrong-row-count") {
    msg = `Row count off. Expected ${checkResult.expected}, got ${checkResult.got}.`;
  } else {
    msg = "Columns and row count look right, but the rows don't match expected data.";
  }
  return (
    <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
      ✗ {msg}
    </p>
  );
}
