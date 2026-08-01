# LittleLightV1 上线操作手册（按步骤执行）

> 这份手册把"从代码到能上架的付费 App"拆解成 8 个阶段。你**按顺序**做，每阶段末尾有"验证点"，通过后再进下一阶段。
>
> ⚠️ 铁律：**任何"生产构建"命令里都禁止出现 `USE_BACKEND=false`、`DEV_FORCE_PREMIUM=true`、`OPENAI_API_KEY=sk-...` 这些 dev 开关。** 它们只能用于本地调试。

---

## 阶段 0：准备工具（一次性）

在本机装好下面这些（装完跑验证命令确认）：

| 工具 | 用途 | 安装 |
|---|---|---|
| Flutter 3.x | App 编译 | https://flutter.dev/docs/get-started |
| Dart SDK | 随 Flutter 自带 | — |
| Node.js 18+ | 跑后端 / Firebase 工具 | https://nodejs.org |
| Firebase CLI | 部署后端 + 规则 | `npm install -g firebase-tools` |
| FlutterFire CLI | 生成 `firebase_options.dart` | `dart pub global activate flutterfire_cli` |
| Git | 版本管理 | 系统自带或 https://git-scm.com |

验证：
```bash
flutter --version      # 看到 Flutter 3.x
node --version         # >= 18
firebase --version     # >= 12
flutterfire --version  # 有输出即正常
flutter doctor         # 尽量全绿（Android/iOS 工具链至少其一就绪）
```

---

## 阶段 1：Firebase 项目（身份 + 数据库）

1. 打开 https://console.firebase.google.com → **添加项目** → 取名（如 `littlelight-prod`）。
2. 项目里 **添加应用**：iOS（填 Bundle ID，如 `com.yourcompany.littlelight`）+ Android（填 Package name，同上格式）。
   - iOS 会下载 `GoogleService-Info.plist`，Android 会下载 `google-services.json`，先留着。
3. 左侧菜单启用：
   - **Authentication → 登录方式**：开启 Email/密码、Google；Facebook 也开（对应代码里的 `google_sign_in` / `flutter_facebook_auth`，需各自填客户端 ID）。
   - **Firestore Database → 创建数据库**（先选生产模式也行，规则随后部署）。
4. 把第 2 步的两个配置文件放进工程：
   - `GoogleService-Info.plist` → 放到 `ios/Runner/` 并加入 Xcode 的 Runner target。
   - `google-services.json` → 放到 `android/app/`。
5. 生成真实配置（覆盖现在的空 `lib/firebase_options.dart`）：
   ```bash
   cd "D:/AI智能/产品文档/LittleLightV1"
   flutterfire configure
   ```
   它交互式让你选项目/应用，结束后自动写入 `lib/firebase_options.dart`。
6. 部署安全规则（禁止客户端自改 premium、允许本人读写消息）：
   ```bash
   firebase deploy --only firestore:rules
   ```

**验证点**：`lib/firebase_options.dart` 里不再是空字符串；`firebase deploy` 提示规则部署成功。

---

## 阶段 2：拿 OpenAI Key（只给后端，绝不进 App）

1. 打开 https://platform.openai.com → 登录/注册 → **API keys → Create secret key**。
2. 复制 key（形如 `sk-...`），**存到本机记事本**。
3. ⚠️ 这个 key 只在阶段 5 填进后端环境变量。App 包里绝对不能出现它（否则别人反编译就能盗刷你的账单）。

**验证点**：你手上有 `sk-...` 字符串，且确信它没写进任何 `.dart` 文件。

---

## 阶段 3：本地先验证"聊天 UI 能跑"（最简单，确认代码没问题）

先不碰后端，让 App 直连 OpenAI（仅本地调试用）：
```bash
cd "D:/AI智能/产品文档/LittleLightV1"
flutter run --dart-define=USE_BACKEND=false --dart-define=OPENAI_API_KEY=sk-你的key
```
（手机/模拟器上）和 Lumi 聊一句，应收到英文/中文回复。

**验证点**：能收到 Lumi 的真实回复 → 说明 `openai_service.dart`、UI、模型名都对。

> 这一步失败 = 代码/Flutter 环境有问题，先 `flutter pub get && flutter analyze` 修掉，再往下。

---

## 阶段 4：本地全栈联调（Firebase Emulator，不花一分钱）

目的：在**不接真实 Firebase / 不部署**的情况下，把"后端代理 + 每日 5 次限流 + 付费墙 + 对话历史持久化"整条链路跑通。

