import 'package:firebase_core/firebase_core.dart';

// ┌──────────────────────────────────────────────────────────────┐
// │ Firebase 配置（生产必填）                                       │
// │ 当前为空占位。请按以下步骤获取并填入真实值：                      │
// │   1. 打开 https://console.firebase.google.com → 新建项目        │
// │   2. 添加 iOS / Android 应用，按向导下载配置文件                  │
// │   3. 安装 FlutterFire CLI： dart pub global activate flutterfire_cli │
// │   4. 在项目根执行： flutterfire configure                        │
// │      （会自动生成正确的 firebase_options.dart，覆盖本文件）       │
// │   5. 控制台启用 Authentication（Email/Google/Facebook）与        │
// │      Firestore；并部署根目录 firestore.rules                     │
// └──────────────────────────────────────────────────────────────┘

const FirebaseOptions firebaseOptions = FirebaseOptions(
  apiKey: '',
  appId: '',
  messagingSenderId: '',
  projectId: '',
  authDomain: '',
  storageBucket: '',
);

const FirebaseOptions firebaseOptionsAndroid = FirebaseOptions(
  apiKey: '',
  appId: '',
  messagingSenderId: '',
  projectId: '',
  authDomain: '',
  storageBucket: '',
);

const FirebaseOptions firebaseOptionsIOS = FirebaseOptions(
  apiKey: '',
  appId: '',
  messagingSenderId: '',
  projectId: '',
  authDomain: '',
  storageBucket: '',
  iosBundleId: '',
);