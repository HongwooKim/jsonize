export function explainJson(json: string): string {
  try {
    const data = JSON.parse(json);
    const lines: string[] = [];
    const stats = analyze(data);

    lines.push(`## Structure Overview`);
    lines.push("");
    lines.push(`**Type:** ${stats.rootType}`);
    if (stats.rootType === "object") {
      lines.push(`**Keys:** ${stats.keyCount} properties`);
    } else if (stats.rootType === "array") {
      lines.push(`**Items:** ${stats.arrayLength} elements`);
    }
    lines.push(`**Depth:** ${stats.maxDepth} level${stats.maxDepth > 1 ? "s" : ""}`);
    lines.push(`**Total values:** ${stats.totalValues}`);
    lines.push("");

    if (stats.rootType === "object") {
      lines.push(`## Properties`);
      lines.push("");
      lines.push("| Key | Type | Value |");
      lines.push("|-----|------|-------|");
      for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
        const type = getDetailedType(val);
        const preview = getPreview(val);
        lines.push(`| \`${key}\` | ${type} | ${preview} |`);
      }
      lines.push("");
    }

    if (stats.rootType === "array" && stats.arrayLength > 0) {
      const first = (data as unknown[])[0];
      if (first && typeof first === "object" && !Array.isArray(first)) {
        lines.push(`## Array Item Structure`);
        lines.push("");
        lines.push("Each item is an object with:");
        lines.push("");
        const keys = Object.keys(first as Record<string, unknown>);
        for (const key of keys) {
          const val = (first as Record<string, unknown>)[key];
          lines.push(`- \`${key}\`: ${getDetailedType(val)}`);
        }
        lines.push("");
      }
    }

    if (stats.typeBreakdown.size > 0) {
      lines.push(`## Type Breakdown`);
      lines.push("");
      for (const [type, count] of stats.typeBreakdown) {
        const bar = "\u2588".repeat(Math.min(count, 20));
        lines.push(`- **${type}**: ${count} ${bar}`);
      }
      lines.push("");
    }

    if (stats.patterns.length > 0) {
      lines.push(`## Patterns Detected`);
      lines.push("");
      for (const p of stats.patterns) {
        lines.push(`- ${p}`);
      }
    }

    return lines.join("\n");
  } catch (e) {
    return `**Error:** Cannot analyze - ${(e as Error).message}`;
  }
}

interface Stats {
  rootType: string;
  keyCount: number;
  arrayLength: number;
  maxDepth: number;
  totalValues: number;
  typeBreakdown: Map<string, number>;
  patterns: string[];
}

function analyze(data: unknown): Stats {
  const typeBreakdown = new Map<string, number>();
  const patterns: string[] = [];
  let totalValues = 0;

  function countTypes(val: unknown) {
    const t = getDetailedType(val);
    typeBreakdown.set(t, (typeBreakdown.get(t) || 0) + 1);
    totalValues++;
    if (Array.isArray(val)) {
      val.forEach(countTypes);
    } else if (val && typeof val === "object") {
      Object.values(val as Record<string, unknown>).forEach(countTypes);
    }
  }
  countTypes(data);

  function getDepth(val: unknown): number {
    if (Array.isArray(val)) {
      return 1 + Math.max(0, ...val.map(getDepth));
    }
    if (val && typeof val === "object") {
      return 1 + Math.max(0, ...Object.values(val as Record<string, unknown>).map(getDepth));
    }
    return 0;
  }

  if (Array.isArray(data) && data.length > 0) {
    const allObjects = data.every((item) => item && typeof item === "object" && !Array.isArray(item));
    if (allObjects) patterns.push("Array of objects (table-like structure)");
    const allSameType = data.every((item) => typeof item === typeof data[0]);
    if (allSameType) patterns.push(`All items are ${typeof data[0]}`);
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    const keys = Object.keys(obj);
    const hasId = keys.some((k) => k.toLowerCase() === "id" || k.toLowerCase() === "_id");
    if (hasId) patterns.push("Contains ID field (likely a record/entity)");
    const hasTimestamp = keys.some((k) =>
      /created|updated|timestamp|date|time/i.test(k),
    );
    if (hasTimestamp) patterns.push("Contains timestamp/date fields");
    const hasUrl = Object.values(obj).some(
      (v) => typeof v === "string" && /^https?:\/\//.test(v as string),
    );
    if (hasUrl) patterns.push("Contains URL values");
  }

  return {
    rootType: getDetailedType(data),
    keyCount: data && typeof data === "object" && !Array.isArray(data) ? Object.keys(data as Record<string, unknown>).length : 0,
    arrayLength: Array.isArray(data) ? data.length : 0,
    maxDepth: getDepth(data),
    totalValues,
    typeBreakdown,
    patterns,
  };
}

function getDetailedType(val: unknown): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return `array(${val.length})`;
  if (typeof val === "number") return Number.isInteger(val) ? "integer" : "float";
  return typeof val;
}

function getPreview(val: unknown): string {
  if (val === null) return "`null`";
  if (typeof val === "string") {
    const s = val.length > 40 ? val.substring(0, 40) + "..." : val;
    return `\`"${s}"\``;
  }
  if (typeof val === "number" || typeof val === "boolean") return `\`${val}\``;
  if (Array.isArray(val)) return `[${val.length} items]`;
  if (typeof val === "object") return `{${Object.keys(val as Record<string, unknown>).length} keys}`;
  return String(val);
}
