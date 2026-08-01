import 'dart:io';
import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:http/http.dart' as http;
import 'package:purchases_flutter/purchases_flutter.dart';
import '../config/app_config.dart';

/// RevenueCat 订阅封装。
///
/// 关键点：
///  - 用 Firebase uid 作为 RevenueCat 的 appUserID，这样 Webhook 事件里的
///    app_user_id 就是我们的 uid，后端能直接写对应 Firestore 文档。
///  - 购买成功后主动调后端 /v1/subscription/sync 立即刷新 isPremium（不等 Webhook）。
///  -  entitlement 名称约定为 "premium"（在 RevenueCat 后台配置）。
///
/// 前置：在 RevenueCat 后台创建 App、配置 App Store / Play Store、定义
///  entitlement「premium」与产品，并把 iOS/Android API Key 通过 dart-define 注入。
class SubscriptionService {
  static const String entitlementId = 'premium';

  static bool get _configured {
    final key = Platform.isIOS
        ? AppConfig.revenueCatIosKey
        : AppConfig.revenueCatAndroidKey;
    return key.isNotEmpty;
  }

  /// 在 main() 里调用一次。
  static Future<void> configure() async {
    if (!_configured) {
      print('DEV: RevenueCat key 未配置，跳过初始化');
      return;
    }
    final uid = FirebaseAuth.instance.currentUser?.uid;
    final key = Platform.isIOS
        ? AppConfig.revenueCatIosKey
        : AppConfig.revenueCatAndroidKey;
    final config = PurchasesConfiguration(key);
    if (uid != null) config.appUserID = uid; // 让 uid 与 Firestore 一致
    await Purchases.configure(config);
  }

  /// 当前是否已订阅（来自 RevenueCat 本地缓存）。
  static Future<bool> get isPremium async {
    try {
      final info = await Purchases.getCustomerInfo();
      return info.entitlements.all[entitlementId]?.isActive ?? false;
    } catch (e) {
      print('RevenueCat 读取失败: $e');
      return false;
    }
  }

  /// 拉取商品列表，返回可购买套餐（建议取第一个，通常为月付）。
  static Future<List<Package>> getPackages() async {
    final offerings = await Purchases.getOfferings();
    final current = offerings.current;
    if (current == null) return [];
    return current.availablePackages;
  }

  /// 购买指定套餐。成功返回 true，并同步给后端。
  static Future<bool> purchase(Package package) async {
    try {
      final info = await Purchases.purchasePackage(package);
      final active =
          info.entitlements.all[entitlementId]?.isActive ?? false;
      if (active) await syncWithBackend();
      return active;
    } on PurchasesError {
      // 用户取消或支付失败，按未订阅处理。
      return false;
    } catch (e) {
      print('Purchase error: $e');
      return false;
    }
  }

  /// 恢复购买。
  static Future<bool> restore() async {
    final info = await Purchases.restorePurchases();
    final active = info.entitlements.all[entitlementId]?.isActive ?? false;
    if (active) await syncWithBackend();
    return active;
  }

  /// 购买后主动通知后端用 RevenueCat API 校验并写 Firestore isPremium。
  static Future<void> syncWithBackend() async {
    final user = FirebaseAuth.instance.currentUser;
    final idToken = await user?.getIdToken();
    if (idToken == null) return;
    try {
      await http.post(
        Uri.parse('${AppConfig.backendBaseUrl}/v1/subscription/sync'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $idToken',
        },
      );
    } catch (e) {
      print('订阅同步后端失败（Webhook 仍会兜底）: $e');
    }
  }
}
