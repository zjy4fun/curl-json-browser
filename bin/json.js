#!/usr/bin/env node
import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

function getCliVersion() {
  try {
    const currentFile = fileURLToPath(import.meta.url)
    const packageJsonPath = path.resolve(path.dirname(currentFile), '..', 'package.json')
    const packageJson = JSON.parse(fsSync.readFileSync(packageJsonPath, 'utf8'))
    return packageJson.version
  } catch {
    return 'unknown'
  }
}

function printHelp() {
  console.log(`json-open

Usage:
  json <json-string>
  cat data.json | json
  curl https://example.com/api | json

Options:
  -h, --help     Show help
  -v, --version  Show version`)
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => (data += chunk))
    process.stdin.on('end', () => resolve(data.trim()))
    process.stdin.on('error', reject)
  })
}

function escapeHtml(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function valueToHtml(value, key = null) {
  const keyHtml = key === null ? '' : `<span class=\"key\">${escapeHtml(String(key))}</span><span class=\"colon\">: </span>`

  if (value === null) {
    return `<div class=\"line\">${keyHtml}<span class=\"null\">null</span></div>`
  }

  const type = typeof value

  if (type === 'string') {
    return `<div class=\"line\">${keyHtml}<span class=\"string\">\"${escapeHtml(value)}\"</span></div>`
  }

  if (type === 'number') {
    return `<div class=\"line\">${keyHtml}<span class=\"number\">${String(value)}</span></div>`
  }

  if (type === 'boolean') {
    return `<div class=\"line\">${keyHtml}<span class=\"boolean\">${String(value)}</span></div>`
  }

  if (Array.isArray(value)) {
    const children = value
      .map((item, idx) => `<li>${valueToHtml(item, idx)}</li>`)
      .join('')

    return `
      <details open>
        <summary>${keyHtml}<span class=\"symbol\">[ ]</span> <span class=\"meta\">(${value.length} items)</span></summary>
        <ul>${children}</ul>
      </details>
    `
  }

  if (type === 'object') {
    const entries = Object.entries(value)
    const children = entries
      .map(([childKey, childValue]) => `<li>${valueToHtml(childValue, childKey)}</li>`)
      .join('')

    return `
      <details open>
        <summary>${keyHtml}<span class=\"symbol\">{ }</span> <span class=\"meta\">(${entries.length} keys)</span></summary>
        <ul>${children}</ul>
      </details>
    `
  }

  return `<div class=\"line\">${keyHtml}<span>${escapeHtml(String(value))}</span></div>`
}

function toHtml(jsonObj) {
  const body = valueToHtml(jsonObj)
  return `<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>JSON Response Viewer</title>
  <style>
    :root {
      color-scheme: dark;
    }
    body {
      margin: 0;
      padding: 24px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      background: #0f172a;
      color: #e2e8f0;
      line-height: 1.5;
    }
    .toolbar {
      position: sticky;
      top: 0;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(6px);
      border-bottom: 1px solid #334155;
      padding: 12px 0;
      margin-bottom: 16px;
      display: flex;
      gap: 8px;
    }
    button {
      border: 1px solid #475569;
      background: #1e293b;
      color: #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      cursor: pointer;
    }
    button:hover {
      background: #334155;
    }
    details {
      margin-left: 16px;
    }
    summary {
      cursor: pointer;
      list-style: none;
    }
    summary::-webkit-details-marker {
      display: none;
    }
    summary::before {
      content: '▸';
      margin-right: 6px;
      color: #94a3b8;
    }
    details[open] > summary::before {
      content: '▾';
    }
    ul {
      list-style: none;
      margin: 4px 0 0 12px;
      padding-left: 12px;
      border-left: 1px dashed #334155;
    }
    .key { color: #93c5fd; }
    .colon { color: #94a3b8; }
    .string { color: #86efac; }
    .number { color: #fcd34d; }
    .boolean { color: #f9a8d4; }
    .null { color: #cbd5e1; }
    .symbol { color: #c4b5fd; }
    .meta { color: #64748b; }
  </style>
</head>
<body>
  <div class=\"toolbar\">
    <button id=\"expand-all\">Expand all</button>
    <button id=\"collapse-all\">Collapse all</button>
  </div>
  <main>${body}</main>
  <script>
    const details = () => Array.from(document.querySelectorAll('details'))
    document.getElementById('expand-all').addEventListener('click', () => details().forEach((d) => d.open = true))
    document.getElementById('collapse-all').addEventListener('click', () => details().forEach((d) => d.open = false))
  </script>
</body>
</html>`
}

/**
 * 递归遍历 JSON 对象，尝试将值为 JSON 字符串的字段自动解析为对象
 * 比如 { "data": "{\"name\":\"test\"}" } → { "data": { "name": "test" } }
 * 这在 API 响应和日志中非常常见
 */
function deepParseJsonStrings(obj) {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(deepParseJsonStrings)
  if (typeof obj === 'object') {
    const result = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = deepParseJsonStrings(value)
    }
    return result
  }
  if (typeof obj === 'string') {
    const trimmed = obj.trim()
    // 只尝试解析看起来像 JSON 对象或数组的字符串
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed)
        return deepParseJsonStrings(parsed)
      } catch {
        return obj
      }
    }
  }
  return obj
}

