import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

/// 对话历史持久化（Firestore）。
///
/// 数据模型：
///   users/{uid}/conversations/{conversationId}/messages/{msgId}
///     - role: 'user' | 'assistant'
///     - text: 消息正文
///     - createdAt: int（毫秒时间戳，用于稳定排序，离线/弱网也可靠）
///     - model: 生成该消息的模型（仅记录，便于调试）
///
/// 安全：客户端只能读写自己 uid 下的消息子集合（见 firestore.rules 的
///   `match /users/{uid}` 及其子集合授权）。premium 标记在用户文档，
///   客户端规则禁止改为 true，无法靠篡改历史绕过付费。
///
/// Firebase 未配置 / 未登录时 `create()` 返回 null，调用方退化为纯内存态，
/// 不会出现因缺 Firebase 而崩溃的情况（dev 早期友好）。
class ChatHistoryService {
  final FirebaseFirestore _db;
  final String _uid;
  final String _conversationId;

  ChatHistoryService._(this._db, this._uid, this._conversationId);

  /// 便捷构造；未登录或 Firebase 未初始化时返回 null（调用方走内存态）。
  static Future<ChatHistoryService?> create({String conversationId = 'main'}) async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) return null;
      return ChatHistoryService._(FirebaseFirestore.instance, user.uid, conversationId);
    } catch (_) {
      return null;
    }
  }

  CollectionReference<Map<String, dynamic>> get _col => _db
      .collection('users')
      .doc(_uid)
      .collection('conversations')
      .doc(_conversationId)
      .collection('messages');

  /// 读取最近 [limit] 条消息（按时间正序），返回 UI 可直接用的 {text, isUser}。
  /// 用于聊天页初始化时恢复历史；为空说明是新会话。
  Future<List<Map<String, dynamic>>> loadMessages({int limit = 50}) async {
    final snap = await _col
        .orderBy('createdAt', descending: false)
        .limit(limit)
        .get();
    return snap.docs.map((d) {
      final data = d.data();
      return {
        'text': (data['text'] as String?) ?? '',
        'isUser': data['role'] == 'user',
      };
    }).toList();
  }

  /// 追加一条消息。role 取 'user' 或 'assistant'。
  /// 失败仅打印，不抛出，避免影响聊天主流程。
  Future<void> appendMessage(String role, String text) async {
    try {
      await _col.add({
        'role': role,
        'text': text,
        'createdAt': DateTime.now().millisecondsSinceEpoch,
        'model': 'gpt-4o-mini',
      });
    } catch (e) {
      print('ChatHistory append failed: $e');
    }
  }

  /// 清空当前会话（用于「开始新对话」功能）。
  Future<void> clear() async {
    final snap = await _col.get();
    for (final d in snap.docs) {
      await d.reference.delete();
    }
  }
}
