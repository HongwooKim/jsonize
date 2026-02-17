"use client";

import { useRef, useState, useEffect } from "react";
import styles from "./PanelHeader.module.css";

type ViewMode = "text" | "tree" | "table";

interface PanelHeaderProps {
  name: string;
  onNameChange: (name: string) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onFormat: () => void;
  onCompact: () => void;
  onSort: () => void;
  text: string;
  onUrlOpen: () => void;
  onExplain: () => void;
  onTextChange: (text: string) => void;
}

export default function PanelHeader({
  name,
  onNameChange,
  view,
  onViewChange,
  onFormat,
  onCompact,
  onSort,
  text,
  onUrlOpen,
  onExplain,
  onTextChange,
}: PanelHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  const handleNew = () => {
    onNameChange("untitled.json");
    onTextChange("{}");
  };

  const handleOpen = () => {
    fileInputRef.current?.click();
  };

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === "string") {
        onNameChange(file.name);
        try {
          const parsed = JSON.parse(content);
          onTextChange(JSON.stringify(parsed, null, 2));
        } catch {
          onTextChange(content);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSave = () => {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name.endsWith(".json") ? name : `${name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.panelHeader}>
      {/* View mode pill tabs */}
      <div className={styles.viewModes}>
        {(["text", "tree", "table"] as ViewMode[]).map((m) => (
          <button
            key={m}
            className={`${styles.viewBtn} ${view === m ? styles.viewBtnActive : ""}`}
            onClick={() => onViewChange(m)}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Inline-editable document name */}
      {editingName ? (
        <input
          ref={nameInputRef}
          className={styles.docNameInput}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={() => setEditingName(false)}
          onKeyDown={(e) => { if (e.key === "Enter") setEditingName(false); }}
        />
      ) : (
        <span className={styles.docName} onClick={() => setEditingName(true)} title="Click to rename">
          {name}
        </span>
      )}

      {/* Icon-only action buttons */}
      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={handleNew} title="New document">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="11" x2="12" y2="17"/>
            <line x1="9" y1="14" x2="15" y2="14"/>
          </svg>
        </button>
        <button className={styles.actionBtn} onClick={handleOpen} title="Open file">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
        <button className={styles.actionBtn} onClick={onUrlOpen} title="Load from URL">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </button>
        <button className={styles.actionBtn} onClick={handleSave} title="Save as file">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>

        <div className={styles.separator} />

        <button className={styles.actionBtn} onClick={onFormat} title="Format (pretty print)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="15" y2="12" />
            <line x1="3" y1="18" x2="18" y2="18" />
          </svg>
        </button>
        <button className={styles.actionBtn} onClick={onCompact} title="Compact (minify)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <button className={styles.actionBtn} onClick={onSort} title="Sort keys">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h7M3 12h5M3 18h3M16 4l4 4-4 4M20 8H10" />
          </svg>
        </button>

        <div className={styles.separator} />

        <button className={styles.actionBtn} onClick={onExplain} title="AI Explain this JSON">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/>
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.txt"
          style={{ display: "none" }}
          onChange={handleFileLoad}
        />
      </div>
    </div>
  );
}
