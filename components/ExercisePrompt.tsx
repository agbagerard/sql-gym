import type { Exercise } from "@/data/exercises";

export default function ExercisePrompt({
  exercise,
  number,
}: {
  exercise: Exercise;
  number?: number;
}) {
  const paragraphs = exercise.scenario.split("\n\n");
  return (
    <section className="space-y-5">
      {typeof number === "number" && (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          Exercise {String(number).padStart(2, "0")}
        </p>
      )}
      <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
        {exercise.title}
      </h1>
      <div className="space-y-3 text-zinc-700 dark:text-zinc-300">
        {paragraphs.map((p, i) => (
          <p key={i} className="leading-7" dangerouslySetInnerHTML={renderInline(p)} />
        ))}
      </div>
      <p className="border-l-2 border-accent pl-4 font-medium leading-7">
        {exercise.task}
      </p>
    </section>
  );
}

function renderInline(text: string): { __html: string } {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const withBold = escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const withCode = withBold.replace(
    /`([^`]+)`/g,
    '<code class="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">$1</code>'
  );
  return { __html: withCode };
}
