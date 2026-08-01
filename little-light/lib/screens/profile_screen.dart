import 'package:flutter/material.dart';
import 'package:little_light/theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('My Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(LittleLightTheme.spacingLg),
        child: Column(
          children: [
            const SizedBox(height: 20),
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: LittleLightTheme.secondary,
                borderRadius: BorderRadius.circular(50),
              ),
              child: const Center(child: Text('🐰', style: TextStyle(fontSize: 48))),
            ),
            const SizedBox(height: 16),
            Text('Dear Friend', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            Text('Your gentle companion is here', style: Theme.of(context).textTheme.bodyMedium?.copyWith(opacity: 0.7)),
            const SizedBox(height: 32),
            GridView.count(
              shrinkWrap: true,
              crossAxisCount: 3,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              children: const [
                _StatCard(value: '12', label: 'Days Together'),
                _StatCard(value: '7', label: 'Streak'),
                _StatCard(value: '48', label: 'Journal Entries'),
              ],
            ),
            const SizedBox(height: 24),
            LumiCard(
              child: Column(
                children: [
                  const Text('Mood Trends', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 16),
                  Container(
                    height: 100,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        _buildBar(0.6),
                        _buildBar(0.8),
                        _buildBar(0.9, true),
                        _buildBar(0.4),
                        _buildBar(0.7),
                        _buildBar(0.85, true),
                        _buildBar(0.75),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(LittleLightTheme.spacingLg),
              decoration: BoxDecoration(
                color: LittleLightTheme.secondary,
                borderRadius: BorderRadius.circular(LittleLightTheme.radiusXl),
              ),
              child: const Column(
                children: [
                  Text('"You are doing better than you think."', style: TextStyle(fontSize: 15, fontStyle: italic)),
                  SizedBox(height: 8),
                  Text('Your daily quote', style: TextStyle(fontSize: 12, opacity: 0.6)),
                ],
              ),
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildBar(double height, [bool isHigh = false]) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: Container(
          height: height * 100,
          decoration: BoxDecoration(
            color: isHigh ? LittleLightTheme.primary : LittleLightTheme.secondary,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String value;
  final String label;

  const _StatCard({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: LittleLightTheme.card,
        borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
      ),
      child: Column(
        children: [
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w600, color: LittleLightTheme.button)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 12, opacity: 0.6)),
        ],
      ),
    );
  }
}