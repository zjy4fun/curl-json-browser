# json-open

把 JSON 直接在浏览器里以可折叠树形结构查看（支持 stdin 和行内 JSON 字符串）。

> 一个给命令行用户准备的「JSON 临时观察器」：输入 JSON，立刻打开浏览器查看结构。

## 演示

![json-open 演示](./demo.gif)

---

## 为什么做这个

在终端里看 JSON 常见痛点：

- 内容太长，不好定位
- 嵌套太深，不直观
- 临时调试不想上重型工具

`json-open` 的目标是：**让“看 JSON”这一步更快更顺手**。

---

## 功能特性

- ✅ 支持管道输入：`curl ... | json`
- ✅ 支持行内 JSON：`json '{"a":1}'`
- ✅ 浏览器树形展示（可折叠/展开）
- ✅ 一键全展开 / 全收起
- ✅ 本地临时文件渲染，不上传数据
- ✅ 跨平台打开浏览器（macOS / Linux / Windows）

---

## 安装

### 方式一：GitHub Packages（当前主分发）

先配置 npm 使用 GitHub Packages：

```bash
echo "@zjy4fun:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
```

然后安装：

```bash
npm i -g @zjy4fun/json-open
```

### 方式二：本地开发安装

```bash
git clone https://github.com/zjy4fun/json-open.git
cd json-open
npm install
npm link
```

安装后可全局使用 `json` 命令。

---

## 快速开始

```bash
# 1) API 返回
curl https://jsonplaceholder.typicode.com/todos/1 | json

# 2) 行内 JSON
json '{"hello":"world","list":[1,2,3]}'

# 3) 文件内容
cat response.json | json
```

执行后会自动打开浏览器，展示 JSON 树形视图。

---

## 常见应用场景

1. **API 调试**  
   快速查看接口返回结构，尤其是深层嵌套数据。

2. **前后端联调**  
   接口变更后快速确认字段缺失或类型异常。

3. **临时数据检查**  
   对日志、队列、快照中的 JSON 做可视化排查。

4. **沟通与演示**  
   与同事讨论 payload 时更直观。

---

## 命令行为

```bash
json
```

输入来源：

- stdin（管道）
- 命令行参数中的 JSON 字符串

参数选项：

- `-h, --help` 显示帮助
- `-v, --version` 显示版本

示例：

```bash
json --help
json --version
json '{"ok":true}'
```

如果没有输入，会输出 usage 提示。

---

## 发布与分发

仓库已包含 GitHub Actions：

- `CI`：基础校验流程
- `Publish to GitHub Packages`：发布到 GPR
- `Publish to npm (Trusted Publishing)`：预留 npm OIDC 发布流程

当前主分发方式：**GitHub Packages**。

---

## 参与贡献

欢迎提 Issue / PR。

### 建议贡献方向

- 更好的错误提示（如 JSON 语法错误定位）
- 主题切换（亮色/暗色）
- 支持直接读取文件路径（如 `json ./data.json`）
- 更丰富交互（搜索、高亮、复制 JSON Path）

### 本地开发

```bash
npm install
npm test
```

提交前建议：

- 确保代码可运行
- 确保 README 示例可复现
- 改动保持聚焦、清晰

---

## 许可证

MIT
