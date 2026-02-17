"use client";

import { useMemo } from "react";
import styles from "./TableView.module.css";

interface TableViewProps {
  json: string;
}

export default function TableView({ json }: TableViewProps) {
  const { data, error, isArrayOfObjects, keys } = useMemo(() => {
    try {
      const parsed = JSON.parse(json);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every((item) => item !== null && typeof item === "object" && !Array.isArray(item))
      ) {
        const allKeys = new Set<string>();
        parsed.forEach((item) => Object.keys(item).forEach((k) => allKeys.add(k)));
        return {
          data: parsed,
          error: null,
          isArrayOfObjects: true,
          keys: Array.from(allKeys),
        };
      }
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
        return {
          data: parsed,
          error: null,
          isArrayOfObjects: false,
          keys: Object.keys(parsed),
        };
      }
      return { data: parsed, error: null, isArrayOfObjects: false, keys: [] };
    } catch (e) {
      return {
        data: null,
        error: (e as Error).message,
        isArrayOfObjects: false,
        keys: [],
      };
    }
  }, [json]);

  if (error) {
    return <div className={styles.error}>Parse error: {error}</div>;
  }

  if (isArrayOfObjects && Array.isArray(data)) {
    return (
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>#</th>
              {keys.map((k) => (
                <th key={k} className={styles.th}>
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={styles.tr}>
                <td className={styles.td}>{i}</td>
                {keys.map((k) => (
                  <td key={k} className={styles.td}>
                    {formatCell(row[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (keys.length > 0 && data !== null && typeof data === "object") {
    return (
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Key</th>
              <th className={styles.th}>Value</th>
              <th className={styles.th}>Type</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k} className={styles.tr}>
                <td className={styles.td}>{k}</td>
                <td className={styles.td}>{formatCell((data as Record<string, unknown>)[k])}</td>
                <td className={styles.tdType}>{getType((data as Record<string, unknown>)[k])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={styles.empty}>
      Table view works best with objects or arrays of objects.
    </div>
  );
}

function formatCell(val: unknown): string {
  if (val === null) return "null";
  if (val === undefined) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function getType(val: unknown): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}
