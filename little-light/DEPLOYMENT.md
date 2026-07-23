# 🌙 Little Light 部署指南

## 一、项目文件清单

```
LittleLightV1/
├── index.html          # 主页面 ✅
├── style.css           # 样式文件 ✅
├── app.js              # 前端逻辑（已接入 API）✅
├── worker.js           # Cloudflare Worker 代理 ✅
├── wrangler.toml       # Worker 配置（含 API Key）✅
├── package.json        # 项目配置 ✅
├── .github/workflows/deploy.yml  # 自动部署工作流 ✅
└── DEPLOYMENT.md       # 本文件
```

---

## 二、手动部署步骤

### Step 1：安装必要工具

1. **Node.js**（已安装到 `C:\nodejs\node-v20.17.0-win-x64`）
2. **Git**（需要手动安装：https://git-scm.com/download/win）
3. **Cloudflare Account**（https://dash.cloudflare.com/）
4. **GitHub Account**（https://github.com/）

### Step 2：配置命令行环境

打开 **命令提示符** 或 **PowerShell**：

```bash
# 添加 Node.js 到 PATH
set PATH=C:\nodejs\node-v20.17.0-win-x64;%PATH%

# 验证 Node.js
node --version
npm --version
```

### Step 3：安装 Cloudflare Wrangler

```bash
npm install -g wrangler

# 验证安装
wrangler --version
```

### Step 4：登录 Cloudflare

```bash
wrangler login
# 会自动打开浏览器，登录你的 Cloudflare 账号
```

### Step 5：部署 API Worker

```bash
cd d:\AI智能\产品文档\LittleLightV1
wrangler deploy
```

部署成功后会显示类似这样的地址：
```
https://little-light-api.yourname.workers.dev
```

### Step 6：配置 DeepSeek API Key

```bash
wrangler secret put DEEPSEEK_API_KEY
# 输入密钥：sk-2a0246f90ee2465a84b2954897915b89
```

### Step 7：更新前端 API 地址

编辑 `app.js` 文件第 107 行，替换为你的 Worker 地址：

```javascript
fetch('https://little-light-api.xxx.workers.dev/api/chat', {
```

### Step 8：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 创建仓库：`little-light`
3. 将代码推送到 GitHub：

```bash
cd d:\AI智能\产品文档\LittleLightV1
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/little-light.git
git push -u origin main
```

### Step 9：部署到 Cloudflare Pages

1. 访问 https://dash.cloudflare.com/
2. 点击「Pages」→「Create a project」
3. 选择「Connect to Git」
4. 选择你的 `little-light` 仓库
5. 配置构建设置：
   - **Framework**: `None`
   - **Build command**: 留空
   - **Build output directory**: 留空
6. 点击「Save and Deploy」

### Step 10：配置自定义域名

1. 在 Pages 项目中，点击「Custom domains」
2. 添加域名：`little.apay.eu.cc`
3. 在 apay.eu.cc 的 DNS 管理面板中添加 CNAME 记录：
   ```
   little → your-project.pages.dev
   ```

---

## 三、验证部署

部署完成后访问：
```
https://little.apay.eu.cc
```

测试功能：
1. ✅ 启动页动画
2. ✅ 心情选择
3. ✅ 和 Lumi 聊天（调用 DeepSeek API）
4. ✅ 情绪日记
5. ✅ 30天旅程
6. ✅ 树洞社区
7. ✅ 个人中心

---

## 四、常见问题

### Q: API 请求失败？
A: 检查 Worker 日志：`wrangler tail`

### Q: 域名无法访问？
A: 检查 DNS 记录是否正确，等待 DNS 生效（通常 5-10 分钟）

### Q: HTTPS 证书问题？
A: Cloudflare 会自动配置 SSL，等待证书颁发

### Q: 需要 .com 域名？
A: 在 Cloudflare Registrar 购买后，添加到 Pages 即可

---

## 五、费用说明

| 服务 | 费用 | 说明 |
|------|------|------|
| Cloudflare Pages | 免费 | 每月 100GB 流量 |
| Cloudflare Workers | 免费 | 每天 10 万次请求 |
| DeepSeek API | 按量付费 | 免费额度足够测试 |

---

🎉 祝你部署成功！