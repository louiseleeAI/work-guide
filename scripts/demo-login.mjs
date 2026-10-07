/**
 * 模拟微信回调的完整登录闭环演示。
 * 角色分工：本脚本扮演「微信服务器」+「浏览器」，wrangler 扮演我们的后端。
 */
import crypto from 'node:crypto'

const BASE = 'http://localhost:8788'
const TOKEN = 'local-demo-token' // 与 wrangler --var 一致

console.log('=== 0. 探活 ===')
const ping = await fetch(BASE).then((r) => r.status).catch((e) => 'ERR:' + e.message)
console.log(`GET / → ${ping}（200 即服务正常）`)

console.log('\n=== 1. 浏览器打开登录弹窗：POST /api/login/start ===')
const startRes = await fetch(`${BASE}/api/login/start`, { method: 'POST' })
const start = await startRes.json()
console.log(`→ ${JSON.stringify(start)}`)
const code = start.code

console.log('\n=== 2. 此时轮询 check：应为 pending ===')
const check1 = await (await fetch(`${BASE}/api/login/check?code=${code}`)).json()
console.log(`→ ${JSON.stringify(check1)}`)

console.log('\n=== 3. 微信服务器回调：用户向公众号发送了 6 位码 ===')
// 按微信规则生成签名：sha1(sort(token, timestamp, nonce).join(''))
const timestamp = String(Math.floor(Date.now() / 1000))
const nonce = 'demo-nonce-001'
const signature = crypto.createHash('sha1').update([TOKEN, timestamp, nonce].sort().join('')).digest('hex')
console.log(`签名参数：timestamp=${timestamp}, nonce=${nonce}, signature=${signature.slice(0, 16)}…`)

const xml = `<xml><ToUserName><![CDATA[gh_demo_account]]></ToUserName><FromUserName><![CDATA[user_openid_abc123]]></FromUserName><CreateTime>${timestamp}</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[${code}]]></Content></xml>`

const wechatRes = await fetch(
  `${BASE}/api/wechat?signature=${signature}&timestamp=${timestamp}&nonce=${nonce}`,
  { method: 'POST', body: xml, headers: { 'content-type': 'text/xml' } }
)
const replyXml = await wechatRes.text()
const replyText = (replyXml.match(/<Content><!\[CDATA\[([\s\S]*?)\]\]><\/Content>/) || [])[1]
console.log(`→ 微信收到自动回复：「${replyText}」`)

console.log('\n=== 4. 篡改签名的请求应被拒绝 ===')
const badRes = await fetch(
  `${BASE}/api/wechat?signature=deadbeef&timestamp=${timestamp}&nonce=${nonce}`,
  { method: 'POST', body: xml, headers: { 'content-type': 'text/xml' } }
)
console.log(`→ 伪造签名 POST /api/wechat → HTTP ${badRes.status}（403 = 拒绝 ✓）`)

console.log('\n=== 5. 浏览器再次轮询 check：应验证通过并签发 token ===')
const check2 = await (await fetch(`${BASE}/api/login/check?code=${code}`)).json()
console.log(`→ ${JSON.stringify(check2)}`)
console.log(`   token 存入 localStorage 后，30 天内免重复登录`)

console.log('\n=== 6. 码用过即失效（防重放）：再次 check 应为 expired ===')
const check3 = await (await fetch(`${BASE}/api/login/check?code=${code}`)).json()
console.log(`→ ${JSON.stringify(check3)}`)

console.log(
  `\n${check2.status === 'ok' && check3.status === 'expired' && badRes.status === 403 ? '✅ 闭环全部通过' : '❌ 有步骤未通过'}`
)
