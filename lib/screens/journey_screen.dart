import 'package:flutter/material.dart';
import 'package:little_light/theme.dart';

class JourneyScreen extends StatefulWidget {
  const JourneyScreen({super.key});

  @override
  State<JourneyScreen> createState() => _JourneyScreenState();
}

class _JourneyScreenState extends State<JourneyScreen> {
  int _currentDay = 6;
  bool _taskCompleted = false;

  void _completeTask() {
    setState(() {
      _taskCompleted = true;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Task completed 🌿'),
        backgroundColor: LittleLightTheme.primary,
        behavior: SnackBarBehavior.floating,
      ),
    );
    Future.delayed(const Duration(seconds: 1), () {
      setState(() {
        _currentDay++;
        _taskCompleted = false;
      });
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
        title: const Text('Little Journey'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(LittleLightTheme.spacingLg),
        child: Column(
          children: [
            const SizedBox(height: 20),
            const Text('🌱', style: TextStyle(fontSize: 64)),
            const SizedBox(height: 16),
            Text('30 Days of Restart', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text('Every day, take a small step forward', style: Theme.of(context).textTheme.bodyMedium?.copyWith(opacity: 0.7)),
            const SizedBox(height: 32),
            const Align(
              alignment: Alignment.centerLeft,
              child: Text('Progress', style: TextStyle(fontSize: 14, opacity: 0.6)),
            ),
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: _currentDay / 30,
              backgroundColor: LittleLightTheme.border,
              color: LittleLightTheme.primary,
              borderRadius: BorderRadius.circular(6),
              minHeight: 12,
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Day $_currentDay / 30', style: const TextStyle(fontSize: 14)),
                Text('${((_currentDay / 30) * 100).round()}% Complete', style: const TextStyle(fontSize: 14)),
              ],
            ),
            const SizedBox(height: 32),
            const Align(
              alignment: Alignment.centerLeft,
              child: Text('Your Journey', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            ),
            const SizedBox(height: 12),
            GridView.count(
              shrinkWrap: true,
              crossAxisCount: 5,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
              children: List.generate(30, (index) {
                final day = index + 1;
                Color bgColor = LittleLightTheme.card;
                Color textColor = LittleLightTheme.text;
                double opacity = 1;

                if (day < _currentDay) {
                  bgColor = LittleLightTheme.secondary;
                } else if (day == _currentDay) {
                  bgColor = LittleLightTheme.primary;
                  textColor = Colors.white;
                } else {
                  opacity = 0.4;
                }

                return Opacity(
                  opacity: opacity,
                  child: Container(
                    decoration: BoxDecoration(
                      color: bgColor,
                      borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                    ),
                    child: Center(
                      child: Text(day.toString(), style: TextStyle(color: textColor, fontSize: 12)),
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: 24),
            LumiCard(
              child: Column(
                children: [
                  const Text('Today\'s Task', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  const Text('Take three deep breaths and name one thing that made you smile today.', style: TextStyle(fontSize: 14, opacity: 0.8)),
                  const SizedBox(height: 16),
                  GentleButton(
                    text: _taskCompleted ? 'Completed 🌿' : 'Mark Complete',
                    onPressed: _taskCompleted ? null : _completeTask,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}