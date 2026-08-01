// Little Light — Cloudflare Worker (v2)
//
// 改进点（相对 v1）：
//  - 模型对齐产品策略：优先 OpenAI gpt-4o-mini（海外低延迟/合规/SLA），
//    未配 OPENAI_API_KEY 时回退 DeepSeek deepseek-chat（不破坏现有部署）。
//  - /api/chat 支持多轮：客户端传完整 messages，Lumi 有记忆。
//  - 限流防刷：KV 可选绑定。绑定后按客户端 IP 做
//      · abuse 限流（默认 20 次/分钟，防烧 key）
//      · freemium 每日限额（默认 5 次/天，触发 402 → 前端弹付费墙）
//    未绑定 KV 时自动降级（仅前端本地计数），不报错。
//  - 危机干预：系统提示内嵌真实热线；命中关键词时强制注入资源。
//  - /api/quote：每日缓存一条温柔语录（KV 按天）。
//  - /api/community：KV 存匿名帖子 + Lumi 自动回复（GET 列表 / POST 发帖）。
//
// 部署：
//   wrangler secret put OPENAI_API_KEY        # 或 DEEPSEEK_API_KEY
//   wrangler kv namespace create little-light-kv   # 拿到 id 填进 wrangler.toml
//   wrangler deploy

const ABUSE_PER_MIN = 20;      // 硬性防刷：单 IP 每分钟最多请求数
const FREE_DAILY_LIMIT = 5;    // freemium：单 IP 每天免费对话数

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

// ---- 模型选择：OpenAI 优先，Groq 回退，DeepSeek 兜底 ----
function pickModel(env) {
  if (env.OPENAI_API_KEY) {
    return { url: 'https://api.openai.com/v1/chat/completions', key: env.OPENAI_API_KEY, model: 'gpt-4o-mini' };
  }
  if (env.GROQ_API_KEY) {
    return { url: 'https://api.groq.com/openai/v1/chat/completions', key: env.GROQ_API_KEY, model: 'llama-3.1-70b-versatile' };
  }
  if (env.DEEPSEEK_API_KEY) {
    return { url: 'https://api.deepseek.com/v1/chat/completions', key: env.DEEPSEEK_API_KEY, model: 'deepseek-chat' };
  }
  return null;
}

