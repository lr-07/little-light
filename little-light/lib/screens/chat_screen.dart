import 'package:flutter/material.dart';
import '../theme.dart';
import '../services/openai_service.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final OpenAIService _openAIService = OpenAIService('');
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

  void _sendMessage() {
    final text = _inputController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({'text': text, 'isUser': true});
      _inputController.clear();
      _isTyping = true;
    });

    _scrollToBottom();

    _getLumiResponse(text);
  }

  Future<void> _getLumiResponse(String userMessage) async {
    final apiMessages = _messages.map((msg) => {
      'role': msg['isUser'] ? 'user' : 'assistant',
      'content': msg['text'],
    }).toList();

    final response = await _openAIService.chat(apiMessages);

    if (!mounted) return;

    String lumiText;
    if (response != null) {
      lumiText = response;
    } else {
      final fallback = _fallbackResponses[DateTime.now().millisecondsSinceEpoch % _fallbackResponses.length];
      lumiText = '${fallback['empathy']} ${fallback['ack']} ${fallback['question']}';
    }

    setState(() {
      _isTyping = false;
      _messages.add({'text': lumiText, 'isUser': false});
    });

    _scrollToBottom();
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