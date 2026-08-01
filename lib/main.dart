import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'theme.dart';
import 'firebase_options.dart';
import 'services/auth_service.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/chat_screen.dart';
import 'screens/mood_journal_screen.dart';
import 'screens/journey_screen.dart';
import 'screens/community_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/paywall_screen.dart';
import 'services/subscription_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: firebaseOptions,
  );

  // 本地 Emulator 联调（仅当构建时注入 USE_EMULATORS=true）。
  // ⚠️ 生产构建绝不能带此开关，否则 App 会连本地模拟器而非线上服务。
  if (const bool.fromEnvironment('USE_EMULATORS', defaultValue: false)) {
    await FirebaseAuth.instance.useAuthEmulator('localhost', 9099);
    FirebaseFirestore.instance.useFirestoreEmulator('localhost', 8080);
    print('[dev] 已连接 Firebase Emulator (auth:9099, firestore:8080)');
  }

  // 初始化 RevenueCat（未配置 key 时内部自动跳过）
  await SubscriptionService.configure();
  runApp(const LittleLightApp());
}

class LittleLightApp extends StatelessWidget {
  const LittleLightApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Little Light',
      theme: LittleLightTheme.theme,
      home: const AuthGate(),
      routes: {
        '/home': (context) => const HomeScreen(),
        '/chat': (context) => const ChatScreen(),
        '/mood-journal': (context) => const MoodJournalScreen(),
        '/journey': (context) => const JourneyScreen(),
        '/community': (context) => const CommunityScreen(),
        '/profile': (context) => const ProfileScreen(),
        '/login': (context) => const LoginScreen(),
        '/paywall': (context) => const PaywallScreen(),
      },
    );
  }
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  final AuthService _authService = AuthService();
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final isSignedIn = await _authService.isSignedIn();
    setState(() => _isLoading = false);

    if (!mounted) return;

    if (isSignedIn) {
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const SplashScreen();
    }
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}