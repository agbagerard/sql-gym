"use client";

import CodeMirror from "@uiw/react-codemirror";
import { sql, SQLite } from "@codemirror/lang-sql";
import { EditorView } from "@codemirror/view";

const editorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#18181b",
      color: "#f4f4f5",
      fontSize: "13px",
    },
    ".cm-content": {
      caretColor: "#f4f4f5",
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
      padding: "8px 0",
    },
    ".cm-gutters": {
      backgroundColor: "#27272a",
      color: "#a1a1aa",
      border: "none",
    },
    ".cm-activeLine, .cm-activeLineGutter": {
      backgroundColor: "#27272a",
    },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection":
      {
        backgroundColor: "#3f3f46 !important",
      },
  },
  { dark: true }
);

type Props = {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
};

export default function SqlEditor({ value, onChange, onRun }: Props) {
  return (
    <div
      className="overflow-hidden rounded border border-zinc-300 text-sm dark:border-zinc-700"
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
          e.preventDefault();
          onRun?.();
        }
      }}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[sql({ dialect: SQLite }), editorTheme]}
        basicSetup={{ lineNumbers: true, foldGutter: false }}
        minHeight="160px"
        theme="dark"
      />
    </div>
  );
}
