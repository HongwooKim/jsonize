import Link from "next/link";
import { changelog } from "@/lib/changelog";
import styles from "./page.module.css";

export const metadata = {
  title: "Changelog — Jsonize",
  description: "See what's new in Jsonize",
};

export default function ChangelogPage() {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Editor
        </Link>
        <span className={styles.navTitle}>Jsonize</span>
      </nav>

      <main className={styles.content}>
        <h1 className={styles.pageTitle}>Changelog</h1>
        <p className={styles.pageDesc}>All notable changes to Jsonize.</p>

        {changelog.map((entry) => (
          <article key={entry.version} className={styles.entry}>
            <div className={styles.dot} />
            <div className={styles.entryHeader}>
              <span className={styles.version}>v{entry.version}</span>
              <span className={styles.date}>{entry.date}</span>
            </div>
            <p className={styles.entryTitle}>{entry.title}</p>
            <ul className={styles.changeList}>
              {entry.changes.map((change, i) => (
                <li key={i} className={styles.changeItem}>
                  <span
                    className={`${styles.badge} ${
                      change.type === "added"
                        ? styles.badgeAdded
                        : change.type === "improved"
                          ? styles.badgeImproved
                          : styles.badgeFixed
                    }`}
                  >
                    {change.type}
                  </span>
                  <span>{change.text}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </main>
    </div>
  );
}
