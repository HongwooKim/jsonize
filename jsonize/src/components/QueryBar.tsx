"use client";

import { useState, useMemo } from "react";
import styles from "./QueryBar.module.css";
import { queryJson } from "@/lib/jsonpath";

interface QueryBarProps {
  json: string;
}

export default function QueryBar({ json }: QueryBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const result = useMemo(() => {
    if (!query.trim()) return null;
    try {
      const data = JSON.parse(json);
      const res = queryJson(data, query);
      return { data: res, error: null };
    } catch (e) {
      return { data: null, error: (e as Error).message };
    }
  }, [json, query]);

  if (!open) {
    return (
      <button className={styles.toggleBtn} onClick={() => setOpen(true)} title="Open JQ Query">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>Query</span>
      </button>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.inputRow}>
        <span className={styles.label}>jq</span>
        <input
          className={styles.input}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder=".key.subkey[0] or .items[*]"
          spellCheck={false}
          autoFocus
        />
        <button className={styles.closeBtn} onClick={() => setOpen(false)}>&times;</button>
      </div>
      {query.trim() && result && (
        <div className={styles.result}>
          {result.error ? (
            <span className={styles.error}>{result.error}</span>
          ) : (
            <pre className={styles.output}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
