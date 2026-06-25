import type { Exercise } from "@/data/exercises";

export default function FeedbackPanel({ exercise }: { exercise: Exercise }) {
  return (
    <section className="space-y-4 rounded border border-zinc-300 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900/60">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          The obvious answer
        </p>
        <pre className="mt-1 overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100">
          {exercise.obviousAnswer}
        </pre>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          Why it's wrong
        </p>
        <p className="mt-1 whitespace-pre-line leading-6 text-zinc-800 dark:text-zinc-200">
          {exercise.whyWrong}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          One correct answer
        </p>
        <pre className="mt-1 overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100">
          {exercise.correctAnswer}
        </pre>
      </div>
    </section>
  );
}
