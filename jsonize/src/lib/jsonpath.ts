export function queryJson(data: unknown, path: string): unknown {
  if (!path || path === ".") return data;

  const tokens = tokenize(path);
  let current: unknown = data;

  for (const token of tokens) {
    if (current === null || current === undefined) return undefined;

    if (token.type === "key") {
      if (typeof current === "object" && !Array.isArray(current)) {
        current = (current as Record<string, unknown>)[token.value];
      } else {
        return undefined;
      }
    } else if (token.type === "index") {
      const idx = parseInt(token.value, 10);
      if (Array.isArray(current)) {
        current = current[idx];
      } else {
        return undefined;
      }
    } else if (token.type === "wildcard") {
      if (Array.isArray(current)) {
        return current;
      } else if (typeof current === "object" && current !== null) {
        return Object.values(current as Record<string, unknown>);
      }
      return undefined;
    } else if (token.type === "slice") {
      if (Array.isArray(current)) {
        const [start, end] = token.value.split(":").map((v: string) => (v === "" ? undefined : parseInt(v, 10)));
        current = current.slice(start, end);
      } else {
        return undefined;
      }
    } else if (token.type === "filter") {
      if (Array.isArray(current)) {
        const key = token.value;
        current = current.map((item) => {
          if (item && typeof item === "object") {
            return (item as Record<string, unknown>)[key];
          }
          return undefined;
        });
      } else {
        return undefined;
      }
    }
  }

  return current;
}

interface Token {
  type: "key" | "index" | "wildcard" | "slice" | "filter";
  value: string;
}

function tokenize(path: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = path.startsWith(".") ? path.slice(1) : path;

  let pos = 0;
  while (pos < s.length) {
    if (s[pos] === "[") {
      const end = s.indexOf("]", pos);
      if (end === -1) break;
      const inner = s.substring(pos + 1, end);
      if (inner === "*") {
        tokens.push({ type: "wildcard", value: "*" });
      } else if (inner.includes(":")) {
        tokens.push({ type: "slice", value: inner });
      } else if (/^\d+$/.test(inner)) {
        tokens.push({ type: "index", value: inner });
      } else {
        const key = inner.replace(/^['"]|['"]$/g, "");
        tokens.push({ type: "key", value: key });
      }
      pos = end + 1;
      if (pos < s.length && s[pos] === ".") pos++;
    } else {
      let end = pos;
      while (end < s.length && s[end] !== "." && s[end] !== "[") end++;
      const key = s.substring(pos, end);
      if (key === "*") {
        tokens.push({ type: "wildcard", value: "*" });
      } else if (key) {
        tokens.push({ type: "key", value: key });
      }
      pos = end;
      if (pos < s.length && s[pos] === ".") pos++;
    }
    i++;
    if (i > 100) break;
  }

  return tokens;
}
