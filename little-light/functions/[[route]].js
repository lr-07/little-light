// Cloudflare Pages Function —— 把同一个 worker.js 挂到 Pages 源站，
// 这样前端用相对路径 /api/chat、/api/quote、/api/community 都能在
// little-light.pages.dev 同源直接命中，无需单独部署 Worker。
//
// 部署：Pages 在推送到 main 分支时会自动构建 functions/ 目录。
// KV 绑定（社区存储/限流/语录缓存）在 Cloudflare 控制台
//   Pages → 项目 → Settings → Functions → KV namespace bindings
//   添加变量名 KV（未配置时 worker 自动降级，不影响基础功能）。
import worker from '../worker.js';

export async function onRequest(context) {
  return worker.fetch(context.request, context.env);
}
