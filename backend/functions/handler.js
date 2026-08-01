'use strict';

/**
 * LittleLightV1 后端请求处理器（共享核心）
 * ------------------------------------------------------------------
 * 本文件包含全部路由逻辑 + 配置 + Firebase Admin 初始化，被两处复用：
 *   1. standalone：../server.js 用原生 http 启动。
 *   2. Cloud Functions：./index.js 用 firebase-functions 的 onRequest 包裹。
 *
 * 职责（生产环境必须）：
 *   1. 持有 OpenAI Key（服务端环境变量），App 永远不直接接触 Key。
 *   2. 用 Firebase Admin 校验客户端传来的 Firebase ID Token，拿到 uid。
 *   3. 在 Firestore 做「每日免费 5 次」权威计数 + premium 校验。
 *   4. 代理转发到 OpenAI，并把响应原样回给 App（保持 OpenAI 格式）。
 *   5. 接收 RevenueCat Webhook / 主动同步，写 Firestore 的 isPremium。
 *
 * 依赖：只需 firebase-admin（Node 18+ 自带 fetch，无需其他包）。
 *   配置见 ../.env.example（standalone）或在 firebase 控制台配置 secrets。
 */

const crypto = require('crypto');
const { URL } = require('url');

// ---- 配置（来自环境变量，带默认值便于本地调试）----
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const FREE_LIMIT = parseInt(process.env.FREE_DAILY_CHAT_LIMIT || '5', 10);
const RC_WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET || ''; // Webhook 验签
const RC_SECRET = process.env.REVENUECAT_SECRET || ''; // RevenueCat API 密钥（主动同步用）

// ---- Firebase Admin 初始化 ----
let admin = null;
function initFirebase() {
  try {
    admin = require('firebase-admin');

    // Emulator 模式：firebase-tools 会注入 FIREBASE_CONFIG / *_EMULATOR_HOST，
    // 此时无需服务账号凭据即可初始化（用 projectId 占位即可连上本地模拟器）。
    const inEmulator =
      !!process.env.FIREBASE_CONFIG ||
      !!process.env.FUNCTIONS_EMULATOR ||
      !!process.env.FIRESTORE_EMULATOR_HOST;
    if (inEmulator) {
      let projectId = 'demo-littlelight';
      if (process.env.FIREBASE_CONFIG) {
        try {
          projectId = JSON.parse(process.env.FIREBASE_CONFIG).projectId || projectId;
        } catch (_) {}
      }
      if (!admin.apps.length) admin.initializeApp({ projectId });
      console.log(`[firebase] emulator mode, projectId=${projectId}`);
      return true;
    }

    let credential;
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      credential = admin.credential.applicationDefault();
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(sa);
    } else {
      console.warn('[warn] 未配置 Firebase 凭据，认证/计数将不可用。');
      return false;
    }
    if (!admin.apps.length) {
      admin.initializeApp({ credential });
    }
    return true;
  } catch (e) {
    console.error('[error] Firebase Admin 初始化失败：', e.message);
    return false;
  }
}
const firebaseReady = initFirebase();

// ---- 工具函数 ----
function todayStr() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

// 校验 Firebase ID Token，返回 uid；失败抛错
async function authenticate(req) {
  // ⚠️ 仅本地 / Emulator 联调快捷开关：跳过真实 token 校验，用固定 dev uid。
  // Firebase Emulator 本身就是本地环境；生产（Cloud Functions）绝不会设此变量，
  // 切勿用于任何线上部署——否则任何人都能以任意 uid 调用后端。
  if (process.env.DISABLE_AUTH === 'true') {
    return process.env.DEV_UID || 'dev-user';
  }
  const auth = req.headers['authorization'] || '';
  const m = auth.match(/^Bearer\s+(.+)$/);
  if (!m) throw Object.assign(new Error('missing token'), { code: 401 });
  if (!admin) throw Object.assign(new Error('auth disabled'), { code: 503 });
  const decoded = await admin.auth().verifyIdToken(m[1]);
  return decoded.uid;
}

// ---- OpenAI 转发 ----
async function callOpenAI(body) {
  const payload = {
    model: body.model || 'gpt-4o-mini',
    messages: body.messages || [],
    temperature: body.temperature ?? 0.7,
    max_tokens: body.max_tokens ?? 150,
  };
  const resp = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await resp.text();
  return { status: resp.status, text };
}

