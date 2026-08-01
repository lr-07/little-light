import 'dart:convert';
import 'package:http/http.dart' as http;

class OpenAIService {
  static const String _baseUrl = 'https://api.openai.com/v1';
  final String _apiKey;

  OpenAIService(this._apiKey);

  static const String _lumiSystemPrompt = '''
You are Lumi, a gentle AI companion.

## Personality Traits
- Gentle, quiet, patient
- Strong empathy
- Encouraging
- Never judgmental

## Communication Rules
1. **Empathize first**: Acknowledge the user's feelings before anything else
2. **Acknowledge**: Validate their experience
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
3. Continue to offer support
''';

  Future<String?> chat(List<Map<String, String>> messages) async {
    try {
      final body = jsonEncode({
        'model': 'gpt-4o-mini',
        'messages': [
          {'role': 'system', 'content': _lumiSystemPrompt},
          ...messages.map((msg) => {
                'role': msg['role'],
                'content': msg['content'],
              }),
        ],
        'temperature': 0.7,
        'max_tokens': 150,
      });

      final response = await http.post(
        Uri.parse('$_baseUrl/chat/completions'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_apiKey',
        },
        body: body,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['choices'][0]['message']['content'] as String;
      } else {
        print('OpenAI API error: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('OpenAI request failed: $e');
      return null;
    }
  }

  Future<String?> generateDailyQuote() async {
    try {
      final body = jsonEncode({
        'model': 'gpt-4o-mini',
        'messages': [
          {
            'role': 'system',
            'content': 'You are a source of gentle wisdom. Generate a short, comforting quote for someone going through difficult times. Keep it under 50 characters. Make it feel warm and supportive.',
          },
          {'role': 'user', 'content': 'Give me a gentle quote for today.'},
        ],
        'temperature': 0.8,
        'max_tokens': 60,
      });

      final response = await http.post(
        Uri.parse('$_baseUrl/chat/completions'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_apiKey',
        },
        body: body,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['choices'][0]['message']['content'] as String;
      }
      return null;
    } catch (e) {
      print('Quote generation failed: $e');
      return null;
    }
  }

  Future<String?> generateCommunityReply(String postContent) async {
    try {
      final body = jsonEncode({
        'model': 'gpt-4o-mini',
        'messages': [
          {
            'role': 'system',
            'content': '''You are Lumi, a gentle AI companion responding to an anonymous community post. 
            Be empathetic and supportive. Keep your reply short (under 100 characters). 
            Validate their feelings and offer gentle encouragement.''',
          },
          {'role': 'user', 'content': 'Post: $postContent\n\nRespond as Lumi:'},
        ],
        'temperature': 0.7,
        'max_tokens': 120,
      });

      final response = await http.post(
        Uri.parse('$_baseUrl/chat/completions'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_apiKey',
        },
        body: body,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['choices'][0]['message']['content'] as String;
      }
      return null;
    } catch (e) {
      print('Community reply failed: $e');
      return null;
    }
  }
}