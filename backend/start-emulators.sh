#!/usr/bin/env bash
# 本地 Emulator 联调一键脚本
# ------------------------------------------------------------------
# 用途：启动 Firebase 模拟器（Functions + Firestore + Auth），
#       配合 App 端的 USE_EMULATORS 开关，整套链路在本地跑通，无需真实 Firebase 项目。
#
# 前置：
#   1) 安装 Firebase CLI： npm install -g firebase-tools
#   2) 登录（仅用于拉取项目配置）： firebase login
#   3) 在 backend/.env.local 填入：
#        OPENAI_API_KEY=sk-xxxx
#        DISABLE_AUTH=true          # 本地跳过 token 校验，免配 Auth（仅 dev）
#      （firebase-tools 运行模拟器时会自动加载 .env.local）
#
# 运行：
#   bash start-emulators.sh
#
# App 端另开一个终端：
#   flutter run --dart-define=USE_EMULATORS=true \
#               --dart-define=BACKEND_URL=http://localhost:5001
#
# 说明：
#   - Functions 模拟器监听 5001，App 的 BACKEND_URL 指向它即可。
#   - 仅启动部分模拟器： firebase emulators:start --only functions,firestore
set -e
cd "$(dirname "$0")"
firebase emulators:start --only functions,firestore,auth
