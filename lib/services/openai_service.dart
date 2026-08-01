import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

/// 服务端判定免费额度用尽时抛出，UI 据此弹付费墙。
class QuotaExceededException implements Exception {
  final String message;
  const QuotaExceededException(this.message);
  @override
  String toString() => 'QuotaExceededException: $message';
}

class OpenAIService {
  static const String _openAiBaseUrl = 'https://api.openai.com/v1';
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

  /// 统一构造发往 OpenAI / 后端的请求体。
  Map<String, dynamic> _buildBody(
    List<Map<String, String>> messages, {
    required String systemPrompt,
    double temperature = 0.7,
    int maxTokens = 150,
    bool countQuota = true,
  }) {
    return {
      'model': AppConfig.chatModel,
      'messages': [
        {'role': 'system', 'content': systemPrompt},
        ...messages.map((msg) => {
              'role': msg['role'],
              'content': msg['content'],
            }),
      ],
      'temperature': temperature,
      'max_tokens': maxTokens,
      'countQuota': countQuota, // 仅后端模式识别；直连模式被 OpenAI 忽略
    };
  }

  /// 解析 OpenAI 格式响应，取出回复文本。
  String? _parseContent(String body) {
    try {
      final data = jsonDecode(body);
      return data['choices']?[0]?['message']?['content'] as String?;
    } catch (_) {
      return null;
    }
  }

  // ---------- 后端模式（生产）----------
  Future<String?> _callBackend(Map<String, dynamic> body) async {
    final user = FirebaseAuth.instance.currentUser;
    final idToken = await user?.getIdToken();
    if (idToken == null) {
      // 未登录：理论上 AuthGate 已拦截；这里兜底返回 null 走兜底话术。
      return null;
    }
    final resp = await http.post(
      Uri.parse('${AppConfig.backendBaseUrl}/v1/chat'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $idToken',
      },
      body: jsonEncode(body),
    );
    if (resp.statusCode == 200) {
      return _parseContent(resp.body);
    } else if (resp.statusCode == 402) {
      // 服务端判定额度用尽
      throw const QuotaExceededException('Daily free limit reached.');
    } else {
      print('Backend error: ${resp.statusCode} ${resp.body}');
      return null;
    }
  }

  // ---------- 本地直连模式（仅 dev）----------
  Future<String?> _callDirect(Map<String, dynamic> body) async {
    final resp = await http.post(
      Uri.parse('$_openAiBaseUrl/chat/completions'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${AppConfig.openAiApiKey}',
      },
      body: jsonEncode(body),
    );
    if (resp.statusCode == 200) return _parseContent(resp.body);
    print('OpenAI API error: ${resp.statusCode}');
    return null;
  }

  Future<String?> _dispatch(Map<String, dynamic> body) async {
    if (AppConfig.useBackend) return _callBackend(body);
    if (AppConfig.openAiApiKey.isEmpty) {
      print('DEV: 未配置 OPENAI_API_KEY 且未启用后端，返回 null');
      return null;
    }
    return _callDirect(body);
  }

  Future<String?> chat(List<Map<String, String>> messages) async {
    final body = _buildBody(messages, systemPrompt: _lumiSystemPrompt);
    return _dispatch(body);
  }

  Future<String?> generateDailyQuote() async {
    final body = _buildBody(
      [
        {
          'role': 'user',
          'content': 'Give me a gentle quote for today.',
        }
      ],
      systemPrompt:
          'You are a source of gentle wisdom. Generate a short, comforting quote for someone going through difficult times. Keep it under 50 characters. Make it feel warm and supportive.',
      temperature: 0.8,
      maxTokens: 60,
      countQuota: false, // 每日一句不算免费额度
    );
    return _dispatch(body);
  }

  Future<String?> generateCommunityReply(String postContent) async {
    final body = _buildBody(
      [
        {
          'role': 'user',
          'content': 'Post: $postContent\n\nRespond as Lumi:',
        }
      ],
      systemPrompt: '''You are Lumi, a gentle AI companion responding to an anonymous community post. 
            Be empathetic and supportive. Keep your reply short (under 100 characters). 
            Validate their feelings and offer gentle encouragement.''',
      temperature: 0.7,
      maxTokens: 120,
      countQuota: false, // 社区回复不算免费额度
    );
    return _dispatch(body);
  }
}
