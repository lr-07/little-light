// 集中管理运行时配置。
//
// ⚠️ 安全模型（生产必读）：
//   生产环境 OpenAI Key 一律放后端代理（见 backend/），App 通过 BACKEND_URL
//   与后端通信，永远不直接持有 Key。客户端限流只是 UX 提示，权威限流在服务端。
//
// 构建参数注入示例：
//   flutter run  --dart-define=BACKEND_URL=http://localhost:3000
//   flutter build --dart-define=BACKEND_URL=https://your-backend.example.com \
//                 --dart-define=RC_IOS_KEY=appl_xxx --dart-define=RC_ANDROID_KEY=goog_xxx
class AppConfig {
  // ---- 后端代理地址（生产必填）----
  // 通过 dart-define=BACKEND_URL 注入；默认本地调试端口。
  static const String backendBaseUrl =
      String.fromEnvironment('BACKEND_URL', defaultValue: 'http://localhost:3000');

  // 是否走后端代理。dev 想本地直连 OpenAI 调试时设 false。
  static const bool useBackend =
      bool.fromEnvironment('USE_BACKEND', defaultValue: true);

  // ---- 本地直连 OpenAI（仅 dev 调试用，生产必须置空）----
  static const String openAiApiKey =
      String.fromEnvironment('OPENAI_API_KEY', defaultValue: '');

  // 本地强制 Premium（仅用于测试付费 UI；生产构建必须保持 false）。
  static const bool devForcePremium =
      bool.fromEnvironment('DEV_FORCE_PREMIUM', defaultValue: false);

  /// Freemium：每日免费对话次数，超过后需订阅。
  static const int freeDailyChatLimit = 5;

  /// 当前选用的模型。gpt-4o-mini：便宜、英文质量好、全球低延迟、有 SLA，
  /// 适合海外付费产品的免费档；付费档可升到 gpt-4o / Claude 提升留存。
  static const String chatModel = 'gpt-4o-mini';

  // ---- RevenueCat（平台各自 Key，在 main 里初始化）----
  static const String revenueCatIosKey =
      String.fromEnvironment('RC_IOS_KEY', defaultValue: '');
  static const String revenueCatAndroidKey =
      String.fromEnvironment('RC_ANDROID_KEY', defaultValue: '');
}
