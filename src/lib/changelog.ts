export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: {
    type: "added" | "improved" | "fixed";
    text: string;
  }[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: "0.2.0",
    date: "2026-02-18",
    title: "Community & Feedback",
    changes: [
      { type: "added", text: "In-app feedback widget — report bugs or request features directly" },
      { type: "added", text: "Changelog page — track what's new in every release" },
      { type: "added", text: "Vercel Analytics for understanding usage patterns" },
      { type: "added", text: "GitHub Issue Templates for structured bug reports and feature requests" },
    ],
  },
  {
    version: "0.1.0",
    date: "2025-06-15",
    title: "Initial Release",
    changes: [
      { type: "added", text: "Dual-panel JSON editor with Text, Tree, and Table views" },
      { type: "added", text: "JSON transformations — Format, Compact, Sort" },
      { type: "added", text: "JSONPath query bar with filtering and slicing" },
      { type: "added", text: "JSON Schema validation with auto-generate" },
      { type: "added", text: "AI Explain — static analysis + Gemini streaming" },
      { type: "added", text: "Load from URL, open/save local .json files" },
      { type: "added", text: "7 color themes with persistent selection" },
    ],
  },
];
