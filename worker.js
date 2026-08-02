addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

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

function isCasualGreeting(text) {
  var msg = text.trim().toLowerCase();
  var casualWords = ['hi', 'hey', 'hello', 'yo', 'sup', 'hii', 'heyy', 'helloo', 'hi!', 'hey!', 'hello!'];
  if (msg.length <= 5 && casualWords.some(function(w) { return msg === w || msg === w + '!'; })) return true;
  var casualPhrases = [
    'how are you', "how's it going", "how's your day", "what's up",
    'good morning', 'good afternoon', 'good evening', 'good night',
    'how r u', 'how have you been', 'whats up', 'wassup'
  ];
  if (casualPhrases.some(function(p) { return msg.indexOf(p) !== -1 || msg === p; })) return true;
  if (/^[😊😄🙂😃👋🙌💪❤️🎉👍✨]+$/.test(msg)) return true;
  return false;
}

function buildSystemPrompt(lastUserMessage) {
  var prompt = BASE_SYSTEM_PROMPT;

  if (isCasualGreeting(lastUserMessage)) {
    prompt += '\n\n## ⚡ IMPORTANT: The user just sent a casual greeting or small talk.\nThis is NOT a cry for help. This is NOT emotional distress.\nJust say hello back warmly and naturally, like a friend would.\nExamples: "Hey there! Nice to see you. How\'s your day going?" or "Hi! ☺️ What\'s on your mind today?"\nDO NOT say anything like "sounds hard", "carry this alone", "must have hurt", "feel better", "here for you in this".';
  }

  return prompt;
}

async function handleRequest(request) {
  var env = typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : {});

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  var url = new URL(request.url);

  if (url.pathname === '/api/chat') {
    return handleChat(request);
  }

  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: corsHeaders(),
  });
}

async function handleChat(request) {
  try {
    // 在 Cloudflare Worker 中，环境变量通过全局变量访问
    var apiKey = (typeof OPENAI_API_KEY !== 'undefined') ? OPENAI_API_KEY : '';
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not set. Add it in Worker Settings → Variables.' }), { status: 500, headers: corsHeaders() });
    }

    var body = await request.json();
    var messages = body.messages || [];

    var lastUserMsg = messages.length > 0
      ? (messages[messages.length - 1].content || '')
      : '';

    var apiBody = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt(lastUserMsg) },
      ].concat(messages.slice(-10)),
      temperature: 0.7,
      max_tokens: 150,
    });

    var response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: apiBody,
    });

    var data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({
        error: data.error ? data.error.message : 'API error',
      }), { status: response.status, headers: corsHeaders() });
    }

    return new Response(JSON.stringify({
      reply: (data.choices && data.choices[0] && data.choices[0].message) ? data.choices[0].message.content : '',
    }), { headers: corsHeaders() });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
    }), { status: 500, headers: corsHeaders() });
  }
}
