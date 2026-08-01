import 'package:flutter/material.dart';
import 'package:little_light/theme.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import '../config/app_config.dart';
import '../services/usage_service.dart';
import '../services/subscription_service.dart';

/// 付费墙：每日免费额度用尽后展示。
///
/// 生产：点击购买走 RevenueCat 真实订阅，成功后由后端/Webhook 写 Firestore isPremium。
/// Dev：未配置 RevenueCat 时，用本地标记模拟（仅供 UI 联调，切勿当真）。
class PaywallScreen extends StatefulWidget {
  const PaywallScreen({super.key});

  @override
  State<PaywallScreen> createState() => _PaywallScreenState();
}

class _PaywallScreenState extends State<PaywallScreen> {
  bool _loading = false;
  List<Package> _packages = [];
  bool _rcConfigured = false;
  Package? _selected;

  @override
  void initState() {
    super.initState();
    _loadOfferings();
  }

  Future<void> _loadOfferings() async {
    setState(() => _loading = true);
    try {
      _packages = await SubscriptionService.getPackages();
      _rcConfigured = _packages.isNotEmpty;
      if (_packages.isNotEmpty) _selected = _packages.first;
    } catch (e) {
      print('拉取商品失败: $e');
      _rcConfigured = false;
    }
    if (mounted) setState(() => _loading = false);
  }

  String _priceLabel(Package pkg) {
    final off = pkg.storeProduct;
    return off.priceString;
  }

  Future<void> _upgrade() async {
    if (_loading) return;
    setState(() => _loading = true);
    try {
      bool ok;
      if (_rcConfigured && _selected != null) {
        ok = await SubscriptionService.purchase(_selected!);
      } else {
        // Dev 回退：本地模拟订阅
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('dev_premium_override', true);
        ok = true;
      }
      if (mounted) {
        if (ok) {
          Navigator.pop(context, true);
          return;
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Purchase was not completed.')),
          );
        }
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _restore() async {
    setState(() => _loading = true);
    try {
      final ok = await SubscriptionService.restore();
      if (mounted) {
        if (ok) {
          Navigator.pop(context, true);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('No previous purchase found.')),
          );
        }
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Little Light Premium')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(LittleLightTheme.spacingLg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 24),
            Container(
              width: 88,
              height: 88,
              decoration: BoxDecoration(
                color: LittleLightTheme.secondary,
                borderRadius: BorderRadius.circular(44),
              ),
              child: const Center(child: Text('🐱', style: TextStyle(fontSize: 44))),
            ),
            const SizedBox(height: 20),
            Text(
              "You've used your ${AppConfig.freeDailyChatLimit} free chats for today",
              style: textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 10),
            Text(
              'Lumi is here for you anytime. Upgrade to Premium for unlimited, gentle companionship — whenever you need it.',
              style: textTheme.bodyMedium?.copyWith(opacity: 0.75),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 28),
            _buildFeature(Icons.chat_bubble_outline, 'Unlimited chats with Lumi'),
            _buildFeature(Icons.favorite_outline, 'Deeper, longer memory of you'),
            _buildFeature(Icons.nightlight_outline, 'Always here, day or night'),
            const SizedBox(height: 24),
            if (_loading)
              const CircularProgressIndicator()
            else ...[
              if (_rcConfigured && _selected != null)
                Text(
                  'Premium · ${_priceLabel(_selected!)} / month',
                  style: textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _upgrade,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(LittleLightTheme.radiusMd),
                    ),
                  ),
                  child: Text(_rcConfigured ? 'Subscribe' : 'Unlock Premium (dev)'),
                ),
              ),
              const SizedBox(height: 10),
              if (_rcConfigured)
                TextButton(
                  onPressed: _restore,
                  child: const Text('Restore Purchase'),
                )
              else
                Text(
                  'Dev mode: RevenueCat not configured — using local mock.',
                  style: textTheme.bodySmall?.copyWith(opacity: 0.5),
                  textAlign: TextAlign.center,
                ),
            ],
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Maybe later'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeature(IconData icon, String label) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: LittleLightTheme.button, size: 22),
          const SizedBox(width: 14),
          Expanded(child: Text(label, style: const TextStyle(fontSize: 15))),
        ],
      ),
    );
  }
}
