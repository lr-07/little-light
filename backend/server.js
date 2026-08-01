'use strict';

/**
 * LittleLightV1 后端 —— standalone 启动入口（本地调试 / 部署到 Cloud Run / Render / VM）。
 *
 * 路由与全部业务逻辑在 ./functions/handler.js（与 Cloud Functions 共用同一份代码）。
 * 这样无论你部署成「独立服务」还是「Cloud Functions」，逻辑都不会分叉。
 *
 * 启动：  npm install && npm start        （需填 .env，见 .env.example）
 */

const http = require('http');
const { requestHandler } = require('./functions/handler');

const PORT = parseInt(process.env.BACKEND_PORT || '3000', 10);

const server = http.createServer((req, res) => {
  // 把原生 http 请求交给共享处理器；异常已在其内部兜底。
  Promise.resolve(requestHandler(req, res)).catch((e) => {
    console.error('[fatal] 处理器未捕获异常：', e);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    }
    res.end(JSON.stringify({ error: 'internal' }));
  });
});

server.listen(PORT, () => {
  console.log(`LittleLight backend listening on :${PORT} (standalone mode)`);
});
