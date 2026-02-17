"use client";

import { useState } from "react";
import styles from "./UrlLoader.module.css";

interface UrlLoaderProps {
  onLoad: (json: string, name: string) => void;
  onClose: () => void;
}

export default function UrlLoader({ onLoad, onClose }: UrlLoaderProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const text = await res.text();
      JSON.parse(text);
      const urlName = new URL(url).pathname.split("/").pop() || "fetched";
      onLoad(JSON.stringify(JSON.parse(text), null, 2), urlName);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>Load JSON from URL</span>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.body}>
          <input
            className={styles.input}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/data.json"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
          />
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.hint}>
            Enter a public URL that returns JSON. CORS must be enabled on the server.
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.fetchBtn} onClick={handleFetch} disabled={loading || !url.trim()}>
            {loading ? "Loading..." : "Fetch"}
          </button>
        </div>
      </div>
    </div>
  );
}
