"use client";

import { useState, useCallback } from "react";
import styles from "./page.module.css";
import Header from "@/components/Header";
import TextEditor from "@/components/TextEditor";
import TreeView from "@/components/TreeView";
import TableView from "@/components/TableView";
import PanelHeader from "@/components/PanelHeader";
import QueryBar from "@/components/QueryBar";
import AdBanner from "@/components/AdBanner";
import SchemaPanel from "@/components/SchemaPanel";
import UrlLoader from "@/components/UrlLoader";
import ExplainPanel from "@/components/ExplainPanel";
import FeedbackWidget from "@/components/FeedbackWidget";

type ViewMode = "text" | "tree" | "table";

const DEFAULT_JSON = `{
  "region": "Asia-Pacific",
  "updated": "2025-06-15T09:00:00Z",
  "cities": [
    {
      "name": "Seoul",
      "country": "KR",
      "temp": 27,
      "humidity": 62,
      "condition": "Partly Cloudy",
      "wind": { "speed": 12, "direction": "SW" }
    },
    {
      "name": "Tokyo",
      "country": "JP",
      "temp": 30,
      "humidity": 78,
      "condition": "Sunny",
      "wind": { "speed": 8, "direction": "SE" }
    },
    {
      "name": "Sydney",
      "country": "AU",
      "temp": 14,
      "humidity": 55,
      "condition": "Rain",
      "wind": { "speed": 20, "direction": "NW" }
    }
  ],
  "units": { "temp": "celsius", "wind": "km/h" }
}`;

export default function Home() {
  const [leftText, setLeftText] = useState(DEFAULT_JSON);
  const [rightText, setRightText] = useState(DEFAULT_JSON);
  const [leftView, setLeftView] = useState<ViewMode>("text");
  const [rightView, setRightView] = useState<ViewMode>("tree");
  const [leftName, setLeftName] = useState("weather.json");
  const [rightName, setRightName] = useState("weather.json");
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [urlTarget, setUrlTarget] = useState<"left" | "right" | null>(null);
  const [explainTarget, setExplainTarget] = useState<"left" | "right" | null>(null);

  const copyToRight = useCallback(() => {
    setRightText(leftText);
  }, [leftText]);

  const copyToLeft = useCallback(() => {
    setLeftText(rightText);
  }, [rightText]);

  const formatLeft = useCallback(() => {
    try {
      const parsed = JSON.parse(leftText);
      setLeftText(JSON.stringify(parsed, null, 2));
    } catch {}
  }, [leftText]);

  const formatRight = useCallback(() => {
    try {
      const parsed = JSON.parse(rightText);
      setRightText(JSON.stringify(parsed, null, 2));
    } catch {}
  }, [rightText]);

  const compactLeft = useCallback(() => {
    try {
      const parsed = JSON.parse(leftText);
      setLeftText(JSON.stringify(parsed));
    } catch {}
  }, [leftText]);

  const compactRight = useCallback(() => {
    try {
      const parsed = JSON.parse(rightText);
      setRightText(JSON.stringify(parsed));
    } catch {}
  }, [rightText]);

  const sortLeft = useCallback(() => {
    try {
      const parsed = JSON.parse(leftText);
      const sorted = sortObject(parsed);
      setLeftText(JSON.stringify(sorted, null, 2));
    } catch {}
  }, [leftText]);

  const sortRight = useCallback(() => {
    try {
      const parsed = JSON.parse(rightText);
      const sorted = sortObject(parsed);
      setRightText(JSON.stringify(sorted, null, 2));
    } catch {}
  }, [rightText]);

  const renderPanel = (
    text: string,
    setText: (v: string) => void,
    view: ViewMode,
  ) => {
    switch (view) {
      case "text":
        return <TextEditor value={text} onChange={setText} />;
      case "tree":
        return <TreeView json={text} onUpdate={setText} />;
      case "table":
        return <TableView json={text} />;
    }
  };

  return (
    <div className={styles.container}>
      <Header
        onCopyLeft={copyToLeft}
        onCopyRight={copyToRight}
        onSchemaOpen={() => setSchemaOpen(true)}
      />
      <div className={styles.main}>
        <div className={styles.panel}>
          <PanelHeader
            name={leftName}
            onNameChange={setLeftName}
            view={leftView}
            onViewChange={setLeftView}
            onFormat={formatLeft}
            onCompact={compactLeft}
            onSort={sortLeft}
            text={leftText}
            onTextChange={setLeftText}
            onUrlOpen={() => setUrlTarget("left")}
            onExplain={() => setExplainTarget("left")}
          />
          <QueryBar json={leftText} />
          <div className={styles.editorArea}>
            {renderPanel(leftText, setLeftText, leftView)}
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.panel}>
          <PanelHeader
            name={rightName}
            onNameChange={setRightName}
            view={rightView}
            onViewChange={setRightView}
            onFormat={formatRight}
            onCompact={compactRight}
            onSort={sortRight}
            text={rightText}
            onTextChange={setRightText}
            onUrlOpen={() => setUrlTarget("right")}
            onExplain={() => setExplainTarget("right")}
          />
          <QueryBar json={rightText} />
          <div className={styles.editorArea}>
            {renderPanel(rightText, setRightText, rightView)}
          </div>
        </div>

        <aside className={styles.adSidebar}>
          <AdBanner slot="1234567890" format="rectangle" />
          <AdBanner slot="0987654321" format="rectangle" />
        </aside>
      </div>

      {schemaOpen && (
        <SchemaPanel json={leftText} onClose={() => setSchemaOpen(false)} />
      )}

      {urlTarget && (
        <UrlLoader
          onLoad={(json, name) => {
            if (urlTarget === "left") {
              setLeftText(json);
              setLeftName(name);
            } else {
              setRightText(json);
              setRightName(name);
            }
          }}
          onClose={() => setUrlTarget(null)}
        />
      )}

      {explainTarget && (
        <ExplainPanel
          json={explainTarget === "left" ? leftText : rightText}
          onClose={() => setExplainTarget(null)}
        />
      )}

      <FeedbackWidget />
    </div>
  );
}

function sortObject(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }
  if (obj !== null && typeof obj === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
      sorted[key] = sortObject((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}
