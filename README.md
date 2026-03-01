# json-open

把 JSON 直接在浏览器里可折叠查看（支持 `stdin` 和行内 JSON 字符串）。

## 安装（GitHub Packages）

先配置 npm 使用 GitHub Packages：

```bash
echo "@zjy4fun:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
```

然后安装：

```bash
npm i -g @zjy4fun/json-open
```

## 用法

```bash
# 场景1：管道输入
curl https://jsonplaceholder.typicode.com/todos/1 | json

# 场景2：行内 JSON
json '{"hello":"world","list":[1,2,3]}'
```

执行后会自动打开浏览器，并展示树形 JSON：
- 支持节点折叠/展开
- 顶部按钮可一键展开/收起全部

## 本地开发

```bash
npm install
echo '{"hello":"world","list":[1,2,3]}' | node bin/json.js
```

## 发布到 GitHub Packages（当前分发方式）

仓库已提供 workflow：`.github/workflows/publish-gpr.yml`

触发方式：
1. GitHub Actions 手动运行 `Publish to GitHub Packages`
2. 或发布 GitHub Release 自动触发

发布权限使用内置 `GITHUB_TOKEN`（`packages: write`）。

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