function openInBrowser(filePath) {
  const platform = process.platform
  const command = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open'

  if (platform === 'win32') {
    spawn('cmd', ['/c', command, filePath], { detached: true, stdio: 'ignore' }).unref()
    return
  }

  spawn(command, [filePath], { detached: true, stdio: 'ignore' }).unref()
}

async function main() {
  const args = process.argv.slice(2)

  if (args.includes('-h') || args.includes('--help')) {
    printHelp()
    process.exit(0)
  }

  if (args.includes('-v') || args.includes('--version')) {
    console.log(getCliVersion())
    process.exit(0)
  }

  const inlineInput = args.join(' ').trim()

  if (!inlineInput && process.stdin.isTTY) {
    printHelp()
    process.exit(1)
  }

  const input = inlineInput || (await readStdin())

  if (!input) {
    console.error('No JSON input received.')
    process.exit(1)
  }

  let parsed
  try {
    parsed = JSON.parse(input)
  } catch {
    // 尝试处理 JSON 序列化后的字符串（双重转义）
    // 比如："{\"name\":\"test\"}" 或 '"{\\\"name\\\":\\\"test\\\"}"'
    // 这种情况常见于：日志输出、API 响应中嵌套的 JSON 字符串、数据库存储的 JSON
    try {
      // 第一步：去掉首尾引号（如果有的话）
      let cleaned = input.trim()
      if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
          (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1)
      }
      // 第二步：处理转义字符
      // 替换 \" → "，\\ → \，\n → 换行，\t → tab
      cleaned = cleaned
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
      parsed = JSON.parse(cleaned)
      console.log('ℹ️  Detected serialized JSON string, auto-unescaped.')
    } catch {
      // 第三步：尝试递归解析（多层序列化的情况）
      try {
        let result = input.trim()
        let depth = 0
        const maxDepth = 5
        while (typeof result === 'string' && depth < maxDepth) {
          result = JSON.parse(result)
          depth++
        }
        if (typeof result === 'object' && result !== null) {
          parsed = result
          console.log(`ℹ️  Detected ${depth}-level serialized JSON string, auto-parsed.`)
        } else {
          console.error('Input is not valid JSON.')
          process.exit(1)
        }
      } catch {
        console.error('Input is not valid JSON.')
        process.exit(1)
      }
    }
  }

  // 递归检查解析后的对象中是否有嵌套的 JSON 字符串值，自动展开
  parsed = deepParseJsonStrings(parsed)

  const html = toHtml(parsed)
  const filePath = path.join(os.tmpdir(), `json-viewer-${Date.now()}.html`)
  await fs.writeFile(filePath, html, 'utf8')
  openInBrowser(filePath)
  console.log(`Opened JSON viewer: ${filePath}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err.message)
  process.exit(1)
})
