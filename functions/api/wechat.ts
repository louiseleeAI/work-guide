/**
 * 微信公众号服务器回调（个人订阅号可用）。
 * 约定路由：/api/wechat —— 在公众号后台「基本配置」填此地址，Token 放环境变量 WECHAT_TOKEN。
 *
 * GET：微信服务器验证（echostr）
 * POST：接收用户消息，回复 6 位码中的数字即完成验证
 */

interface Env {
  KV: KVNamespace
  /** 公众号后台自己填的 Token，32 位以内 */
  WECHAT_TOKEN: string
}

type Ctx = PagesFunction<Env>

async function sha1(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** 校验微信签名：sha1(sort(token, timestamp, nonce)) */
async function verify(url: URL, token: string): Promise<boolean> {
  const sig = url.searchParams.get('signature') || ''
  const ts = url.searchParams.get('timestamp') || ''
  const nonce = url.searchParams.get('nonce') || ''
  if (!sig || !ts || !nonce || !token) return false
  const calc = await sha1([token, ts, nonce].sort().join(''))
  return calc === sig
}

/** 极简 XML 提取（微信消息结构固定，不值得引 XML 库） */
function pick(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`)) ||
    xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))
  return m ? m[1] : ''
}

function textReply(to: string, from: string, content: string): Response {
  const xml =
    `<xml><ToUserName><![CDATA[${to}]]></ToUserName>` +
    `<FromUserName><![CDATA[${from}]]></FromUserName>` +
    `<CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime>` +
    `<MsgType><![CDATA[text]]></MsgType>` +
    `<Content><![CDATA[${content}]]></Content></xml>`
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } })
}

export const onRequestGet: Ctx = async (context) => {
  const url = new URL(context.request.url)
  const ok = await verify(url, context.env.WECHAT_TOKEN)
  if (!ok) return new Response('signature mismatch', { status: 403 })
  return new Response(url.searchParams.get('echostr') || '', {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}

export const onRequestPost: Ctx = async (context) => {
  const url = new URL(context.request.url)
  const ok = await verify(url, context.env.WECHAT_TOKEN)
  if (!ok) return new Response('signature mismatch', { status: 403 })

  const body = await context.request.text()
  const from = pick(body, 'FromUserName') // 用户 openid
  const to = pick(body, 'ToUserName') // 公众号原始 ID
  const content = pick(body, 'Content').trim()

  // 提取 6 位数字（容忍「验证 123456」「登录码：123456」等写法）
  const digits = (content.match(/\b\d{6}\b/) || content.match(/\d{6}/) || [])[0]

  if (digits) {
    try {
      const state = await context.env.KV.get(`code:${digits}`)
      if (state === 'pending') {
        await context.env.KV.put(`code:${digits}`, 'verified', { expirationTtl: 600 })
        return textReply(
          from,
          to,
          '✓ 验证成功！回到网页，页面会自动登录并解锁下载。本条回复来自「高性价比打工指南」。'
        )
      }
    } catch {
      // KV 异常时也回复，避免用户无反馈
    }
  }

  return textReply(
    from,
    to,
    '收到！在下载页打开登录弹窗，把弹窗里的 6 位数字直接发给我，就能自动完成验证。\n\n回复「下载」获取网站地址。'
  )
}
