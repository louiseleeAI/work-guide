/**
 * 轮询登录码状态。验证成功时签发 30 天 token。
 * Cloudflare Pages Functions 约定路由：GET /api/login/check?code=xxxxxx
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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const code = (context.request.url.match(/[?&]code=(\d{6})/) || [])[1]
  if (!code) return json({ status: 'invalid' }, 400)

  let state: string | null = null
  try {
    state = await context.env.KV.get(`code:${code}`)
  } catch {
    return json({ status: 'unavailable' }, 503)
  }

  if (state === 'verified') {
    const token = crypto.randomUUID()
    try {
      await context.env.KV.put(`token:${token}`, '1', { expirationTtl: 60 * 60 * 24 * 30 })
      await context.env.KV.delete(`code:${code}`)
    } catch {
      return json({ status: 'unavailable' }, 503)
    }
    return json({ status: 'ok', token })
  }

  if (state === 'pending') return json({ status: 'pending' })
  return json({ status: 'expired' })
}
