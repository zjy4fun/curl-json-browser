# json-browser-cli

把 `curl` 返回的 JSON 直接在浏览器里可折叠查看。

## 安装

```bash
npm i -g @zjy4fun/curl-json-browser
```

## 用法

```bash
curl https://jsonplaceholder.typicode.com/todos/1 | json
```

执行后会自动打开浏览器，并展示树形 JSON：
- 支持节点折叠/展开
- 顶部按钮可一键展开/收起全部

## 本地开发

```bash
npm install
echo '{"hello":"world","list":[1,2,3]}' | node bin/json.js
```

## 发布到 npm（推荐：Trusted Publishing / OIDC）

现在使用 GitHub Actions 的 Trusted Publishing（OIDC），无需 `NPM_TOKEN`。

1. 在 npm 包设置里启用 Trusted Publishing，并绑定 GitHub 仓库：
   - Repository: `zjy4fun/curl-json-browser`
   - Workflow: `.github/workflows/publish.yml`
2. 确认 workflow 具备 `id-token: write`（已配置）
3. 在 GitHub 上创建 Release（或手动触发 workflow）即可发布

> 当前发布命令已使用：`npm publish --access public --provenance`

## 发布到 GitHub

```bash
git init
git add .
git commit -m "feat: init json browser cli"
git branch -M main
git remote add origin git@github.com:<your-name>/json-browser-cli.git
git push -u origin main
```

已内置 GitHub Actions 发布流程（Trusted Publishing, OIDC）。
