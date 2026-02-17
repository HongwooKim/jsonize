"use client";

import { useState, useMemo, useCallback } from "react";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import styles from "./SchemaPanel.module.css";

interface SchemaPanelProps {
  json: string;
  onClose: () => void;
}

const DEFAULT_SCHEMA = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "promptText": { "type": "string" },
    "model": { "type": "string" },
    "ratio": { "type": "string" },
    "duration": { "type": "number" }
  },
  "required": ["model", "duration"]
}`;

export default function SchemaPanel({ json, onClose }: SchemaPanelProps) {
  const [schemaText, setSchemaText] = useState(DEFAULT_SCHEMA);

  const validationResult = useMemo(() => {
    try {
      const data = JSON.parse(json);
      const schema = JSON.parse(schemaText);
      const ajv = new Ajv({ allErrors: true, verbose: true });
      addFormats(ajv);
      const validate = ajv.compile(schema);
      const valid = validate(data);
      if (valid) {
        return { valid: true, errors: [] };
      }
      return {
        valid: false,
        errors: (validate.errors || []).map((err) => ({
          path: err.instancePath || "/",
          message: err.message || "Unknown error",
          keyword: err.keyword,
          params: err.params,
        })),
      };
    } catch (e) {
      return {
        valid: false,
        errors: [{ path: "", message: (e as Error).message, keyword: "parse", params: {} }],
      };
    }
  }, [json, schemaText]);

  const handleGenerate = useCallback(() => {
    try {
      const data = JSON.parse(json);
      const schema = generateSchema(data);
      setSchemaText(JSON.stringify(schema, null, 2));
    } catch {}
  }, [json]);

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.title}>JSON Schema Validator</span>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.body}>
          <div className={styles.schemaSection}>
            <div className={styles.sectionHeader}>
              <span>Schema</span>
              <button className={styles.generateBtn} onClick={handleGenerate}>
                Auto-generate from JSON
              </button>
            </div>
            <textarea
              className={styles.schemaEditor}
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className={styles.resultSection}>
            <div className={styles.sectionHeader}>
              <span>Validation Result</span>
            </div>
            <div className={styles.resultBody}>
              {validationResult.valid ? (
                <div className={styles.valid}>
                  <span className={styles.checkmark}>&#10003;</span>
                  JSON is valid against the schema
                </div>
              ) : (
                <div className={styles.errorList}>
                  {validationResult.errors.map((err, i) => (
                    <div key={i} className={styles.errorItem}>
                      <span className={styles.errorIcon}>&#10007;</span>
                      <div>
                        <div className={styles.errorPath}>{err.path || "(root)"}</div>
                        <div className={styles.errorMsg}>{err.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateSchema(data: unknown): Record<string, unknown> {
  if (data === null) return { type: "null" };
  if (Array.isArray(data)) {
    if (data.length === 0) return { type: "array", items: {} };
    return { type: "array", items: generateSchema(data[0]) };
  }
  if (typeof data === "object") {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      properties[key] = generateSchema(val);
      required.push(key);
    }
    return {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties,
      required,
    };
  }
  if (typeof data === "number") {
    return Number.isInteger(data) ? { type: "integer" } : { type: "number" };
  }
  return { type: typeof data };
}
