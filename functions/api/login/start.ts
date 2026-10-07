/**
 * 生成 6 位登录码，存 KV（10 分钟过期）。
 * Cloudflare Pages Functions 约定路由：POST /api/login/start
 * KV 绑定名：KV（部署时在 Cloudflare 控制台绑定）
 */

interface Env {
  KV: KVNamespace
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  try {
    await context.env.KV.put(`code:${code}`, 'pending', { expirationTtl: 600 })
    return json({ ok: true, code })
  } catch {
    return json({ ok: false, error: 'kv-unavailable' }, 503)
  }
}
