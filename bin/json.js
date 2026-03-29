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

function toHtml(jsonObj, deepParsedObj) {
  const rawBody = valueToHtml(jsonObj)
  const parsedBody = valueToHtml(deepParsedObj)
  // 检测是否有差异（有嵌套 JSON 字符串可以展开）
  const hasDiff = JSON.stringify(jsonObj) !== JSON.stringify(deepParsedObj)
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
      align-items: center;
      flex-wrap: wrap;
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
    /* 开关样式 */
    .toggle-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
      font-size: 13px;
      color: #94a3b8;
    }
    .toggle-wrap.hidden { display: none; }
    .toggle {
      position: relative;
      width: 40px;
      height: 22px;
      cursor: pointer;
    }
    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .toggle .slider {
      position: absolute;
      inset: 0;
      background: #334155;
      border-radius: 22px;
      transition: background 0.2s;
    }
    .toggle .slider::before {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      left: 3px;
      bottom: 3px;
      background: #e2e8f0;
      border-radius: 50%;
      transition: transform 0.2s;
    }
    .toggle input:checked + .slider {
      background: #58a6ff;
    }
    .toggle input:checked + .slider::before {
      transform: translateX(18px);
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
    /* 搜索框 */
    .search-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .search-wrap input {
      border: 1px solid #475569;
      background: #1e293b;
      color: #e2e8f0;
      border-radius: 8px;
      padding: 7px 12px;
      font-size: 13px;
      font-family: inherit;
      width: 200px;
      outline: none;
      transition: border-color 0.2s;
    }
    .search-wrap input:focus {
      border-color: #58a6ff;
    }
    .search-wrap input::placeholder {
      color: #64748b;
    }
    .search-count {
      font-size: 12px;
      color: #64748b;
      min-width: 60px;
    }
    .search-nav button {
      padding: 4px 8px;
      font-size: 12px;
      border-radius: 6px;
    }
    /* 搜索高亮 */
    mark.highlight {
      background: #f0883e;
      color: #0d1117;
      border-radius: 2px;
      padding: 0 1px;
    }
    mark.highlight.current {
      background: #58a6ff;
      color: #fff;
      box-shadow: 0 0 0 2px rgba(88,166,255,0.4);
    }
    /* 搜索时隐藏不匹配的行 */
    .search-active .line.hidden-by-search,
    .search-active li.hidden-by-search {
      display: none;
    }
  </style>
</head>
<body>
  <div class=\"toolbar\">
    <button id=\"expand-all\">Expand all</button>
    <button id=\"collapse-all\">Collapse all</button>
    <div class=\"search-wrap\">
      <input type=\"text\" id=\"search-input\" placeholder=\"Search...\" autocomplete=\"off\" />
      <span class=\"search-count\" id=\"search-count\"></span>
      <span class=\"search-nav\">
        <button id=\"search-prev\" title=\"Previous (Shift+Enter)\">▲</button>
        <button id=\"search-next\" title=\"Next (Enter)\">▼</button>
      </span>
    </div>
    <div class=\"toggle-wrap${hasDiff ? '' : ' hidden'}\" title=\"Parse embedded JSON strings inside values\">
      <span>Parse JSON strings</span>
      <label class=\"toggle\">
        <input type=\"checkbox\" id=\"deep-parse-toggle\" />
        <span class=\"slider\"></span>
      </label>
    </div>
  </div>
  <main id=\"raw-view\">${rawBody}</main>
  <main id=\"parsed-view\" style=\"display:none\">${parsedBody}</main>
  <script>
    const details = () => Array.from(document.querySelectorAll('main:not([style*=\"display:none\"]) details'))
    document.getElementById('expand-all').addEventListener('click', () => details().forEach((d) => d.open = true))
    document.getElementById('collapse-all').addEventListener('click', () => details().forEach((d) => d.open = false))

    const toggle = document.getElementById('deep-parse-toggle')
    const rawView = document.getElementById('raw-view')
    const parsedView = document.getElementById('parsed-view')
    if (toggle) {
      toggle.addEventListener('change', () => {
        if (toggle.checked) {
          rawView.style.display = 'none'
          parsedView.style.display = ''
        } else {
          rawView.style.display = ''
          parsedView.style.display = 'none'
        }
        // 切换视图后重新搜索
        if (searchInput.value.trim()) doSearch()
      })
    }

    // ===== 搜索功能 =====
    const searchInput = document.getElementById('search-input')
    const searchCount = document.getElementById('search-count')
    const searchPrev = document.getElementById('search-prev')
    const searchNext = document.getElementById('search-next')
    let highlights = []
    let currentIdx = -1

    function getActiveView() {
      return parsedView.style.display === 'none' ? rawView : parsedView
    }

    function clearSearch() {
      // 移除所有高亮
      document.querySelectorAll('mark.highlight').forEach(mark => {
        const parent = mark.parentNode
        parent.replaceChild(document.createTextNode(mark.textContent), mark)
        parent.normalize()
      })
      highlights = []
      currentIdx = -1
      searchCount.textContent = ''
      document.body.classList.remove('search-active')
    }

    function doSearch() {
      clearSearch()
      const query = searchInput.value.trim()
      if (!query) return

      const view = getActiveView()
      const regex = new RegExp(query.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'gi')

      // 遍历所有文本节点进行高亮
      const walker = document.createTreeWalker(view, NodeFilter.SHOW_TEXT, null)
      const textNodes = []
      while (walker.nextNode()) textNodes.push(walker.currentNode)

      textNodes.forEach(node => {
        const text = node.textContent
        if (!regex.test(text)) return
        regex.lastIndex = 0

        const frag = document.createDocumentFragment()
        let lastIdx = 0
        let match
        while ((match = regex.exec(text)) !== null) {
          if (match.index > lastIdx) {
            frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)))
          }
          const mark = document.createElement('mark')
          mark.className = 'highlight'
          mark.textContent = match[0]
          frag.appendChild(mark)
          lastIdx = regex.lastIndex
        }
        if (lastIdx < text.length) {
          frag.appendChild(document.createTextNode(text.slice(lastIdx)))
        }
        node.parentNode.replaceChild(frag, node)
      })

      highlights = Array.from(view.querySelectorAll('mark.highlight'))
      if (highlights.length > 0) {
        // 展开所有包含匹配项的 <details>（从内到外逐层展开）
        highlights.forEach(h => {
          let el = h.closest('details')
          while (el) {
            el.open = true
            el = el.parentElement ? el.parentElement.closest('details') : null
          }
        })
        currentIdx = 0
        // 等 DOM 重新布局后再滚动，确保展开动画完成
        requestAnimationFrame(() => scrollToCurrent())
      }
      updateCount()
    }

    function updateCount() {
      if (highlights.length === 0 && searchInput.value.trim()) {
        searchCount.textContent = 'No match'
      } else if (highlights.length > 0) {
        searchCount.textContent = (currentIdx + 1) + ' / ' + highlights.length
      } else {
        searchCount.textContent = ''
      }
    }

    function scrollToCurrent() {
      highlights.forEach((h, i) => {
        h.classList.toggle('current', i === currentIdx)
      })
      if (highlights[currentIdx]) {
        // 确保当前高亮项所在的所有 <details> 都是展开的
        let el = highlights[currentIdx].closest('details')
        while (el) {
          el.open = true
          el = el.parentElement ? el.parentElement.closest('details') : null
        }
        highlights[currentIdx].scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      updateCount()
    }

    function goNext() {
      if (highlights.length === 0) return
      currentIdx = (currentIdx + 1) % highlights.length
      scrollToCurrent()
    }

    function goPrev() {
      if (highlights.length === 0) return
      currentIdx = (currentIdx - 1 + highlights.length) % highlights.length
      scrollToCurrent()
    }

    // 输入时实时搜索（防抖 200ms）
    let debounceTimer
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(doSearch, 200)
    })

    // Enter = 下一个，Shift+Enter = 上一个
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        e.shiftKey ? goPrev() : goNext()
      }
      if (e.key === 'Escape') {
        searchInput.value = ''
        clearSearch()
        searchInput.blur()
      }
    })

    searchNext.addEventListener('click', goNext)
    searchPrev.addEventListener('click', goPrev)

    // Ctrl+F / Cmd+F 聚焦搜索框
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        searchInput.focus()
        searchInput.select()
      }
    })
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

  // 生成深度解析版本（展开嵌套 JSON 字符串），但默认不启用
  const deepParsed = deepParseJsonStrings(parsed)

  const html = toHtml(parsed, deepParsed)
  const filePath = path.join(os.tmpdir(), `json-viewer-${Date.now()}.html`)
  await fs.writeFile(filePath, html, 'utf8')
  openInBrowser(filePath)
  console.log(`Opened JSON viewer: ${filePath}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err.message)
  process.exit(1)
})
