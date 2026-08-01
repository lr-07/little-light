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

const SYSTEM_PROMPT = `You are Lumi, a warm and gentle AI companion — like a kind older sister or close friend who is always here to listen.

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

    const apiBody = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
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
