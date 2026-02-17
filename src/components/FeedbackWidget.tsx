"use client";

import { useState } from "react";
import styles from "./FeedbackWidget.module.css";

type FeedbackType = "bug" | "feature" | "general";

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("general");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, description, email: email || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit feedback");
      }
      setSubmitted(true);
      setDescription("");
      setEmail("");
      setType("general");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSubmitted(false);
    setError(null);
  };

  const typeLabels: Record<FeedbackType, string> = {
    bug: "Bug Report",
    feature: "Feature Request",
    general: "General Feedback",
  };

  return (
    <>
      <button
        className={styles.fab}
        onClick={() => setOpen(true)}
        title="Send Feedback"
        aria-label="Send Feedback"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {open && (
        <div className={styles.overlay} onClick={handleClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <span className={styles.title}>Send Feedback</span>
              <button className={styles.closeBtn} onClick={handleClose}>&times;</button>
            </div>

            {submitted ? (
              <div className={styles.body}>
                <div className={styles.success}>
                  <span className={styles.successIcon}>&#10003;</span>
                  <p>Thank you for your feedback!</p>
                  <p className={styles.successSub}>Your feedback has been submitted and will be reviewed.</p>
                </div>
                <div className={styles.footer}>
                  <button className={styles.fetchBtn} onClick={handleClose}>Close</button>
                </div>
              </div>
            ) : (
              <div className={styles.body}>
                <label className={styles.label}>Type</label>
                <div className={styles.typeGroup}>
                  {(["bug", "feature", "general"] as FeedbackType[]).map((t) => (
                    <button
                      key={t}
                      className={`${styles.typeBtn} ${type === t ? styles.typeBtnActive : ""}`}
                      onClick={() => setType(t)}
                    >
                      {typeLabels[t]}
                    </button>
                  ))}
                </div>

                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    type === "bug"
                      ? "Describe the bug and how to reproduce it..."
                      : type === "feature"
                        ? "Describe the feature you'd like to see..."
                        : "Share your thoughts..."
                  }
                  rows={4}
                  autoFocus
                />

                <label className={styles.label}>
                  Email <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  className={styles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com — for follow-up"
                />

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.footer}>
                  <button className={styles.cancelBtn} onClick={handleClose}>Cancel</button>
                  <button
                    className={styles.fetchBtn}
                    onClick={handleSubmit}
                    disabled={submitting || !description.trim()}
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
