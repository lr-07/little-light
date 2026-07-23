import 'package:flutter/material.dart';
import '../theme.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final AuthService _authService = AuthService();
  bool _isLogin = true;
  bool _isLoading = false;
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();

  Future<void> _handleLogin() async {
    setState(() => _isLoading = true);
    final credential = await _authService.signInWithEmail(
      _emailController.text,
      _passwordController.text,
    );
    setState(() => _isLoading = false);

    if (credential != null && mounted) {
      Navigator.pushReplacementNamed(context, '/home');
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Login failed. Please try again.')),
      );
    }
  }

  Future<void> _handleSignUp() async {
    if (_passwordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Passwords do not match')),
      );
      return;
    }

    setState(() => _isLoading = true);
    final credential = await _authService.signUpWithEmail(
      _emailController.text,
      _passwordController.text,
    );
    setState(() => _isLoading = false);

    if (credential != null && mounted) {
      Navigator.pushReplacementNamed(context, '/home');
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sign-up failed. Please try again.')),
      );
    }
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() => _isLoading = true);
    final credential = await _authService.signInWithGoogle();
    setState(() => _isLoading = false);

    if (credential != null && mounted) {
      Navigator.pushReplacementNamed(context, '/home');
    }
  }

  Future<void> _handleAppleSignIn() async {
    setState(() => _isLoading = true);
    final credential = await _authService.signInWithApple();
    setState(() => _isLoading = false);

    if (credential != null && mounted) {
      Navigator.pushReplacementNamed(context, '/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LittleLightTheme.background,
      body: Padding(
        padding: const EdgeInsets.all(LittleLightTheme.spacingLg),
        child: Center(
          child: SingleChildScrollView(
            child: Column(
              children: [
                const SizedBox(height: 40),
                const Text('🌙', style: TextStyle(fontSize: 64)),
                const SizedBox(height: 24),
                Text(
                  'Little Light',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    color: LittleLightTheme.text,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'A small light for difficult days.',
                  style: TextStyle(
                    fontSize: 15,
                    color: LittleLightTheme.text.withOpacity(0.6),
                  ),
                ),
                const SizedBox(height: 48),
                Container(
                  padding: const EdgeInsets.all(LittleLightTheme.spacingLg),
                  decoration: BoxDecoration(
                    color: LittleLightTheme.card,
                    borderRadius: BorderRadius.circular(LittleLightTheme.radiusXl),
                    boxShadow: const [LittleLightTheme.shadowSm],
                  ),
                  child: Column(
                    children: [
                      Text(
                        _isLogin ? 'Welcome back' : 'Create account',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w600,
                          color: LittleLightTheme.text,
                        ),
                      ),
                      const SizedBox(height: 32),
                      TextField(
                        controller: _emailController,
                        decoration: InputDecoration(
                          labelText: 'Email',
                          hintText: 'Enter your email',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                            borderSide: BorderSide(color: LittleLightTheme.border),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                            borderSide: BorderSide(color: LittleLightTheme.primary),
                          ),
                        ),
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _passwordController,
                        obscureText: true,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          hintText: 'Enter your password',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                            borderSide: BorderSide(color: LittleLightTheme.border),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                            borderSide: BorderSide(color: LittleLightTheme.primary),
                          ),
                        ),
                      ),
                      if (!_isLogin) ...[
                        const SizedBox(height: 16),
                        TextField(
                          controller: _confirmPasswordController,
                          obscureText: true,
                          decoration: InputDecoration(
                            labelText: 'Confirm Password',
                            hintText: 'Confirm your password',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                              borderSide: BorderSide(color: LittleLightTheme.border),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                              borderSide: BorderSide(color: LittleLightTheme.primary),
                            ),
                          ),
                        ),
                      ],
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : (_isLogin ? _handleLogin : _handleSignUp),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: LittleLightTheme.button,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                            elevation: 0,
                          ),
                          child: _isLoading
                              ? const CircularProgressIndicator(color: Colors.white)
                              : Text(
                                  _isLogin ? 'Sign In' : 'Sign Up',
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                                ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Expanded(child: Divider(color: LittleLightTheme.border)),
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 16),
                            child: Text('Or'),
                          ),
                          Expanded(child: Divider(color: LittleLightTheme.border)),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: _isLoading ? null : _handleGoogleSignIn,
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                            side: BorderSide(color: LittleLightTheme.border),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Text('G', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                              SizedBox(width: 12),
                              Text('Sign in with Google'),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: _isLoading ? null : _handleAppleSignIn,
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                            side: BorderSide(color: LittleLightTheme.border),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Text('🍎', style: TextStyle(fontSize: 20)),
                              SizedBox(width: 12),
                              Text('Sign in with Apple'),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      _isLogin ? 'Don\'t have an account?' : 'Already have an account?',
                      style: TextStyle(color: LittleLightTheme.text.withOpacity(0.7)),
                    ),
                    const SizedBox(width: 4),
                    TextButton(
                      onPressed: () => setState(() => _isLogin = !_isLogin),
                      child: Text(
                        _isLogin ? 'Sign up' : 'Sign in',
                        style: TextStyle(color: LittleLightTheme.button, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}