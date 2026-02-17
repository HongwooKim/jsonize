"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Header.module.css";
import { themes, applyTheme, getSavedTheme, saveTheme } from "@/lib/themes";

interface HeaderProps {
  onCopyLeft?: () => void;
  onCopyRight?: () => void;
  onSchemaOpen?: () => void;
}

export default function Header({ onCopyLeft, onCopyRight, onSchemaOpen }: HeaderProps) {
  const [currentTheme, setCurrentTheme] = useState("nebula");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = getSavedTheme();
    setCurrentTheme(saved);
    applyTheme(saved);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    setCurrentTheme(id);
    applyTheme(id);
    saveTheme(id);
    setOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.logo}>Jsonize</span>
      </div>

      <div className={styles.center}>
        <button className={styles.cmdBtn} onClick={onCopyLeft} title="Copy right to left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <button className={styles.cmdBtn} onClick={onCopyRight} title="Copy left to right">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
        <div className={styles.cmdDivider} />
        <button className={styles.cmdBtn} onClick={onSchemaOpen} title="JSON Schema Validator">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1"/>
            <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1"/>
          </svg>
        </button>
      </div>

      <div className={styles.right} ref={dropdownRef}>
        <button className={styles.themeBtn} onClick={() => setOpen(!open)}>
          <span
            className={styles.swatch}
            style={{ background: themes.find((t) => t.id === currentTheme)?.preview }}
          />
          <span>Theme</span>
        </button>
        {open && (
          <div className={styles.dropdown}>
            {themes.map((theme) => (
              <button
                key={theme.id}
                className={`${styles.themeOption} ${currentTheme === theme.id ? styles.themeOptionActive : ""}`}
                onClick={() => handleSelect(theme.id)}
              >
                <span className={styles.optionSwatch} style={{ background: theme.preview }} />
                <span>{theme.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
