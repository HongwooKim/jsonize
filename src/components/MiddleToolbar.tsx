"use client";

import styles from "./MiddleToolbar.module.css";

interface MiddleToolbarProps {
  onCopyLeft: () => void;
  onCopyRight: () => void;
  onSchemaOpen: () => void;
}

export default function MiddleToolbar({ onCopyLeft, onCopyRight, onSchemaOpen }: MiddleToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.section}>
        <span className={styles.label}>Copy</span>
        <div className={styles.buttons}>
          <button className={styles.btn} onClick={onCopyLeft} title="Copy right to left">
            &lt;
          </button>
          <button className={styles.btn} onClick={onCopyRight} title="Copy left to right">
            &gt;
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.label}>Transform</span>
        <div className={styles.buttons}>
          <button className={styles.btn} onClick={onCopyLeft} title="Transform right to left">
            &lt;
          </button>
          <button className={styles.btn} onClick={onCopyRight} title="Transform left to right">
            &gt;
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.label}>Differences</span>
        <label className={styles.compare}>
          <input type="checkbox" />
          <span>Compare</span>
        </label>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <button className={styles.schemaBtn} onClick={onSchemaOpen}>
          Schema
        </button>
      </div>
    </div>
  );
}
