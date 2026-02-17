"use client";

import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import styles from "./TextEditor.module.css";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function getJsonError(text: string): { line: number; message: string } | null {
  try {
    JSON.parse(text);
    return null;
  } catch (e) {
    const msg = (e as Error).message;
    const posMatch = msg.match(/position\s+(\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const before = text.substring(0, pos);
      const line = before.split("\n").length;
      return { line, message: msg };
    }
    const lineMatch = msg.match(/line\s+(\d+)/i);
    if (lineMatch) {
      return { line: parseInt(lineMatch[1], 10), message: msg };
    }
    return { line: 1, message: msg };
  }
}

export default function TextEditor({ value, onChange }: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);
  const [cursorInfo, setCursorInfo] = useState({ line: 1, col: 1 });

  const error = useMemo(() => getJsonError(value), [value]);

  useEffect(() => {
    const lines = value.split("\n").length;
    setLineCount(lines);
  }, [value]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const updateCursorPosition = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, pos);
    const lines = textBefore.split("\n");
    setCursorInfo({ line: lines.length, col: lines[lines.length - 1].length + 1 });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + "  " + value.substring(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        });
      }
      setTimeout(updateCursorPosition, 0);
    },
    [value, onChange, updateCursorPosition],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.editorContainer}>
        <div className={styles.lineNumbers} ref={lineNumbersRef}>
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className={`${styles.lineNumber} ${error && error.line === i + 1 ? styles.errorLine : ""}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={handleInput}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onClick={updateCursorPosition}
          onKeyUp={updateCursorPosition}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      <div className={`${styles.statusBar} ${error ? styles.statusError : styles.statusOk}`}>
        {error ? (
          <span className={styles.errorMsg}>Error (line {error.line}): {error.message}</span>
        ) : (
          <span>
            <span className={styles.validBadge}>Valid JSON</span>
            &nbsp; Line: {cursorInfo.line} &nbsp; Column: {cursorInfo.col}
          </span>
        )}
      </div>
    </div>
  );
}
