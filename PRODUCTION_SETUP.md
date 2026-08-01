# LittleLightV1 生产接入指南

把"海外付费 AI 聊天 App"从 MVP 推到可上线，需要补齐三块：**后端代理（藏 Key + 限流）**、**Firebase（鉴权 + 计数）**、**RevenueCat（真实订阅）**。本文件是总清单。

---

## 1. Firebase（鉴权 + Firestore 权威计数）

1. 新建 Firebase 项目：https://console.firebase.google.com
2. 添加 iOS / Android 应用，按向导走完。
3. 装 FlutterFire CLI 并生成配置：
   ```bash
   dart pub global activate flutterfire_cli
   flutterfire configure
   ```
   它会自动覆盖 `lib/firebase_options.dart`（填入 apiKey / projectId 等）。
4. 控制台启用：
   - **Authentication**：Email/Password、Google、Facebook（对应 `google_sign_in` / `flutter_facebook_auth`）。
   - **Firestore**：创建数据库。
5. 部署安全规则（禁止客户端自改 premium）：
   ```bash
   firebase deploy --only firestore:rules   # 使用根目录 firestore.rules
   ```

数据模型：每个用户在 `users/{uid}` 一个文档：
```json
{ "isPremium": false, "freeUsedDate": "2026-07-31", "freeUsedCount": 0 }
```
对话历史（已接入）放在子集合 `users/{uid}/conversations/{cid}/messages/{mid}`：
```json
{ "role": "user|assistant", "text": "...", "createdAt": 1754000000000, "model": "gpt-4o-mini" }
```
App 在聊天页初始化时 `loadMessages()` 恢复历史、收发时 `appendMessage()` 落库；
Firebase 未配置时自动退化为内存态（不崩溃）。规则见 `firestore.rules` 的 messages 子集合授权。

---

## 2. 后端代理（藏 OpenAI Key + 服务端限流）

代码在 `backend/`。**绝不把 OpenAI Key 放进 App**。

1. 在 Firebase 控制台 → 项目设置 → 服务账号 → 生成**服务账号 JSON**。
2. 配置环境变量（参考 `backend/.env.example`）：
   ```bash
   OPENAI_API_KEY=sk-xxxx
   BACKEND_PORT=3000
   FREE_DAILY_CHAT_LIMIT=5
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json
   REVENUECAT_WEBHOOK_SECRET=whsec_xxxx   # 第 3 步拿
   REVENUECAT_SECRET=sk_xxxx              # 第 3 步拿
   ```
3. 部署（任选）：
   - **独立服务**：Render / Railway / Fly.io / Cloud Run，环境变量配在平台后台。
   - **Cloud Functions（推荐，少部署一样东西）**：`functions/index.js` 已用 `onRequest` 包裹同一份 `functions/handler.js`；
     在 Firebase 控制台把 `OPENAI_API_KEY` 等配为 secrets，`firebase deploy --only functions` 即可，天然共用同一 Firebase 项目。
     详见 `backend/README.md`。
4. 拿到后端域名后，注入 App：
   ```bash
   flutter build --dart-define=BACKEND_URL=https://your-backend.example.com
   ```

后端接口：
- `POST /v1/chat`：App 带 Firebase ID Token 调用，后端校验 + 扣额度 + 转发 OpenAI；额度用尽返回 `402 {code:"QUOTA_EXCEEDED"}`。
- `POST /v1/subscription/sync`：购买后主动校验订阅并写 `isPremium`。
- `POST /webhooks/revenuecat`：RevenueCat 事件推送（验签后写 `isPremium`）。

---

## 3. RevenueCat（真实订阅）

1. 注册 https://www.revenuecat.com，新建 App（对应 iOS / Android）。
2. 后台配置：
   - 连接 **App Store Connect** 与 **Google Play**（创建订阅商品，如 `premium_monthly`）。
   - 定义 **Entitlement**，名称固定为 **`premium`**（代码里约定）。
   - **Project Settings → API Keys** 拿 iOS / Android Key，以及 **Webhooks** 里生成 Webhook 密钥。
3. 把 Webhook 指向你的后端 `/webhooks/revenuecat`，并填 `REVENUECAT_WEBHOOK_SECRET`。
4. 把 `REVENUECAT_SECRET`（API Key）填进后端环境变量，用于 `/v1/subscription/sync` 主动校验。
5. 构建 App 时注入 RevenueCat Key：
   ```bash
   flutter build \
     --dart-define=BACKEND_URL=https://your-backend.example.com \
     --dart-define=RC_IOS_KEY=appl_xxxx \
     --dart-define=RC_ANDROID_KEY=goog_xxxx
   ```

购买流程：App 用 RevenueCat 购买 → 立即调后端 `/v1/subscription/sync` 写 Firestore → 同时 RevenueCat Webhook 异步兜底。个人页"Restore Purchase"也会刷新。

---

## 4. 本地联调（不接真实服务）

- 想跑通聊天 UI：用 `--dart-define=USE_BACKEND=false --dart-define=OPENAI_API_KEY=sk-xxxx` 本地直连 OpenAI。
- 想看付费 UI：不配 RevenueCat 时，付费墙走本地 `dev_premium_override` 模拟（仅 UI，不能真绕过后端 402）。
- 想看 premium 态：`--dart-define=DEV_FORCE_PREMIUM=true`。

> ⚠️ 以上 dev 开关在任何**生产构建命令里都不能出现**。

---

## 5. 上线前检查清单
- [ ] `firebase_options.dart` 已填真实值（flutterfire configure）
- [ ] 后端已部署且 `BACKEND_URL` 注入生产构建
- [ ] OpenAI Key 只在后端，App 包里搜不到任何 `sk-`
- [ ] Firestore 规则已部署（客户端不能改 isPremium，且 messages 子集合可写）
- [ ] RevenueCat 已接 App Store / Play 真实商品，entitlement 名 `premium`
- [ ] 后端 `REVENUECAT_*` 已配，Webhook 指向线上后端
- [ ] 计费告警已开（OpenAI / RevenueCat 后台）
