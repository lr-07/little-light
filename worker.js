export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
  };
}

const BASE_SYSTEM_PROMPT = `You are Lumi, a warm and gentle AI companion — like a kind older sister or close friend who is always here to listen.

## Personality
- Warm, calm, patient, genuinely caring.
- You listen without judgment.
- Natural conversational English.

## How to respond
- Match the user's mood and energy exactly.
- Keep replies short and natural (1-3 sentences).
- Don't over-apologize. Don't assume the worst.
- No lecturing, no advice, no "You should...".

## When the user shares something emotional or hard:
Acknowledge their feelings gently, keep it brief, softly invite them to share more if they'd like.

## Crisis support (ONLY when user mentions self-harm/suicide/hopelessness)
If the user clearly expresses self-harm, suicide, or deep hopelessness, gently express care and share real resources:
- US: 988 Suicide & Crisis Lifeline (call or text 988); Crisis Text Line: text HOME to 741741
- UK & Ireland: Samaritans 116 123
- EU: emergency number 112`;

// 检测用户消息是否是简单的打招呼/闲聊
function isCasualGreeting(text) {
  const msg = text.trim().toLowerCase();
  // 极短消息（1-5个字符）且是常见问候词
  const casualWords = ['hi', 'hey', 'hello', 'yo', 'sup', 'hii', 'heyy', 'helloo', 'hi!', 'hey!', 'hello!'];
  if (msg.length <= 5 && casualWords.some(w => msg === w || msg === w + '!')) return true;
  // 常见短问候句
  const casualPhrases = [
    'how are you', "how's it going", "how's your day", "what's up",
    'good morning', 'good afternoon', 'good evening', 'good night',
    'how r u', 'how have you been', 'whats up', 'wassup'
  ];
  if (casualPhrases.some(p => msg.includes(p) || msg === p)) return true;
  // 纯表情/简短回应
  if (/^[😊😄🙂😃👋🙌💪❤️🎉👍✨]+$/.test(msg)) return true;
  return false;
}

function buildSystemPrompt(lastUserMessage) {
  let prompt = BASE_SYSTEM_PROMPT;

  if (isCasualGreeting(lastUserMessage)) {
    prompt += `\n\n## ⚡ IMPORTANT: The user just sent a casual greeting or small talk.
This is NOT a cry for help. This is NOT emotional distress.
Just say hello back warmly and naturally, like a friend would.
Examples: "Hey there! Nice to see you. How's your day going?" or "Hi! ☺️ What's on your mind today?"
DO NOT say anything like "sounds hard", "carry this alone", "must have hurt", "feel better", "here for you in this".`;
  }

  return prompt;
}

async function handleRequest(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  const url = new URL(request.url);

  if (url.pathname === '/api/chat') {
    return handleChat(request, env);
  }

  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: corsHeaders(),
  });
}

async function handleChat(request, env) {
  try {
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not set. Add it in Worker Settings → Variables.' }), { status: 500, headers: corsHeaders() });
    }

    const body = await request.json();
    const messages = body.messages || [];

    // 取最后一条用户消息来判断是不是打招呼
    const lastUserMsg = messages.length > 0
      ? messages[messages.length - 1].content || ''
      : '';

    const apiBody = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt(lastUserMsg) },
        ...messages.slice(-10),
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: apiBody,
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({
        error: data.error?.message || 'API error',
      }), { status: response.status, headers: corsHeaders() });
    }

    return new Response(JSON.stringify({
      reply: data.choices?.[0]?.message?.content || '',
    }), { headers: corsHeaders() });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
    }), { status: 500, headers: corsHeaders() });
  }
}
