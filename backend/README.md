# LittleLightV1 后端代理

生产环境必备：把 OpenAI Key 留在服务端，App 只跟这个后端通信。后端同时负责
**鉴权（Firebase ID Token）、每日免费额度限流、RevenueCat 订阅校验**。

## 目录里的文件
- `server.js` — standalone 启动入口（本地调试 / Cloud Run / Render），薄壳，逻辑都在 handler
- `functions/handler.js` — **核心**：路由 + 配置 + Firebase Admin 初始化，被两处复用
- `functions/index.js` — Cloud Functions 入口（用 `onRequest` 包裹 handler）
- `functions/package.json` — Cloud Functions 依赖（firebase-functions + firebase-admin）
- `firebase.json` — 把 functions 源码目录指向 `functions/`
- `package.json` — standalone 依赖（仅 firebase-admin）
- `.env.example` — standalone 环境变量模板

> 设计要点：路由逻辑只在 `functions/handler.js` 写一份，standalone 与 Cloud Functions
> 共用，避免「两份代码分叉」导致行为不一致。

## 本地跑（standalone）
```bash
cd backend
npm install
cp .env.example .env   # 然后填好里面的变量
npm start
# 健康检查： curl http://localhost:3000/health
```

## 部署（任选其一）

### A. 独立服务（Render / Railway / Fly.io / Cloud Run）
- **Render / Railway / Fly.io**：连仓库的 `backend/` 目录，`build=npm install`，`start=npm start`，在平台后台填环境变量。
- **Google Cloud Run**：`gcloud run deploy` 指向 `backend/` 目录，环境变量配在 Cloud Run 里。

### B. Firebase Cloud Functions（2nd gen，推荐：少部署一样东西）
把后端折进 Firebase 项目，不用单独跑一台服务，天然共用同一个 Firebase：
```bash
cd backend
npm install                 # 装 standalone 依赖（本地调试用）
cd functions && npm install # 装 Cloud Functions 依赖（部署用）
# 在 Firebase 控制台 → Functions → 环境变量/密钥 中配置 secrets：
#   OPENAI_API_KEY, REVENUECAT_WEBHOOK_SECRET, REVENUECAT_SECRET
#   （functions/index.js 已声明 secrets 列表）
firebase deploy --only functions
```
部署后函数地址形如 `https://<region>-<project>.cloudfunctions.net/api`，
把 `https://你的后端域名` 通过 `dart-define=BACKEND_URL=...` 注入 App。
Cloud Functions 下路径保持 `/v1/chat`、`/health` 等不变（函数名 `api` 作为前缀）。

> 区域建议：海外产品选离用户近的区域（如 `europe-west1` / `us-central1`），在
> `functions/index.js` 的 `region` 字段修改。

部署后把 `https://你的后端域名` 通过 `dart-define=BACKEND_URL=...` 注入 App。

## 本地用 Emulator 联调（无需真实 Firebase 项目）

整套链路在本地跑通，适合调试限流 / Firestore 计数 / 对话历史，不产生真实费用。

1. 安装并登录 CLI：`npm install -g firebase-tools` → `firebase login`
2. 在 `backend/.env.local` 填（firebase-tools 启动模拟器时自动加载）：
   ```bash
   OPENAI_API_KEY=sk-xxxx
   DISABLE_AUTH=true        # 本地跳过 token 校验，免配 Auth（仅 dev，生产绝不能设）
   ```
3. 启动模拟器：
   ```bash
   bash start-emulators.sh   # 等价于 firebase emulators:start --only functions,firestore,auth
   # Functions 模拟器监听 :5001
   ```
4. App 端另开终端，连本地模拟器与本地后端：
   ```bash
   flutter run --dart-define=USE_EMULATORS=true \
               --dart-define=BACKEND_URL=http://localhost:5001
   ```
   - `USE_EMULATORS=true` 让 App 连 Auth(:9099) / Firestore(:8080) 模拟器（见 `lib/main.dart`）。
   - 聊天走 本地 Functions → 本地 Firestore 计数 → 真实 OpenAI（用 .env.local 的 key）。

> ⚠️ `DISABLE_AUTH=true` 仅本地模拟器有效；handler 在生产（Cloud Functions）绝不会读到该变量，
> 因此无法用于绕过线上鉴权。生产构建也不要带 `USE_EMULATORS`。

## 接口
| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/health` | 健康检查 |
| POST | `/v1/chat` | 聊天代理；Header `Authorization: Bearer <Firebase ID Token>`，body 透传 OpenAI 格式 `{model,messages,temperature,max_tokens,countQuota?}`，返回 OpenAI 原样响应 |
| POST | `/v1/subscription/sync` | App 购买后用 RevenueCat API 校验并写 `isPremium` |
| POST | `/webhooks/revenuecat` | RevenueCat 事件 Webhook（验签后写 `isPremium`） |

`/v1/chat` 在免费额度用尽时返回 HTTP `402`，body `{code:"QUOTA_EXCEEDED"}`，App 据此弹付费墙。

## 计费与风控要点
- OpenAI Key 只在服务端，反编译 App 也拿不到。
- 限流在服务端 Firestore 事务里做，客户端绕过无效。
- `isPremium` 只能由本后端（admin）写入；Firestore 安全规则禁止客户端改为 true（见根目录 `firestore.rules`）。
- 建议为后端配置独立的「仅 chat/completions」OpenAI 项目，并开用量告警。
