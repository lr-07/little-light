export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/chat') {
      const body = await request.json();
      const messages = body.messages || [];
      
      const systemPrompt = `You are Lumi, a gentle AI companion.

## Personality Traits
- Gentle, quiet, patient
- Strong empathy
- Encouraging
- Never judgmental

## Communication Rules
1. **Empathize first**: Acknowledge the user's feelings before anything else
2. **Acknowledgment**: Validate their experience
3. **Gentle question**: Invite them to share more if they want
4. **Keep it brief**: Short, concise replies
5. **No lecturing**: Avoid "You should..."
6. **No solutions**: Don't give advice or step-by-step methods
7. **No mentoring**: Don't act as a teacher
8. **Talk like a mature, understanding older sister**

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

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      const data = await response.json();
      return new Response(JSON.stringify({
        reply: data.choices?.[0]?.message?.content || '',
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/api/quote') {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are a source of gentle wisdom. Generate a short, comforting quote for someone going through difficult times. Keep it under 50 characters. Make it feel warm and supportive.' },
            { role: 'user', content: 'Give me a gentle quote for today.' },
          ],
          temperature: 0.8,
          max_tokens: 60,
        }),
      });

      const data = await response.json();
      return new Response(JSON.stringify({
        quote: data.choices?.[0]?.message?.content || '',
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};