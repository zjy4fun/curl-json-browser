# json-open

Open JSON in your browser with a collapsible tree view (supports stdin and inline JSON text).

> A tiny CLI for command-line users: feed JSON, instantly inspect it in a browser with foldable structure.

---

## Why this exists

Reading JSON in a terminal is often painful:

- Long output is hard to scan
- Deep nesting is hard to understand quickly
- Heavy tools feel overkill for quick debugging

`json-open` keeps this simple: **make JSON inspection fast and visual**.

---

## Features

- ✅ Pipe input: `curl ... | json`
- ✅ Inline JSON: `json '{"a":1}'`
- ✅ Collapsible tree view in browser
- ✅ Expand all / Collapse all buttons
- ✅ Rendered from local temp file (no remote upload)
- ✅ Cross-platform browser open (macOS / Linux / Windows)

---

## Installation

### Option A: GitHub Packages (current primary channel)

Configure npm for GitHub Packages first:

```bash
echo "@zjy4fun:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
```

Then install:

```bash
npm i -g @zjy4fun/json-open
```

### Option B: Local development install

```bash
git clone https://github.com/zjy4fun/json-open.git
cd json-open
npm install
npm link
```

After that, the `json` command is available globally.

---

## Quick start

```bash
# 1) API response
curl https://jsonplaceholder.typicode.com/todos/1 | json

# 2) Inline JSON
json '{"hello":"world","list":[1,2,3]}'

# 3) JSON file content
cat response.json | json
```

The command opens your browser and shows a JSON tree view.

---

## Common use cases

1. **API debugging**  
   Inspect response shape quickly, especially nested data.

2. **Backend/frontend integration checks**  
   Verify missing fields or type mismatches after API changes.

3. **Ad-hoc JSON inspection**  
   Visualize JSON copied from logs, queues, or snapshots.

4. **Team discussion/demo**  
   Share a clearer structure view when discussing payloads.

---

## Command behavior

```bash
json
```

Input source:

- stdin (pipe)
- inline argument JSON string

Example:

```bash
json '{"ok":true}'
```

If no input is provided, it prints usage help.

---

## Release & distribution

Included GitHub Actions workflows:

- `CI`: basic validation flow
- `Publish to GitHub Packages`: publish to GPR
- `Publish to npm (Trusted Publishing)`: reserved for npm OIDC flow

Current primary distribution: **GitHub Packages**.

---

## Contributing

Issues and PRs are welcome.

### Good contribution ideas

- Better error diagnostics (e.g. JSON syntax location)
- Theme switch (light/dark)
- Direct file path support (e.g. `json ./data.json`)
- Rich interactions (search, highlight, copy JSON path)

### Local development

```bash
npm install
npm test
```

Before submitting:

- Ensure code runs correctly
- Ensure README examples still work
- Keep changes focused and clear

---

## License

MIT