// ---- 聊天 + 限流（Firestore 事务保证原子）----
async function handleChat(req, res) {
  let uid;
  try {
    uid = await authenticate(req);
  } catch (e) {
    return sendJson(res, e.code || 401, { error: 'unauthorized', message: e.message });
  }

  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return sendJson(res, 400, { error: 'bad_request' });
  }

  const countQuota = body.countQuota !== false; // 默认 true（聊天计免费额度）
  const userRef = admin.firestore().collection('users').doc(uid);

  // 1) 配额检查 + 预占名额（事务）
  if (countQuota) {
    try {
      const decision = await admin.firestore().runTransaction(async (t) => {
        const snap = await t.get(userRef);
        const today = todayStr();
        const data = snap.exists
          ? snap.data()
          : { isPremium: false, freeUsedDate: today, freeUsedCount: 0 };
        if (data.isPremium) return { allowed: true, remaining: -1 };
        if (data.freeUsedDate !== today) {
          data.freeUsedDate = today;
          data.freeUsedCount = 0;
        }
        if (data.freeUsedCount >= FREE_LIMIT) {
          return { allowed: false, remaining: 0 };
        }
        data.freeUsedCount += 1; // 预占
        t.set(userRef, data, { merge: true });
        return { allowed: true, remaining: Math.max(0, FREE_LIMIT - data.freeUsedCount) };
      });
      if (!decision.allowed) {
        return sendJson(res, 402, {
          error: 'quota_exceeded',
          code: 'QUOTA_EXCEEDED',
          message: `Daily free limit of ${FREE_LIMIT} reached.`,
          remaining: 0,
        });
      }
    } catch (e) {
      console.error('[error] 配额事务失败：', e.message);
      return sendJson(res, 500, { error: 'quota_check_failed' });
    }
  }

  // 2) 转发 OpenAI
  try {
    const { status, text } = await callOpenAI(body);
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(text);
  } catch (e) {
    // 上游失败，回滚预占名额
    if (countQuota && admin) {
      try {
        await admin.firestore().runTransaction(async (t) => {
          const s = await t.get(userRef);
          if (s.exists) {
            const d = s.data();
            if (!d.isPremium) {
              d.freeUsedCount = Math.max(0, (d.freeUsedCount || 1) - 1);
              t.set(userRef, d, { merge: true });
            }
          }
        });
      } catch (_) {}
    }
    console.error('[error] OpenAI 调用失败：', e.message);
    return sendJson(res, 502, { error: 'upstream_failed' });
  }
}

// ---- 订阅状态主动同步（App 购买后调用，由后端用 RevenueCat API 校验）----
async function handleSubscriptionSync(req, res) {
  let uid;
  try {
    uid = await authenticate(req);
  } catch (e) {
    return sendJson(res, e.code || 401, { error: 'unauthorized' });
  }
  if (!RC_SECRET) {
    return sendJson(res, 503, { error: 'rc_not_configured' });
  }
  try {
    const resp = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(uid)}`, {
      headers: { Authorization: `Bearer ${RC_SECRET}`, 'Content-Type': 'application/json' },
    });
    const data = await resp.json();
    const entitlements = (data.subscriber && data.subscriber.entitlements) || {};
    const active = Object.values(entitlements).some(
      (e) => e.expires_date && new Date(e.expires_date) > new Date()
    );
    await admin.firestore().collection('users').doc(uid).set(
      { isPremium: active, premiumUpdatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
    return sendJson(res, 200, { isPremium: active });
  } catch (e) {
    console.error('[error] RevenueCat 同步失败：', e.message);
    return sendJson(res, 502, { error: 'rc_sync_failed' });
  }
}

// ---- RevenueCat Webhook（事件推送，权威写入 isPremium）----
function rcEventToPremium(evt) {
  const e = evt && evt.event;
  if (!e) return null;
  // 优先用 entitlements 实际生效时间判断
  if (e.entitlements) {
    const active = Object.values(e.entitlements).some(
      (ent) => ent.expires_date && new Date(ent.expires_date) > new Date()
    );
    return active;
  }
  const type = e.type;
  if (type === 'INITIAL_PURCHASE' || type === 'RENEWAL' || type === 'UNCANCELLATION') return true;
  if (type === 'CANCELLATION' || type === 'EXPIRATION' || type === 'PRODUCT_CHANGE') return false;
  return null;
}

async function handleRevenueCatWebhook(req, res) {
  const raw = await readBody(req);
  // 验签（配置了 secret 才校验）
  if (RC_WEBHOOK_SECRET) {
    const sig = req.headers['x-revenuecat-signature'] || '';
    const expected = crypto.createHmac('sha256', RC_WEBHOOK_SECRET).update(raw).digest('base64');
    if (sig !== expected) {
      return sendJson(res, 400, { error: 'bad_signature' });
    }
  }
  let evt;
  try {
    evt = JSON.parse(raw);
  } catch {
    return sendJson(res, 400, { error: 'bad_json' });
  }
  const appUserId = evt.event && evt.event.app_user_id;
  const premium = rcEventToPremium(evt);
  if (appUserId && premium !== null && admin) {
    try {
      await admin.firestore().collection('users').doc(appUserId).set(
        { isPremium: premium, premiumUpdatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
    } catch (e) {
      console.error('[error] 写 isPremium 失败：', e.message);
    }
  }
  return sendJson(res, 200, { status: 'ok' });
}

// ---- 路由入口（被 server.js 与 functions/index.js 复用）----
// req/res 兼容原生 http 与 Cloud Functions onRequest（Express 风格）。
async function requestHandler(req, res) {
  // Cloud Functions / 部分网关会把路径放在 req.path；原生 http 用 req.url。统一取 pathname。
  const rawPath = req.url || req.path || '/';
  const url = new URL(rawPath, 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(res, 200, { ok: true, firebase: firebaseReady, freeLimit: FREE_LIMIT });
    }
    if (req.method === 'POST' && url.pathname === '/v1/chat') {
      return await handleChat(req, res);
    }
    if (req.method === 'POST' && url.pathname === '/v1/subscription/sync') {
      return await handleSubscriptionSync(req, res);
    }
    if (req.method === 'POST' && url.pathname === '/webhooks/revenuecat') {
      return await handleRevenueCatWebhook(req, res);
    }
    return sendJson(res, 404, { error: 'not_found' });
  } catch (e) {
    console.error('[error] 未处理异常：', e);
    return sendJson(res, 500, { error: 'internal' });
  }
}

module.exports = { requestHandler, firebaseReady };
