# JSON Formatter (`json-open`)

快速、零依赖的 JSON 格式化 & 查看器 — CLI + Web 双模式。

> 终端里管道输入，或浏览器里粘贴，立刻查看结构。

![演示](./demo.gif)

**🌐 [在线体验 →](https://zjy4fun.github.io/json-open/)**

---

## 功能

### CLI

- 管道输入：`curl ... | json`
- 行内 JSON：`json '{"a":1}'`
- 自动打开浏览器展示交互式树形视图
- 自动解析序列化 / 双重转义的 JSON 字符串
- 跨平台（macOS / Linux / Windows）

### Web

- 粘贴或拖拽 JSON 文件
- 可折叠树形结构，一键全展开 / 全收起
- 实时搜索 + 高亮 + 键盘导航
- **解析 JSON 字符串开关** — 自动展开嵌套 JSON，展开部分有视觉标记
- **亮色 / 暗色主题切换**，自动记住偏好
- 可拖拽调整左右面板大小
- 纯本地运行，不上传任何数据

---

## 安装（CLI）

```bash
npm i -g @zjy4fun/json-open
```

免安装直接用：

```bash
npx @zjy4fun/json-open '{"hello":"world"}'
```

---

## 快速开始

```bash
# API 返回
curl https://jsonplaceholder.typicode.com/todos/1 | json

# 行内 JSON
json '{"name":"test","list":[1,2,3]}'

# 文件
cat data.json | json
```

---

## 序列化 JSON 字符串

常见痛点：JSON 值本身又是一个字符串化的 JSON（来自日志、数据库、API 响应）。

```bash
# 双重编码
json '"{\"name\":\"test\"}"'

# 嵌套 JSON 字符串字段
json '{"data":"{\"users\":[{\"id\":1}]}"}'

# 多层序列化
json '"\"[1,2,3]\""'
```

`json-open` 自动检测并解包。在 Web 界面中开启 **Parse JSON strings** 开关，展开的嵌套块会用琥珀色背景和左边框标记，一眼区分哪些是从字符串解析出来的。

---

## CLI 用法

```
json [json-string]
json -h | --help
json -v | --version
```

输入来源：stdin（管道）或命令行参数。无输入时显示帮助。

---

## Web 用法

打开 **[zjy4fun.github.io/json-open](https://zjy4fun.github.io/json-open/)** 或本地 `index.html`。

- 左侧面板粘贴 JSON，点击 **Format**（或 `Ctrl+Enter`）
- 工具栏 **Expand all / Collapse all** 控制展开
- `Ctrl+F` 搜索 — `Enter` / `Shift+Enter` 跳转匹配项
- 开启 **Parse JSON strings** 展开嵌套 JSON（琥珀色标记）
- 右上角 🌙/☀️ 切换主题

---

## 参与贡献

欢迎 Issue / PR。

```bash
git clone https://github.com/zjy4fun/json-open.git
cd json-open
npm install
npm test
```

---

## 许可证

MIT
