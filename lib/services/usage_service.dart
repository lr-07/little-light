import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

/// Freemium 每日对话额度管理（Firestore 权威版）。
///
/// - 真正的计数与 premium 判定都在后端代理 + Firestore 完成（见 backend/server.js）。
/// - 本类只负责「读取」状态给 UI 展示；聊天成功后刷新一次即可。
/// - 免费额度在后端 /v1/chat 用事务原子扣减，客户端无法绕过。
///
/// ⚠️ `isPremium` 只能由后端（admin）写入，客户端安全规则禁止改为 true。
///    本地 devForcePremium 仅用于测试付费 UI，生产构建必须关闭。
class UsageService {
  final FirebaseFirestore _db;
  final String _uid;

  UsageService(this._db, this._uid);

  /// 便捷构造：取当前登录用户。未登录抛错（AuthGate 已兜底）。
  static Future<UsageService> create() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) throw StateError('User not signed in');
    return UsageService(FirebaseFirestore.instance, user.uid);
  }

  DocumentReference<Map<String, dynamic>> get _doc =>
      _db.collection('users').doc(_uid);

  String _todayUtc() {
    final d = DateTime.now().toUtc();
    return '${d.year}-${_two(d.month)}-${_two(d.day)}';
  }

  String _two(int n) => n.toString().padLeft(2, '0');

  /// 读取用户文档；不存在则初始化。
  Future<Map<String, dynamic>> _read() async {
    final snap = await _doc.get();
    if (!snap.exists) {
      final init = {
        'isPremium': false,
        'freeUsedDate': _todayUtc(),
        'freeUsedCount': 0,
      };
      await _doc.set(init);
      return init;
    }
    return snap.data()!;
  }

  /// 是否已订阅（含本地 dev 强制 / dev 模拟标记）。
  /// ⚠️ 这两个 dev 分支仅用于本地 UI 联调；生产环境 isPremium 只由后端写 Firestore 决定，
  /// 且聊天请求仍受后端 402 限流约束，本地伪造 premium 无法真正绕过付费。
  Future<bool> get isPremium async {
    if (AppConfig.devForcePremium) return true;
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getBool('dev_premium_override') == true) return true;
    final d = await _read();
    return d['isPremium'] == true;
  }

  /// 今日剩余免费次数；已订阅返回 -1（无限）。
  Future<int> remainingFree() async {
    if (await isPremium) return -1;
    final d = await _read();
    final used = d['freeUsedCount'] as int? ?? 0;
    return (AppConfig.freeDailyChatLimit - used)
        .clamp(0, AppConfig.freeDailyChatLimit);
  }

  /// 是否还能免费聊天（已订阅，或今日未达上限）。
  Future<bool> canChatFree() async {
    if (await isPremium) return true;
    final d = await _read();
    if (d['freeUsedDate'] != _todayUtc()) return true; // 跨天，后端会归零
    return (d['freeUsedCount'] as int? ?? 0) < AppConfig.freeDailyChatLimit;
  }

  /// 聊天成功后刷新剩余次数（权威值来自后端扣减后的 Firestore）。
  Future<int> refresh() async => remainingFree();

  // 保留向后兼容的空实现：真实扣减在服务端完成，客户端不必再本地 +1。
  // 若 dev 直连模式无后端，可在此做本地兜底计数（当前默认走后端，故留空）。
  Future<void> recordChat() async {}
}
