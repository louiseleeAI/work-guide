/**
 * 登录用户昵称。KV 存储，键按 token 隔离（token 与登录一一对应）。
 * Cloudflare Pages Functions 约定路由：/api/user
 * GET  /api/user?token=xxx → { ok, name | null }
 * POST /api/user { token, name } → { ok, name }
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

const PROFILE_TTL = 60 * 60 * 24 * 30 // 与登录 token 同寿命：30 天

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const token = (context.request.url.match(/[?&]token=([\w-]{8,64})/) || [])[1]
  if (!token) return json({ ok: false }, 400)
  try {
    const name = await context.env.KV.get(`profile:${token}`)
    return json({ ok: true, name })
  } catch {
    return json({ ok: false }, 503)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let body: { token?: string; name?: string }
  try {
    body = (await context.request.json()) as { token?: string; name?: string }
  } catch {
    return json({ ok: false, error: 'bad-json' }, 400)
  }

  const token = body.token || ''
  const name = (body.name || '').trim()
  if (!/^[\w-]{8,64}$/.test(token)) return json({ ok: false, error: 'bad-token' }, 400)
  if (!name || [...name].length > 20) return json({ ok: false, error: 'bad-name' }, 400)

  try {
    // 必须持有有效登录 token 才能设置昵称
    const valid = await context.env.KV.get(`token:${token}`)
    if (valid !== '1') return json({ ok: false, error: 'unauthorized' }, 401)
    await context.env.KV.put(`profile:${token}`, name, { expirationTtl: PROFILE_TTL })
    return json({ ok: true, name })
  } catch {
    return json({ ok: false, error: 'kv-unavailable' }, 503)
  }
}
