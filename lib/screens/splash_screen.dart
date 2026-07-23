import 'package:flutter/material.dart';
import 'package:little_light/theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _moonController;
  late Animation<double> _moonAnimation;

  @override
  void initState() {
    super.initState();
    _moonController = AnimationController(
      duration: const Duration(seconds: 4),
      vsync: this,
    )..repeat(reverse: true);
    _moonAnimation = Tween<double>(begin: 0, end: -10).animate(
      CurvedAnimation(parent: _moonController, curve: Curves.easeInOut),
    );

    Future.delayed(const Duration(seconds: 3), () {
      Navigator.pushReplacementNamed(context, '/home');
    });
  }

  @override
  void dispose() {
    _moonController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          _buildClouds(),
          _buildStars(),
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                AnimatedBuilder(
                  animation: _moonAnimation,
                  builder: (context, child) {
                    return Transform.translate(
                      offset: Offset(0, _moonAnimation.value),
                      child: child,
                    );
                  },
                  child: const Text(
                    '🌙',
                    style: TextStyle(fontSize: 80),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Little Light',
                  style: Theme.of(context).textTheme.headlineLarge,
                ),
                const SizedBox(height: 12),
                Text(
                  'A small light for difficult days.',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        opacity: 0.7,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  'No one should face difficult days alone.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        opacity: 0.5,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildClouds() {
    return Stack(
      children: [
        AnimatedPositioned(
          top: 120,
          left: 10,
          duration: const Duration(seconds: 6),
          curve: Curves.easeInOut,
          child: const Text('☁️', style: TextStyle(fontSize: 32, opacity: 0.6)),
        ),
        AnimatedPositioned(
          top: 80,
          right: 15,
          duration: const Duration(seconds: 8),
          curve: Curves.easeInOut,
          child: const Text('☁️', style: TextStyle(fontSize: 32, opacity: 0.6)),
        ),
        AnimatedPositioned(
          top: 200,
          left: 60,
          duration: const Duration(seconds: 7),
          curve: Curves.easeInOut,
          child: const Text('☁️', style: TextStyle(fontSize: 32, opacity: 0.6)),
        ),
      ],
    );
  }

  Widget _buildStars() {
    return Stack(
      children: [
        _buildStar(60, 20, 0),
        _buildStar(100, 70, 1),
        _buildStar(180, 40, 2),
      ],
    );
  }

  Widget _buildStar(double top, double left, int delay) {
    return Positioned(
      top: top,
      left: left,
      child: AnimatedOpacity(
        opacity: 0.4,
        duration: const Duration(seconds: 3),
        curve: Curves.easeInOut,
        child: const Text('✨', style: TextStyle(fontSize: 24)),
      ),
    );
  }
}