import Link from "next/link";
import { EXERCISES } from "@/data/exercises";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-20 px-6 py-20 sm:py-28">
      <header className="space-y-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          sql-gym
        </p>
        <h1 className="font-display text-[2.75rem] font-medium leading-[1.05] tracking-tight sm:text-6xl">
          Six SQL exercises where the{" "}
          <span className="italic text-accent">obvious query</span> is a silent
          bug.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-zinc-700 dark:text-zinc-300">
          Most practice sites grade syntax. This one teaches judgment on
          realistically messy data — duplicate deliveries, broken foreign keys,
          timezone-shifted timestamps, refunds that still look like revenue.
          You'll write a query that looks right and learn why it isn't.
        </p>
      </header>

      <section className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
          The exercises
        </p>
        <ol className="divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {EXERCISES.map((e, i) => (
            <li key={e.slug}>
              <Link
                href={`/exercise/${e.slug}`}
                className="group flex items-baseline gap-6 py-6 transition hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40"
              >
                <span className="w-8 shrink-0 font-display text-2xl font-medium tabular-nums text-zinc-400 group-hover:text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="space-y-1.5">
                  <h2 className="font-display text-2xl font-medium tracking-tight">
                    {e.title}
                  </h2>
                  <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    {e.hook}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <footer className="space-y-3 text-sm text-zinc-500">
        <p className="max-w-prose leading-6">
          These aren't graded. They're meant to be wrong on purpose. Each
          exercise runs in your browser via SQLite (sql.js) — no accounts, no
          tracking, no streaks. Just judgment calls.
        </p>
      </footer>
    </main>
  );
}