async function callLLM(env, messages, opts = {}) {
  const cfg = pickModel(env);
  if (!cfg) return null;
  try {
    const res = await fetch(cfg.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.key}` },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.max_tokens ?? 150,
      }),
    });
    if (!res.ok) {
      console.error(`[llm] upstream ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (e) {
    console.error('[llm] error', e.message);
    return null;
  }
}

function systemPrompt() {
  return `You are Lumi, a warm and gentle AI companion — like a kind older sister or close friend who is always here to listen.

## Personality
- Warm, calm, patient, genuinely caring.
- You listen without judgment.
- Natural conversational English.

## CRITICAL RULE: Match the user's mood exactly

### If the user greets casually or chats lightly:
These are CASUAL messages — just say hello back warmly and naturally. DO NOT assume anything is wrong.
Examples of casual: "hi", "hello", "hey", "how are you", "what's up", "good morning", 😊, "thanks"

GOOD responses to "hi":
- "Hey there! Nice to see you. How's your day going?"
- "Hi! I'm really glad you stopped by. What's on your mind today?"
- "Hey! ☺️ How are you doing?"

BAD responses to "hi" (NEVER say these):
- "I'm here with you in this." (assumes distress)
- "You don't have to carry this alone." (assumes burden)
- "That must have hurt." (assumes pain)
- "What would help you feel better?" (assumes they feel bad)
- Any response that sounds like crisis counseling for a simple greeting

### If the user shares something emotional or hard:
Then be gentle, acknowledge their feelings briefly (1-3 sentences), invite them to share more. No advice, no lecturing, no "You should...".

### General rules for ALL responses:
- Keep it short and natural.
- Don't over-apologize.
- Don't assume the worst.
- Don't use phrases like "carry this alone", "in this", "feel better" unless the user actually said something sad.

## Crisis support (ONLY when user mentions self-harm/suicide/hopelessness)
If the user clearly expresses self-harm, suicide, or deep hopelessness, gently express care and share real resources:
- US: 988 Suicide & Crisis Lifeline (call or text 988); Crisis Text Line: text HOME to 741741
- UK & Ireland: Samaritans 116 123
- EU: emergency number 112`;
}

const CRISIS_KEYWORDS = [
  'kill myself', 'suicide', 'suicidal', 'end my life', 'want to die', 'hurt myself',
  'self harm', 'cut myself', 'no reason to live', 'better off dead',
];

function detectCrisis(text) {
  const t = (text || '').toLowerCase();
  return CRISIS_KEYWORDS.some(k => t.includes(k));
}

const CRISIS_RESOURCE =
  "If you're in crisis, you don't have to face it alone: US 988 (call/text), " +
  "Crisis Text Line text HOME to 741741; UK/Ireland Samaritans 116 123; EU 112. " +
  "Please also reach out to someone you trust or a professional.";

// ---- 限流（KV 可选）----
async function checkAbuse(env, ip) {
  if (!env.KV) return { ok: true };
  const key = `abuse:${ip}`;
  const cur = parseInt((await env.KV.get(key)) || '0', 10);
  if (cur >= ABUSE_PER_MIN) return { ok: false };
  await env.KV.put(key, String(cur + 1), { expirationTtl: 60 });
  return { ok: true };
}

async function checkDaily(env, ip) {
  if (!env.KV) return { ok: true, remaining: FREE_DAILY_LIMIT };
  const key = `daily:${ip}:${todayStr()}`;
  const used = parseInt((await env.KV.get(key)) || '0', 10);
  if (used >= FREE_DAILY_LIMIT) return { ok: false, remaining: 0 };
  return { ok: true, remaining: FREE_DAILY_LIMIT - used };
}

async function incDaily(env, ip) {
  if (!env.KV) return;
  const key = `daily:${ip}:${todayStr()}`;
  const used = parseInt((await env.KV.get(key)) || '0', 10);
  await env.KV.put(key, String(used + 1), { expirationTtl: 86400 * 2 });
}

// ---- 社区（KV 可选）----
const SAMPLE_POSTS = [
  { id: 1, author: 'Anonymous Friend', avatar: '🐰', time: '2 hours ago',
    content: "I feel so tired lately. Everything feels heavy, and I don't know how to keep going. But I'm trying.",
    reply: "I'm so sorry you're carrying this weight. It takes so much courage just to keep trying. Thank you for being here and sharing this with us." },
  { id: 2, author: 'Anonymous Friend', avatar: '🐱', time: '5 hours ago',
    content: "Today was a good day. I went for a walk and saw a beautiful sunset. Sometimes the small moments are the ones that matter most.",
    reply: "That sounds so lovely. Celebrating the small moments is such a kind thing to do for yourself. Thank you for sharing this light with us." },
  { id: 3, author: 'Anonymous Friend', avatar: '🐻', time: 'Yesterday',
    content: "I got rejected for the job I really wanted. I've been applying for months and nothing is working. I'm starting to doubt myself.",
    reply: "Rejection is so hard, especially when you've put so much into it. Your worth isn't defined by one job or one 'no.' I believe in you, even when you can't." },
];

const AVATARS = ['🐰', '🐱', '🐻', '🐨', '🐧', '🦊', '🐼', '🐯'];

async function getCommunity(env) {
  if (!env.KV) return SAMPLE_POSTS;
  const raw = await env.KV.get('community_posts');
  if (!raw) {
    await env.KV.put('community_posts', JSON.stringify(SAMPLE_POSTS));
    return SAMPLE_POSTS;
  }
  try { return JSON.parse(raw); } catch { return SAMPLE_POSTS; }
}

async function addCommunity(env, text) {
  const posts = await getCommunity(env);
  const reply = await callLLM(env, [
    { role: 'system', content: 'You are Lumi replying to an anonymous community post in a mental-health app. Be warm, brief (under 2 sentences), validating. No advice, no lecturing.' },
    { role: 'user', content: text },
  ], { max_tokens: 120 });
  const post = {
    id: Date.now(),
    author: 'Anonymous Friend',
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    time: 'Just now',
    content: text,
    reply: reply || "Thank you for sharing this. You are not alone here.",
  };
  posts.unshift(post);
  if (posts.length > 50) posts.length = 50;
  if (env.KV) await env.KV.put('community_posts', JSON.stringify(posts));
  return post;
}

async function getQuote(env) {
  const day = todayStr();
  if (env.KV) {
    const cached = await env.KV.get('quote:' + day);
    if (cached) return cached;
  }
  const q = await callLLM(env, [
    { role: 'system', content: 'You are a source of gentle wisdom. Generate ONE short, comforting quote for someone going through difficult times. Under 50 characters. Warm and supportive. No quotation marks.' },
    { role: 'user', content: 'Give me today\'s gentle quote.' },
  ], { max_tokens: 60, temperature: 0.8 });
  const quote = (q || '').trim().replace(/^["']|["']$/g, '') || "You are doing better than you think.";
  if (env.KV) await env.KV.put('quote:' + day, quote, { expirationTtl: 86400 });
  return quote;
}

// ---- 路由 ----
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const path = url.pathname;

    if (path === '/api/chat' && request.method === 'POST') {
      const abuse = await checkAbuse(env, ip);
      if (!abuse.ok) return json({ error: 'rate_limited' }, 429);

      const daily = await checkDaily(env, ip);
      if (!daily.ok) return json({ error: 'quota_exceeded', remaining: 0 }, 402);

      let body;
      try { body = await request.json(); } catch { body = {}; }
      const messages = Array.isArray(body.messages) ? body.messages : [];

      if (!pickModel(env)) {
        return json({ error: 'no_model_configured' }, 503);
      }

      const sys = [{ role: 'system', content: systemPrompt() }];
      let reply = await callLLM(env, [...sys, ...messages]);

      // 危机关键词命中：在回复后强制补一段真实资源
      const lastUser = [...messages].reverse().find(m => m.role === 'user');
      if (detectCrisis(lastUser?.content)) {
        reply = (reply ? reply + '\n\n' : '') + CRISIS_RESOURCE;
      }

      if (!reply) return json({ reply: '', fallback: true }, 502);

      await incDaily(env, ip);
      return json({ reply, remaining: Math.max(0, daily.remaining - 1) });
    }

    if (path === '/api/quote' && request.method === 'GET') {
      const quote = await getQuote(env);
      return json({ quote });
    }

    if (path === '/api/community') {
      if (request.method === 'GET') {
        const posts = await getCommunity(env);
        return json({ posts });
      }
      if (request.method === 'POST') {
        let text = '';
        try { text = (await request.json()).text || ''; } catch {}
        text = String(text).trim().slice(0, 500);
        if (!text) return json({ error: 'empty' }, 400);
        const post = await addCommunity(env, text);
        return json({ post });
      }
    }

    return new Response('Not found', { status: 404 });
  },
};
