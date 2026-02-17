"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
        <Link href="/changelog" className={styles.whatsNew}>
          What&apos;s New
        </Link>
        <a
          href="https://github.com/HongwooKim/jsonize"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubLink}
          title="GitHub"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
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
