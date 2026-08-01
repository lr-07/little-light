import 'package:flutter/material.dart';
import 'package:little_light/theme.dart';

class MoodJournalScreen extends StatefulWidget {
  const MoodJournalScreen({super.key});

  @override
  State<MoodJournalScreen> createState() => _MoodJournalScreenState();
}

class _MoodJournalScreenState extends State<MoodJournalScreen> {
  String? _selectedMood;
  final Set<String> _selectedSources = {};
  final TextEditingController _gratitudeController = TextEditingController();

  final List<Map<String, String>> _moods = [
    {'emoji': '😊', 'label': 'Happy'},
    {'emoji': '🙂', 'label': 'Calm'},
    {'emoji': '😔', 'label': 'Sad'},
    {'emoji': '😭', 'label': 'Overwhelmed'},
  ];

  final List<String> _sources = ['Work', 'Money', 'Family', 'Relationship', 'Health', 'Other'];

  void _selectMood(String mood) {
    setState(() {
      _selectedMood = mood;
    });
  }

  void _toggleSource(String source) {
    setState(() {
      if (_selectedSources.contains(source)) {
        _selectedSources.remove(source);
      } else {
        _selectedSources.add(source);
      }
    });
  }

  void _saveJournal() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Journal saved ✨'),
        backgroundColor: LittleLightTheme.primary,
        behavior: SnackBarBehavior.floating,
      ),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Mood Journal'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(LittleLightTheme.spacingLg),
        child: Column(
          children: [
            _buildStep(1, 'How are you feeling?', 'Select one that feels right'),
            const SizedBox(height: 32),
            GridView.count(
              shrinkWrap: true,
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              children: _moods.map((mood) {
                return GestureDetector(
                  onTap: () => _selectMood(mood['emoji']!),
                  child: Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: _selectedMood == mood['emoji'] ? LittleLightTheme.secondary : LittleLightTheme.card,
                      borderRadius: BorderRadius.circular(LittleLightTheme.radiusXl),
                      border: _selectedMood == mood['emoji'] 
                          ? Border.all(color: LittleLightTheme.primary, width: 2)
                          : null,
                    ),
                    child: Column(
                      children: [
                        Text(mood['emoji']!, style: const TextStyle(fontSize: 32)),
                        const SizedBox(height: 8),
                        Text(mood['label']!, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 32),
            _buildStep(2, 'What\'s weighing on you?', 'Choose one or more'),
            const SizedBox(height: 32),
            GridView.count(
              shrinkWrap: true,
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              children: _sources.map((source) {
                return GestureDetector(
                  onTap: () => _toggleSource(source),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: _selectedSources.contains(source) ? LittleLightTheme.secondary : LittleLightTheme.card,
                      borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                    ),
                    child: Center(
                      child: Text(source, style: const TextStyle(fontSize: 14)),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 32),
            _buildStep(3, 'A little gratitude', 'Is there one small thing to be thankful for?'),
            const SizedBox(height: 32),
            TextField(
              controller: _gratitudeController,
              decoration: const InputDecoration(
                hintText: 'Today, I\'m grateful for...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(16)),
                ),
              ),
              maxLines: 4,
            ),
            const SizedBox(height: 20),
            GentleButton(
              text: 'Save Journal',
              onPressed: _saveJournal,
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildStep(int num, String title, String subtitle) {
    return Column(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: LittleLightTheme.primary,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Center(
            child: Text(num.toString(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          ),
        ),
        const SizedBox(height: 12),
        Text(title, style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 8),
        Text(subtitle, style: Theme.of(context).textTheme.bodyMedium?.copyWith(opacity: 0.7)),
      ],
    );
  }
}