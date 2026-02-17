"use client";

import { useMemo, useState, useCallback } from "react";
import styles from "./TreeView.module.css";

interface TreeViewProps {
  json: string;
  onUpdate: (json: string) => void;
}

export default function TreeView({ json, onUpdate }: TreeViewProps) {
  const parsed = useMemo(() => {
    try {
      return { data: JSON.parse(json), error: null };
    } catch (e) {
      return { data: null, error: (e as Error).message };
    }
  }, [json]);

  const handleValueChange = useCallback(
    (path: (string | number)[], newValue: unknown) => {
      try {
        const obj = JSON.parse(json);
        let current = obj;
        for (let i = 0; i < path.length - 1; i++) {
          current = current[path[i]];
        }
        current[path[path.length - 1]] = newValue;
        onUpdate(JSON.stringify(obj, null, 2));
      } catch {}
    },
    [json, onUpdate],
  );

  if (parsed.error) {
    return (
      <div className={styles.error}>
        <span className={styles.errorIcon}>!</span>
        Parse error: {parsed.error}
      </div>
    );
  }

  return (
    <div className={styles.treeContainer}>
      <TreeNode
        keyName={null}
        value={parsed.data}
        path={[]}
        onValueChange={handleValueChange}
        isRoot
      />
    </div>
  );
}

interface TreeNodeProps {
  keyName: string | number | null;
  value: unknown;
  path: (string | number)[];
  onValueChange: (path: (string | number)[], newValue: unknown) => void;
  isRoot?: boolean;
}

function TreeNode({ keyName, value, path, onValueChange, isRoot }: TreeNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const toggleCollapse = () => setCollapsed(!collapsed);

  const renderValue = () => {
    if (value === null) return <span className={styles.null}>null</span>;
    if (typeof value === "boolean")
      return <span className={styles.boolean}>{String(value)}</span>;
    if (typeof value === "number")
      return <span className={styles.number}>{value}</span>;
    if (typeof value === "string")
      return <span className={styles.string}>{value}</span>;
    return null;
  };

  if (isExpandable) {
    const entries = isArray
      ? (value as unknown[]).map((v, i) => [i, v] as [number, unknown])
      : Object.entries(value as Record<string, unknown>);

    const bracket = isArray ? ["[", "]"] : ["{", "}"];

    return (
      <div className={styles.node}>
        <div className={styles.row} onClick={toggleCollapse}>
          <span className={styles.toggle}>{collapsed ? "\u25B6" : "\u25BC"}</span>
          {keyName !== null && (
            <span className={styles.key}>{keyName} : </span>
          )}
          <span className={styles.bracket}>{bracket[0]}</span>
          {collapsed && (
            <span className={styles.collapsed}>
              {" "}...{entries.length} items{" "}
              <span className={styles.bracket}>{bracket[1]}</span>
            </span>
          )}
        </div>
        {!collapsed && (
          <div className={styles.children}>
            {entries.map(([k, v]) => (
              <TreeNode
                key={String(k)}
                keyName={k}
                value={v}
                path={[...path, k]}
                onValueChange={onValueChange}
              />
            ))}
            <div className={styles.row}>
              <span className={styles.bracket}>{bracket[1]}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.node}>
      <div className={styles.row}>
        <span className={styles.spacer} />
        {keyName !== null && (
          <span className={styles.key}>{keyName} : </span>
        )}
        {renderValue()}
      </div>
    </div>
  );
}
