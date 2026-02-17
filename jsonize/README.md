# Jsonize

A powerful online JSON editor with dual-panel layout, multiple views, and AI-powered analysis.

**Live:** [jsonize.vercel.app](https://jsonize.vercel.app)

## Features

### Dual-Panel Editor
- Side-by-side JSON editing with independent view modes
- Copy content between panels (left ↔ right)
- Each panel supports Text, Tree, and Table views

### Text View
- Syntax-aware editor with line numbers
- Real-time JSON validation with error highlighting
- Cursor position indicator (line:column)

### Tree View
- Collapsible/expandable nodes
- Color-coded syntax (strings, numbers, booleans, nulls)
- Inline editing with live updates

### Table View
- Array of objects → spreadsheet-style table with auto-detected columns
- Single object → key-value-type breakdown

### JSON Transformations
- **Format** — Pretty print with 2-space indentation
- **Compact** — Minify to single line
- **Sort** — Recursively sort object keys alphabetically

### JSONPath Query
- jq-style query bar per panel
- Supports `.key`, `[0]`, `[*]`, `[0:5]` slicing, and filtering

### JSON Schema Validation
- Validate against JSON Schema (draft-07)
- Auto-generate schema from current data
- Detailed error reports with paths and messages
- Powered by [AJV](https://ajv.js.org/)

### AI Explain
- **Basic mode** — Static analysis: structure overview, type breakdown, pattern detection
- **AI mode** — Streaming explanation via Google Gemini API
- Supports Korean, English, Japanese, Chinese

### Other
- Load JSON from URL
- Open / save local `.json` files
- 7 color themes with persistent selection

## Getting Started

### Prerequisites
- Node.js 18+

### Installation

```bash
cd jsonize
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Optional | Google Gemini API key for AI Explain feature |
| `NEXT_PUBLIC_GOOGLE_AD_CLIENT` | Optional | Google AdSense publisher ID |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [AJV](https://ajv.js.org/) — JSON Schema validation

## License

MIT
