# json-open

A fast, zero-dependency JSON viewer — CLI + Web.

> Pipe JSON from terminal or paste it in the browser. Inspect instantly.

![demo](./demo.gif)

**🌐 [Try it online →](https://zjy4fun.github.io/json-open/)**

---

## Features

### CLI

- Pipe from stdin: `curl ... | json`
- Inline JSON: `json '{"a":1}'`
- Auto-opens browser with interactive tree view
- Auto-parse serialized / double-encoded JSON strings
- Cross-platform (macOS / Linux / Windows)

### Web

- Paste or drag-and-drop JSON
- Collapsible tree with expand all / collapse all
- Real-time search with highlighting and keyboard navigation
- **Parse JSON strings toggle** — auto-expand embedded JSON with visual markers
- **Light / Dark theme** with localStorage persistence
- Resizable split panels
- No server, no upload — everything runs locally

---

## Install (CLI)

```bash
npm i -g @zjy4fun/json-open
```

Or run once without installing:

```bash
npx @zjy4fun/json-open '{"hello":"world"}'
```

---

## Quick Start

```bash
# API response
curl https://jsonplaceholder.typicode.com/todos/1 | json

# Inline JSON
json '{"name":"test","list":[1,2,3]}'

# File
cat data.json | json
```

---

## Serialized JSON Strings

A common pain point: JSON values that are themselves stringified JSON (from logs, databases, APIs).

```bash
# Double-encoded
json '"{\"name\":\"test\"}"'

# Nested JSON string fields
json '{"data":"{\"users\":[{\"id\":1}]}"}'

# Multi-level
json '"\"[1,2,3]\""'
```

`json-open` detects and unwraps these automatically. In the web viewer, toggle **Parse JSON strings** to expand them inline — parsed blocks are highlighted with a distinct background and border so you can tell what was originally a string.

---

## CLI Usage

```
json [json-string]
json -h | --help
json -v | --version
```

Input: stdin (pipe) or inline argument. No input shows help.

---

## Web Usage

Open **[zjy4fun.github.io/json-open](https://zjy4fun.github.io/json-open/)** or `index.html` locally.

- Paste JSON in the left panel, click **Format** (or `Ctrl+Enter`)
- Use **Expand all / Collapse all** in the toolbar
- Search with `Ctrl+F` — navigate matches with `Enter` / `Shift+Enter`
- Toggle **Parse JSON strings** to expand embedded JSON (highlighted with amber markers)
- Switch theme with the 🌙/☀️ button in the header

---

## Contributing

Issues and PRs welcome.

```bash
git clone https://github.com/zjy4fun/json-open.git
cd json-open
npm install
npm test
```

---

## License

MIT
