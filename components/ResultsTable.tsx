import type { ResultSet } from "@/data/exercises";

export default function ResultsTable({ result }: { result: ResultSet }) {
  if (result.rows.length === 0) {
    return <p className="text-sm text-zinc-500">Query ran, 0 rows.</p>;
  }
  return (
    <table className="border-collapse text-sm font-mono">
      <thead>
        <tr>
          {result.columns.map((c) => (
            <th
              key={c}
              className="border border-zinc-300 px-3 py-1 text-left dark:border-zinc-700"
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {result.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td
                key={j}
                className="border border-zinc-300 px-3 py-1 dark:border-zinc-700"
              >
                {cell === null ? <span className="text-zinc-400">NULL</span> : String(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
