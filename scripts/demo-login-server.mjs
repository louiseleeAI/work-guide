/**
 * 登录后端本地演示服务器（Node 22，无额外依赖）。
 *
 * 原理：functions/api/*.ts 导出的 onRequestGet/onRequestPost 只依赖
 * context.request（标准 Request）与 context.env（KV + WECHAT_TOKEN），
 * 本文件提供最小的兼容层（内存版 KV + Node 原生 fetch Response），
 * 直接调用这三个真实函数文件——测的就是部署到 Cloudflare 的同一份代码。
 *
 * 启动：node scripts/demo-login-server.mjs   （端口 8788）
 */
import http from 'node:http'
import { onRequestPost as startFn } from '../functions/api/login/start.ts'
import { onRequestGet as checkFn } from '../functions/api/login/check.ts'
import { onRequestGet as wechatGet, onRequestPost as wechatPost } from '../functions/api/wechat.ts'

/** 内存版 KV（TTL 忽略——演示足够；生产用 Cloudflare KV，自动过期） */
const store = new Map()
const KV = {
  get: async (k) => store.get(k) ?? null,
  put: async (k, v) => void store.set(k, v),
  delete: async (k) => void store.delete(k),
}

const env = { KV, WECHAT_TOKEN: 'local-demo-token' }

/** 把 onRequest* 的签名适配成 Cloudflare Pages Function 的 context 形状 */
async function call(fn, req) {
  const ctx = { request: req, env }
  const res = await fn(ctx)
  return { status: res.status, body: await res.text(), type: res.headers.get('content-type') }
}

const server = http.createServer(async (req, res) => {
  const chunks = []
  for await (const c of req) chunks.push(c)
  const body = Buffer.concat(chunks)

  // 把 Node 原始请求转成标准 Request，让函数代码原样运行
  const stdReq = new Request('http://localhost:8788' + req.url, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
  })

  try {
    let out
    if (req.url.startsWith('/api/login/start') && req.method === 'POST') {
      out = await call(startFn, stdReq)
    } else if (req.url.startsWith('/api/login/check') && req.method === 'GET') {
      out = await call(checkFn, stdReq)
    } else if (req.url.startsWith('/api/wechat')) {
      out = req.method === 'GET' ? await call(wechatGet, stdReq) : await call(wechatPost, stdReq)
    } else if (req.method === 'GET') {
      out = { status: 200, body: '登录后端演示服务器运行中。接口：/api/login/start · /api/login/check · /api/wechat', type: 'text/plain; charset=utf-8' }
    } else {
      out = { status: 404, body: 'not found', type: 'text/plain' }
    }
    res.writeHead(out.status, { 'content-type': out.type ?? 'application/json' })
    res.end(out.body)
  } catch (e) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('error: ' + e.message)
  }
})

server.listen(8788, () => console.log('登录后端演示服务器 → http://localhost:8788'))
