const SYSTEM_PROMPT = `You are Lumi, a gentle AI companion.

## Personality Traits
- Gentle, quiet, patient
- Strong empathy
- Encouraging
- Never judgmental

## Communication Rules
1. Empathize first: Acknowledge the user's feelings before anything else
2. Acknowledgment: Validate their experience
3. Gentle question: Invite them to share more if they want
4. Keep it brief: Short, concise replies
5. No lecturing: Avoid "You should..."
6. No solutions: Don't give advice or step-by-step methods
7. No mentoring: Don't act as a teacher
8. Talk like a mature, understanding older sister

## Response Pattern
[Empathy] + [Acknowledgment] + [Gentle Question]

## Example Responses
User: I hate my job.
Lumi: That sounds really exhausting. Thank you for telling me. Do you want to tell me what happened today?

User: I got fired today.
Lumi: I'm really sorry that happened. That must have hurt. Do you want to tell me what happened?

## Forbidden Language
- "You should..."
- "You need to..."
- "Try this..."
- "The solution is..."
- "Here's what you can do..."
- "Let me teach you..."

## Tone Guidelines
- Warm, caring, and supportive
- Calm and steady
- Avoid being overly enthusiastic
- Avoid being clinical or robotic
- Use natural, conversational English

## Emergency Protocol
If user mentions self-harm or suicide:
1. Express concern
2. Provide resources
3. Continue to offer support`;

const QUOTE_PROMPT = 'You are a source of gentle wisdom. Generate a short, comforting quote for someone going through difficult times. Keep it under 50 characters. Make it feel warm and supportive.';

const API_URL = 'https://api.deepseek.com/v1/chat/completions';

// The API key should be set as a Worker secret named DEEPSEEK_API_KEY
// For setup: Cloudflare Dashboard -> Workers & Pages -> Worker -> Settings -> Variables
const API_KEY = (typeof DEEPSEEK_API_KEY !== 'undefined') ? DEEPSEEK_API_KEY : '';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

async function callDeepSeek(messages, model = 'deepseek-chat', maxTokens = 150, temperature = 0.7) {
  if (!API_KEY) {
    throw new Error('API key not configured. Please set DEEPSEEK_API_KEY secret.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'API error');
  }

  return data.choices?.[0]?.message?.content || '';
}

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  const url = new URL(request.url);

  if (url.pathname === '/health') {
    const configured = !!API_KEY;
    return new Response(JSON.stringify({ 
      status: 'ok', 
      apiKeyConfigured: configured 
    }), { headers: corsHeaders() });
  }

  if (url.pathname === '/api/chat') {
    try {
      const body = await request.json();
      const messages = body.messages || [];

      const aiResponse = await callDeepSeek(
        [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        'deepseek-chat',
        150,
        0.7
      );

      return new Response(JSON.stringify({ reply: aiResponse }), {
        headers: corsHeaders(),
      });
    } catch (error) {
      const isConfigError = error.message?.includes('not configured');
      return new Response(JSON.stringify({ 
        error: isConfigError ? 'API key not configured' : error.message,
        setupNeeded: isConfigError 
      }), {
        status: isConfigError ? 503 : 500,
        headers: corsHeaders(),
      });
    }
  }

  if (url.pathname === '/api/quote') {
    try {
      const quote = await callDeepSeek(
        [
          { role: 'system', content: QUOTE_PROMPT },
          { role: 'user', content: 'Give me a gentle quote for today.' },
        ],
        'deepseek-chat',
        60,
        0.8
      );

      return new Response(JSON.stringify({ quote }), {
        headers: corsHeaders(),
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders(),
      });
    }
  }

  return new Response('Not found', { status: 404, headers: corsHeaders() });
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});