"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./ExplainPanel.module.css";
import { explainJson } from "@/lib/explainer";

interface ExplainPanelProps {
  json: string;
  onClose: () => void;
}

const LANGUAGES = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];

function getSavedLang(): string {
  if (typeof window === "undefined") return "ko";
  return localStorage.getItem("jsonize-explain-lang") || "ko";
}

export default function ExplainPanel({ json, onClose }: ExplainPanelProps) {
  const [mode, setMode] = useState<"basic" | "ai">("ai");
  const [lang, setLang] = useState(getSavedLang);
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiDone, setAiDone] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const basicExplanation = explainJson(json);

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem("jsonize-explain-lang", newLang);
    setAiResult("");
    setAiDone(false);
    setAiError(null);
  };

  const fetchAi = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    setAiResult("");
    setAiDone(false);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json, lang }),
        signal: abort.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `AI request failed (${res.status})`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setAiResult((prev) => prev + parsed.text);
              }
            } catch {}
          }
        }
      }

      setAiDone(true);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setAiError((e as Error).message);
      }
    } finally {
      setAiLoading(false);
      abortRef.current = null;
    }
  }, [json, lang]);

  useEffect(() => {
    if (mode === "ai" && !aiResult && !aiLoading && !aiError && !aiDone) {
      fetchAi();
    }
  }, [mode, aiResult, aiLoading, aiError, aiDone, fetchAi]);

  useEffect(() => {
    if (mode === "ai" && aiResult && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [mode, aiResult]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleRetry = () => {
    setAiError(null);
    setAiResult("");
    setAiDone(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>JSON Explain</span>
          <div className={styles.headerRight}>
            <div className={styles.modeTabs}>
              <button
                className={`${styles.modeTab} ${mode === "basic" ? styles.modeTabActive : ""}`}
                onClick={() => setMode("basic")}
              >
                Basic
              </button>
              <button
                className={`${styles.modeTab} ${mode === "ai" ? styles.modeTabActive : ""}`}
                onClick={() => setMode("ai")}
              >
                AI
              </button>
            </div>
            <select
              className={styles.langSelect}
              value={lang}
              onChange={(e) => handleLangChange(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <button className={styles.closeBtn} onClick={onClose}>&times;</button>
          </div>
        </div>
        <div className={styles.body} ref={bodyRef}>
          {mode === "ai" && aiLoading && !aiResult && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <span>AI analyzing JSON...</span>
            </div>
          )}
          {mode === "ai" && aiError && (
            <div className={styles.errorBox}>
              <p>{aiError}</p>
              <button className={styles.retryBtn} onClick={handleRetry}>Retry</button>
            </div>
          )}
          {mode === "ai" && aiResult && (
            <>
              <div className={styles.content} dangerouslySetInnerHTML={{ __html: renderMarkdown(aiResult) }} />
              {aiLoading && <div className={styles.streamingDot}>●●●</div>}
            </>
          )}
          {mode === "basic" && (
            <div className={styles.content} dangerouslySetInnerHTML={{ __html: renderMarkdown(basicExplanation) }} />
          )}
        </div>
      </div>
    </div>
  );
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h4 class="md-h4">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/^# (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/g, "").replace(/```/g, "");
      return `<pre class="md-pre"><code>${code}</code></pre>`;
    })
    .replace(/^\| (.+) \|$/gm, (match) => {
      const cells = match.split("|").filter((c) => c.trim()).map((c) => c.trim());
      return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
    })
    .replace(/^\|[-| ]+\|$/gm, "")
    .replace(/(<tr>.*<\/tr>\n?)+/g, (match) => {
      const rows = match.trim().split("\n");
      if (rows.length > 0) {
        const headerRow = rows[0].replace(/<td>/g, "<th>").replace(/<\/td>/g, "</th>");
        const bodyRows = rows.slice(1).join("\n");
        return `<table class="md-table"><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table>`;
      }
      return match;
    })
    .replace(/^- (.+)$/gm, '<li class="md-li">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="md-ul">${match}</ul>`)
    .replace(/\n\n/g, "<br/>");
}