1. 在 `backend/` 下新建文件 `.env.local`（注意带点，本地专用，已被 gitignore）：
   ```
   OPENAI_API_KEY=sk-你的key
   DISABLE_AUTH=true
   FREE_DAILY_CHAT_LIMIT=5
   ```
   > `DISABLE_AUTH=true` 只在本地模拟器有效，生产 Cloud Functions 永远读不到它，所以线上鉴权不会被绕过。

2. 开一个终端启动模拟器（含 Firestore / Auth / Functions）：
   ```bash
   cd "D:/AI智能/产品文档/LittleLightV1/backend"
   bash start-emulators.sh
   ```
   看到 `functions[api]` 监听 `http://localhost:5001`、Firestore 在 `:8080`、Emulator UI 在 `:4000` 即成功。

3. 另开一个终端跑 App（连模拟器 + 后端走本地函数）：
   ```bash
   cd "D:/AI智能/产品文档/LittleLightV1"
   flutter run --dart-define=USE_EMULATORS=true --dart-define=BACKEND_URL=http://localhost:5001/api
   ```

4. 验证三件事：
   - **限流 + 付费墙**：连发 6 条 → 第 6 条输入框上方提示"今日免费次数已用完"，自动弹付费墙；点付费墙的 Upgrade（dev 模拟）可解锁继续聊。
   - **历史持久化**：发几条后**完全退出 App 再打开** → 历史还在（来自 Firestore 模拟器）。
   - **数据可见**：浏览器开 http://localhost:4000 → Firestore 里能看到 `users/{uid}` 的 `freeUsedCount` 和 `conversations/.../messages`。

**验证点**：限流弹墙 ✅、重开有历史 ✅、Emulator UI 能查到数据 ✅。

---

## 阶段 5：部署后端到 Cloud Functions（藏 Key + 服务端限流上线）

1. 登录 Firebase：
   ```bash
   firebase login
   ```
2. 给 Cloud Function 配置 secrets（这些环境变量只在函数运行时存在，不进代码）：
   - 打开 Firebase 控制台 → 你的项目 → **Functions → 设置（齿轮）→ 环境变量/密钥**。
   - 逐个添加以下密钥（值填你自己的）：
     | 密钥名 | 值 |
     |---|---|
     | `OPENAI_API_KEY` | 阶段 2 的 `sk-...` |
     | `FREE_DAILY_CHAT_LIMIT` | `5` |
     | `OPENAI_BASE_URL` | 留空（默认用 OpenAI 官方） |
     | `REVENUECAT_WEBHOOK_SECRET` | 阶段 6 拿到后补（先可空） |
     | `REVENUECAT_SECRET` | 阶段 6 拿到后补（先可空） |
   - 想在代码里改海外区域（默认 `us-central1`）：编辑 `backend/functions/index.js` 的 `region: 'us-central1'` → 改成 `europe-west1` 等离用户近的区域。
3. 部署函数（首次会要你选区域，跟着选即可）：
   ```bash
   cd "D:/AI智能/产品文档/LittleLightV1/backend"
   firebase deploy --only functions
   ```
4. 部署完终端会打印函数地址，形如：
   ```
   https://<region>-<project>.cloudfunctions.net/api
   ```
   复制它（后面当 `BACKEND_URL`）。

**验证点**：
```bash
curl https://<你的函数地址>/health
# 应返回 {"status":"ok",...}
```

---

## 阶段 6：RevenueCat 真实订阅

1. 注册 https://www.revenuecat.com → **New App**（建一个 iOS 版、一个 Android 版，或同一 App 下两个平台）。
2. 后台配置：
   - **Integrations**：连接 **App Store Connect** 与 **Google Play**（按向导授权）。
   - **Products**：建一个自动续期订阅，Product ID 建议 `premium_monthly`（价格你定）。
   - **Entitlements**：新建 Entitlement，**名称必须是 `premium`**（代码里写死了这个名）→ 把上面的商品关联进去。
3. 拿密钥：
   - **Project Settings → API Keys**：复制 iOS Key（`appl_...`）和 Android Key（`goog_...`）。
   - **Project Settings → Webhooks**：生成 Webhook 密钥（`whsec_...`）。
4. 配 Webhook：在 RevenueCat 的 Webhooks 里填目标 URL：
   ```
   https://<阶段5的函数地址>/webhooks/revenuecat
   ```
5. 回到 Firebase 控制台（阶段 5 第 2 步），补两个密钥：
   - `REVENUECAT_WEBHOOK_SECRET` = `whsec_...`
   - `REVENUECAT_SECRET` = RevenueCat 的 API Key（用于 App 购买后主动 `/v1/subscription/sync` 校验）
   然后重新部署一次让密钥生效：
   ```bash
   firebase deploy --only functions
   ```

