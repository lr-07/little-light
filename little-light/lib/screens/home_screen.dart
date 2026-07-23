import 'package:flutter/material.dart';
import 'package:little_light/theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String? _selectedMood;
  final TextEditingController _journalController = TextEditingController();

  final Map<String, Color> _moodColors = {
    '😊': const Color(0xFFF0F5F8),
    '🙂': const Color(0xFFFAF8F4),
    '😔': const Color(0xFFF2F4F0),
    '😭': const Color(0xFFF4F0F2),
  };

  void _selectMood(String mood) {
    setState(() {
      _selectedMood = mood;
    });
    if (_moodColors.containsKey(mood)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('You selected: $mood'),
          duration: const Duration(seconds: 1),
          backgroundColor: LittleLightTheme.secondary,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(LittleLightTheme.spacingLg),
        child: Column(
          children: [
            const SizedBox(height: 20),
            const Text('🌙', style: TextStyle(fontSize: 48)),
            const SizedBox(height: 12),
            Text(
              'Good Evening.',
              style: Theme.of(context).textTheme.headlineMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'How are you feeling today?',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(opacity: 0.7),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 28),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                MoodSelector(
                  emoji: '😊',
                  selected: _selectedMood == '😊',
                  onTap: () => _selectMood('😊'),
                ),
                MoodSelector(
                  emoji: '🙂',
                  selected: _selectedMood == '🙂',
                  onTap: () => _selectMood('🙂'),
                ),
                MoodSelector(
                  emoji: '😔',
                  selected: _selectedMood == '😔',
                  onTap: () => _selectMood('😔'),
                ),
                MoodSelector(
                  emoji: '😭',
                  selected: _selectedMood == '😭',
                  onTap: () => _selectMood('😭'),
                ),
              ],
            ),
            const SizedBox(height: 28),
            const Divider(color: LittleLightTheme.border),
            const SizedBox(height: 24),
            const Text(
              'Take your time.\nI\'m here to listen.',
              style: TextStyle(fontSize: 14, opacity: 0.6),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            GentleButton(
              text: 'Talk with Lumi',
              onPressed: () => Navigator.pushNamed(context, '/chat'),
              width: 280,
            ),
            const SizedBox(height: 24),
            const Divider(color: LittleLightTheme.border),
            const SizedBox(height: 16),
            LumiCard(
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: LittleLightTheme.secondary,
                          borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                        ),
                        child: const Center(child: Text('📝', style: TextStyle(fontSize: 20))),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Today\'s Journal',
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontSize: 16),
                          ),
                          Text(
                            'What happened today?',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(opacity: 0.7),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _journalController,
                    decoration: const InputDecoration(
                      hintText: 'Write anything that\'s on your mind...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.all(Radius.circular(12)),
                      ),
                    ),
                    maxLines: 3,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            LumiCard(
              child: GestureDetector(
                onTap: () => Navigator.pushNamed(context, '/journey'),
                child: Row(
                  children: [
                    const Text('🌱', style: TextStyle(fontSize: 32)),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Little Journey',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(opacity: 0.6),
                          ),
                          Text(
                            'Day 6',
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontSize: 18),
                          ),
                          const SizedBox(height: 8),
                          LinearProgressIndicator(
                            value: 0.2,
                            backgroundColor: LittleLightTheme.border,
                            color: LittleLightTheme.primary,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            LumiCard(
              padding: const EdgeInsets.all(LittleLightTheme.spacingLg),
              child: const Column(
                children: [
                  Text('💫', style: TextStyle(fontSize: 24)),
                  SizedBox(height: 12),
                  Text(
                    '"The sky doesn\'t ask you to be perfect."',
                    style: TextStyle(fontSize: 15, fontStyle: italic, height: 1.8),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 8),
                  Text(
                    '— Today\'s gentle reminder',
                    style: TextStyle(fontSize: 13, opacity: 0.5),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
      bottomNavigationBar: _buildNavBar(),
    );
  }

  Widget _buildNavBar() {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      backgroundColor: LittleLightTheme.card,
      selectedItemColor: LittleLightTheme.button,
      unselectedItemColor: LittleLightTheme.text.withOpacity(0.5),
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
        BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Chat'),
        BottomNavigationBarItem(icon: Icon(Icons.book), label: 'Journal'),
        BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Community'),
        BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
      ],
      onTap: (index) {
        switch (index) {
          case 0:
            Navigator.pushNamed(context, '/home');
            break;
          case 1:
            Navigator.pushNamed(context, '/chat');
            break;
          case 2:
            Navigator.pushNamed(context, '/mood-journal');
            break;
          case 3:
            Navigator.pushNamed(context, '/community');
            break;
          case 4:
            Navigator.pushNamed(context, '/profile');
            break;
        }
      },
    );
  }
}