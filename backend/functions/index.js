'use strict';

/**
 * LittleLightV1 后端 —— Cloud Functions 入口（2nd gen）。
 *
 * 直接复用 ../handler.js 的 requestHandler，逻辑与 standalone 完全一致，
 * 所以「少部署一样东西」：把后端折进 Firebase 项目，不再单独跑一台服务。
 *
 * 部署：在 backend/ 下执行  firebase deploy --only functions
 *   （需先在 firebase.json 把 functions 源码目录指向 backend/functions）
 *
 * 重要：
 *   - secrets（OPENAI_API_KEY 等）在 Firebase 控制台 → Functions → 环境变量/密钥 中配置，
 *     或本地用 .secret.local 文件；不要写进代码/提交 git。
 *   - 函数级不开启 IAM 鉴权（invoker: public），真正的鉴权走请求里的 Firebase ID Token。
 */

const { onRequest } = require('firebase-functions/v2/https');
const { requestHandler, firebaseReady } = require('./handler');

if (!firebaseReady) {
  console.warn('[warn] Firebase Admin 未就绪，函数仍可启动但认证/计数会失败。请在密钥中配置 FIREBASE_SERVICE_ACCOUNT 或 GOOGLE_APPLICATION_CREDENTIALS。');
}

// 导出为名为 `api` 的 HTTPS 函数：调用地址形如  https://<region>-<project>.cloudfunctions.net/api
exports.api = onRequest(
  {
    region: 'us-central1', // 海外产品建议选离用户近的区域，如 europe-west1
    invoker: 'public', // 公开可调用；鉴权由请求内的 Firebase ID Token 完成
    timeoutSeconds: 60,
    memory: '256MiB',
    // 下列密钥需在 Firebase 控制台配置；缺失时函数仍可部署，仅对应功能不可用。
    secrets: ['OPENAI_API_KEY', 'OPENAI_BASE_URL', 'FREE_DAILY_CHAT_LIMIT', 'REVENUECAT_WEBHOOK_SECRET', 'REVENUECAT_SECRET'],
  },
  (req, res) => requestHandler(req, res)
);
