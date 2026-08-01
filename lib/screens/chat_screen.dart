import 'package:flutter/material.dart';
import '../theme.dart';
import '../config/app_config.dart';
import '../services/openai_service.dart';
import '../services/usage_service.dart';
import '../services/chat_history_service.dart';
import 'paywall_screen.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final OpenAIService _openAIService = OpenAIService();
  late UsageService _usageService;
  ChatHistoryService? _historyService;
  int _remainingFree = AppConfig.freeDailyChatLimit;
  List<Map<String, dynamic>> _messages = [
    {'text': 'Hi, I\'m Lumi. How are you feeling today?', 'isUser': false},
  ];
  bool _isTyping = false;

  final List<Map<String, String>> _fallbackResponses = [
    {'empathy': 'That sounds really hard.', 'ack': 'Thank you for telling me.', 'question': 'Do you want to share more?'},
    {'empathy': 'I can hear how much this weighs on you.', 'ack': 'It takes courage to talk about this.', 'question': 'How long have you been feeling this way?'},
    {'empathy': 'I\'m so sorry you\'re going through this.', 'ack': 'Whatever you\'re feeling is valid.', 'question': 'Is there anything I can do to help?'},
    {'empathy': 'That must have hurt.', 'ack': 'You\'re not alone in this.', 'question': 'What was the hardest part for you?'},
    {'empathy': 'It sounds like you\'ve been carrying a lot.', 'ack': 'I admire your strength for keeping going.', 'question': 'Would you like to talk about it more?'},
    {'empathy': 'I can imagine how exhausting that is.', 'ack': 'Thank you for trusting me with this.', 'question': 'What do you need right now?'},
    {'empathy': 'That doesn\'t sound fair.', 'ack': 'Your feelings matter.', 'question': 'How have you been coping?'},
    {'empathy': 'I\'m here with you in this.', 'ack': 'You don\'t have to carry this alone.', 'question': 'What would help you feel better today?'},
  ];

  @override
  void initState() {
    super.initState();
    _initUsage();
    _initHistory();
  }

  /// 恢复对话历史。Firebase 未配置时返回 null，仅用内存态（保留默认问候语）。
  Future<void> _initHistory() async {
    _historyService = await ChatHistoryService.create();
    if (_historyService == null) return; // 无 Firebase，纯内存
    try {
      final loaded = await _historyService!.loadMessages();
      // 有历史则替换默认问候语；空则保留问候语（新会话）
      if (loaded.isNotEmpty && mounted) {
        setState(() => _messages = loaded);
      }
    } catch (e) {
      print('ChatHistory load failed: $e');
    }
  }

  /// 持久化一条消息（失败仅打印，不影响聊天）。Firebase 未配置时静默跳过。
  void _persist(String role, String text) {
    _historyService?.appendMessage(role, text);
  }

  /// 开始新对话：清空 Firestore 历史并重置 UI 为默认问候语。
  /// 注意：不清空每日免费额度（那是按自然日计算的，与「新对话」无关）。
  Future<void> _startNewConversation() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Start a new conversation?'),
        content: const Text('Your current chat history will be cleared.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Start new'),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    await _historyService?.clear(); // 清空 Firestore 历史（失败仅打印）
    if (mounted) {
      setState(() {
        _messages = [
          {'text': 'Hi, I\'m Lumi. How are you feeling today?', 'isUser': false},
        ];
      });
      _scrollToBottom();
    }
  }

  Future<void> _initUsage() async {
    try {
      _usageService = await UsageService.create();
      final left = await _usageService.remainingFree();
      if (mounted) setState(() => _remainingFree = left);
    } catch (e) {
      // dev 早期 Firebase 未配置时兜底：显示满额，不让页面崩
      print('UsageService init failed: $e');
      if (mounted) setState(() => _remainingFree = AppConfig.freeDailyChatLimit);
    }
  }

  Future<void> _sendMessage() async {
    final text = _inputController.text.trim();
    if (text.isEmpty) return;

    // Freemium 限流：免费额度用尽且未订阅 → 弹付费墙
    if (!await _usageService.canChatFree()) {
      _showPaywall();
      return;
    }

    setState(() {
      _messages.add({'text': text, 'isUser': true});
      _inputController.clear();
      _isTyping = true;
    });

    _persist('user', text); // 持久化用户消息
    _scrollToBottom();

    _getLumiResponse(text);
  }

  Future<void> _getLumiResponse(String userMessage) async {
    final apiMessages = _messages.map((msg) => {
      'role': msg['isUser'] ? 'user' : 'assistant',
      'content': msg['text'],
    }).toList();

    String? response;
    try {
      response = await _openAIService.chat(apiMessages);
    } on QuotaExceededException {
      // 服务端判定免费额度用尽 → 弹付费墙
      if (mounted) {
        setState(() => _isTyping = false);
        _showPaywall();
      }
      return;
    } catch (e) {
      print('chat error: $e');
    }

    if (!mounted) return;

    String lumiText;
    if (response != null) {
      lumiText = response;
    } else {
      final fallback = _fallbackResponses[DateTime.now().millisecondsSinceEpoch % _fallbackResponses.length];
      lumiText = '${fallback['empathy']} ${fallback['ack']} ${fallback['question']}';
    }

    // 真实 AI 回复才刷新剩余次数（权威值来自后端扣减后的 Firestore）
    if (response != null) {
      final left = await _usageService.refresh();
      if (mounted) setState(() => _remainingFree = left);
    }

    setState(() {
      _isTyping = false;
      _messages.add({'text': lumiText, 'isUser': false});
    });

    _persist('assistant', lumiText); // 持久化 Lumi 回复
    _scrollToBottom();
  }

  void _showPaywall() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const PaywallScreen()),
    ).then((_) {
      // 订阅成功后刷新剩余次数
      _usageService.remainingFree().then((left) {
        if (mounted) setState(() => _remainingFree = left);
      });
    });
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: LittleLightTheme.secondary,
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Center(child: Text('🐱', style: TextStyle(fontSize: 24))),
            ),
            const SizedBox(width: 12),
            const Text('Lumi'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_comment_outlined),
            tooltip: 'Start new conversation',
            onPressed: _startNewConversation,
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(LittleLightTheme.spacingMd),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length && _isTyping) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: _TypingIndicator(),
                    ),
                  );
                }
                final message = _messages[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: MessageBubble(
                    text: message['text'],
                    isUser: message['isUser'],
                  ),
                );
              },
            ),
          ),
          if (_remainingFree >= 0)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text(
                '$_remainingFree free ${_remainingFree == 1 ? 'chat' : 'chats'} left today',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(opacity: 0.6),
                textAlign: TextAlign.center,
              ),
            )
          else
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text(
                'Premium · unlimited chats',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(opacity: 0.6),
                textAlign: TextAlign.center,
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(LittleLightTheme.spacingMd),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _inputController,
                    decoration: const InputDecoration(
                      hintText: 'Tell me anything...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.all(Radius.circular(24)),
                      ),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: _sendMessage,
                  style: ElevatedButton.styleFrom(
                    shape: const CircleBorder(),
                    padding: const EdgeInsets.all(14),
                  ),
                  child: const Icon(Icons.send),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TypingIndicator extends StatelessWidget {
  const _TypingIndicator();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: LittleLightTheme.secondary,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          _buildDot(),
          _buildDot(delay: 0.16),
          _buildDot(delay: 0.32),
        ],
      ),
    );
  }

  Widget _buildDot({double delay = 0}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 1400),
        curve: Curves.easeInOut,
        width: 6,
        height: 6,
        decoration: BoxDecoration(
          color: LittleLightTheme.button,
          borderRadius: BorderRadius.circular(3),
        ),
      ),
    );
  }
}