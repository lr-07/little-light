import 'package:flutter/material.dart';
import 'package:little_light/theme.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  final List<Map<String, dynamic>> _posts = [
    {
      'avatar': '🐰',
      'author': 'Anonymous Friend',
      'time': '2 hours ago',
      'content': 'I feel so tired lately. Everything feels heavy, and I don\'t know how to keep going. But I\'m trying.',
      'aiReply': 'I\'m so sorry you\'re carrying this weight. It takes so much courage just to keep trying. Thank you for being here and sharing this with us.',
      'hugs': 12,
      'encouraged': false,
    },
    {
      'avatar': '🐱',
      'author': 'Anonymous Friend',
      'time': '5 hours ago',
      'content': 'Today was a good day. I went for a walk and saw a beautiful sunset. Sometimes the small moments are the ones that matter most.',
      'aiReply': 'That sounds so lovely. Celebrating the small moments is such a kind thing to do for yourself. Thank you for sharing this light with us.',
      'hugs': 28,
      'encouraged': false,
    },
    {
      'avatar': '🐻',
      'author': 'Anonymous Friend',
      'time': 'Yesterday',
      'content': 'I got rejected for the job I really wanted. I\'ve been applying for months and nothing is working. I\'m starting to doubt myself.',
      'aiReply': 'Rejection is so hard, especially when you\'ve put so much into it. Your worth isn\'t defined by one job or one "no." I believe in you, even when you can\'t.',
      'hugs': 45,
      'encouraged': false,
    },
  ];

  void _hugPost(int index) {
    setState(() {
      _posts[index]['hugs']++;
    });
  }

  void _encouragePost(int index) {
    setState(() {
      _posts[index]['encouraged'] = true;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Your encouragement has been sent 💝'),
        backgroundColor: LittleLightTheme.secondary,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Tree Hole'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(LittleLightTheme.spacingLg),
        child: Column(
          children: [
            LumiCard(
              padding: const EdgeInsets.all(LittleLightTheme.spacingLg),
              child: const Column(
                children: [
                  Text('Anonymous Sharing', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                  SizedBox(height: 8),
                  Text('Share your thoughts. You\'re not alone.', style: TextStyle(fontSize: 14, opacity: 0.7)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _posts.length,
              itemBuilder: (context, index) {
                final post = _posts[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: LumiCard(
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: LittleLightTheme.secondary,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Center(child: Text(post['avatar'], style: const TextStyle(fontSize: 18))),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(post['author'], style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                                Text(post['time'], style: const TextStyle(fontSize: 12, opacity: 0.5)),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(post['content'], style: const TextStyle(fontSize: 15, height: 1.6)),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: LittleLightTheme.secondary,
                            borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                          ),
                          child: Column(
                            children: [
                              const Text('Lumi\'s Reply', style: TextStyle(fontSize: 12, opacity: 0.6)),
                              const SizedBox(height: 4),
                              Text(post['aiReply'], style: const TextStyle(fontSize: 14, height: 1.5)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            ElevatedButton(
                              onPressed: () => _hugPost(index),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: LittleLightTheme.bg,
                                foregroundColor: LittleLightTheme.text,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                                ),
                              ),
                              child: Row(
                                children: [
                                  const Text('🤗'),
                                  const SizedBox(width: 6),
                                  const Text('Hug'),
                                  const SizedBox(width: 4),
                                  Text(post['hugs'].toString()),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            ElevatedButton(
                              onPressed: () => _encouragePost(index),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: LittleLightTheme.bg,
                                foregroundColor: LittleLightTheme.text,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                                ),
                              ),
                              child: const Row(
                                children: [
                                  Text('💝'),
                                  SizedBox(width: 6),
                                  Text('Encourage'),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}