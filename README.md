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

## 发布到 npm

1. 修改 `package.json` 中 `name`（确保未被占用）
2. 登录 npm：
   ```bash
   npm login
   ```
3. 发布：
   ```bash
   npm publish --access public
   ```

## 发布到 GitHub

```bash
git init
git add .
git commit -m "feat: init json browser cli"
git branch -M main
git remote add origin git@github.com:<your-name>/json-browser-cli.git
git push -u origin main
```

建议再配置一个 GitHub Actions，在 push tag 时自动 npm publish。
