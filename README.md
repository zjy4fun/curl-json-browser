# json-open

Open JSON in your browser as a collapsible tree view.

> A tiny CLI for quickly inspecting JSON from APIs, logs, or inline text.

![json-open demo](./demo.gif)

---

## Why json-open?

Reading JSON in terminal is often painful:

- Long output is hard to scan
- Deep nesting is hard to understand quickly
- Full-featured tools can feel heavy for quick checks

`json-open` keeps it simple: **pipe JSON in, inspect it visually in seconds**.

---

## Features

- ✅ Read from stdin (pipe)
- ✅ Read inline JSON text
- ✅ Open browser automatically (macOS / Linux / Windows)
- ✅ Collapsible tree view
- ✅ Expand all / Collapse all
- ✅ Local temp file rendering (no remote upload)
- ✅ **Auto-parse serialized JSON strings** (escaped/double-encoded)
- ✅ **Deep nested JSON string expansion** (auto-unwrap JSON strings inside objects)

---

## Installation

### npm (recommended)

```bash
npm i -g @zjy4fun/json-open
```

After install, use the global command:

```bash
json --version
```

### Run once with npx (no global install)

```bash
npx @zjy4fun/json-open '{"hello":"world"}'
```

### Local development

```bash
git clone https://github.com/zjy4fun/json-open.git
cd json-open
npm install
npm link
```

---

## Quick Start

```bash
# 1) API response
curl https://jsonplaceholder.typicode.com/todos/1 | json

# 2) Inline JSON
json '{"hello":"world","list":[1,2,3]}'

# 3) JSON file content
cat response.json | json
```

The command opens your default browser and shows a structured JSON tree.

---

## CLI Usage

```bash
json [inline-json]
```

Input sources:

- `stdin` (pipe)
- Inline JSON argument

Options:

- `-h, --help` Show help
- `-v, --version` Show version

Examples:

```bash
json --help
json --version
json '{"ok":true}'
```

If no input is provided, usage help is printed.

---

## Serialized JSON String Support

`json-open` now automatically handles serialized/escaped JSON strings — a common pain point when working with logs, databases, and APIs.

```bash
# Double-encoded JSON string (e.g. from database or API response body)
json '"{\"name\":\"test\",\"age\":25}"'
# → auto-detects and parses as { "name": "test", "age": 25 }

# Nested JSON strings inside objects
json '{"status":"ok","data":"{\"users\":[{\"id\":1}]}"}'
# → auto-expands "data" field into a real JSON tree

# Multi-level serialization
json '"\"[1,2,3]\""'
# → recursively unwraps to [1, 2, 3]
```

This works for:
- Escaped JSON from `JSON.stringify()` output
- Log files with embedded JSON payloads
- API responses where a field contains a JSON string
- Database columns storing serialized JSON

---

## Common Use Cases

- API debugging (inspect response shape quickly)
- Backend/frontend contract checks
- Ad-hoc JSON visualization from logs
- Payload discussion/demo with teammates
- **Inspecting serialized JSON from databases or message queues**

---

## Contributing

Issues and PRs are welcome.

### Good contribution ideas

- Better JSON parse error location hints
- Theme switch (light/dark)
- Direct file path support (e.g. `json ./data.json`)
- Search / highlight / copy JSON path

### Local dev

```bash
npm install
npm test
```

---

## License

MIT