**验证点**：用 RevenueCat 的 **Sandbox（沙盒）** 测试账号在 App 里走一遍购买 → 个人页应显示"Premium 已开通"；Firestore 的 `users/{uid}.isPremium` 变 `true`。

---

## 阶段 7：生产构建 & 上架

1. 生产构建（**只注入后端地址 + RevenueCat Key，绝不出现 dev 开关**）：
   ```bash
   cd "D:/AI智能/产品文档/LittleLightV1"
   flutter build apk --release \
     --dart-define=BACKEND_URL=https://<阶段5函数地址> \
     --dart-define=RC_IOS_KEY=appl_xxxx \
     --dart-define=RC_ANDROID_KEY=goog_xxxx

   # iOS 用：
   flutter build ios --release \
     --dart-define=BACKEND_URL=https://<阶段5函数地址> \
     --dart-define=RC_IOS_KEY=appl_xxxx \
     --dart-define=RC_ANDROID_KEY=goog_xxxx
   ```
   > 想换更聪明的模型（提升留存），编辑 `lib/config/app_config.dart` 把 `chatModel` 从 `gpt-4o-mini` 改成 `gpt-4o` 或 Claude，重新构建即可，接口不变。

2. **安全复查**：确认打包产物里没有明文 key。
   ```bash
   # 在打包目录搜 sk- 应为空
   grep -r "sk-" build/ 2>/dev/null || echo "OK: 包内无 OpenAI key"
   ```

3. 上架前自测：
   - 新用户：每天前 5 次免费，第 6 次弹付费墙。
   - 付费后：无限对话，重开 App 历史仍在。
   - "Restore Purchase"（个人页）能把已购状态同步回来。

4. 提交：
   - iOS：Xcode 里 Archive → TestFlight → 内部测试 → App Store 审核。
   - Android：上传 AAB 到 Google Play Console → 内部测试轨道 → 正式发布。

**验证点**：TestFlight / 内部测试里，一个新 Apple/Google 账号能完整走"免费 5 次 → 付费墙 → 真购买 → 无限聊"。

---

## 附 A：常用命令速查

```bash
# 本地直连 OpenAI（仅调试 UI）
flutter run --dart-define=USE_BACKEND=false --dart-define=OPENAI_API_KEY=sk-xxx

# 本地全栈（Emulator）
# 终端1：
cd backend && bash start-emulators.sh
# 终端2：
flutter run --dart-define=USE_EMULATORS=true --dart-define=BACKEND_URL=http://localhost:5001/api

# 部署
firebase deploy --only firestore:rules
firebase deploy --only functions

# 健康检查
curl https://<函数地址>/health
```

## 附 B：你大概率会卡的地方

- **`flutterfire configure` 找不到 iOS/Android 应用**：回到阶段 1 第 2 步，确认 Firebase 控制台里两个平台应用都已添加且包名一致。
- **Emulator 起不来**：确认本机装了 Java（Firebase 模拟器依赖）；端口 4000/5001/8080/9099 没被占用。
- **函数部署后 `/health` 返回 500**：去 Firebase 控制台 → Functions → 日志，看是不是 `OPENAI_API_KEY` 等 secret 没配或拼错。
- **App 购买后没变 Premium**：检查 RevenueCat 的 Entitlement 名是不是 `premium`（大小写敏感）；Webhook 地址是否指向线上函数 `/webhooks/revenuecat`。
- **海外延迟高**：把 `backend/functions/index.js` 的 `region` 改成 `europe-west1`，重新 `firebase deploy --only functions`。

---

## 当前代码已具备的能力（你不用再写）

- 模型：`gpt-4o-mini`（集中配置在 `lib/config/app_config.dart`，改一行即可升 `gpt-4o`）。
- 限流：后端 Firestore 每日 5 次原子扣减 + 跨天归零；客户端只显示剩余次数。
- 付费墙：`lib/screens/paywall_screen.dart`，未配 RevenueCat 时本地模拟。
- 订阅：`lib/services/subscription_service.dart`（RevenueCat，appUserID = Firebase uid）。
- 历史：`lib/services/chat_history_service.dart` → Firestore `users/{uid}/conversations/{cid}/messages`。
- 后端：`backend/functions/handler.js`（核心）+ `index.js`（Cloud Functions 入口），OpenAI Key 只在函数运行时。
- 安全：`firestore.rules` 禁止客户端把 `isPremium` 改成 true。
