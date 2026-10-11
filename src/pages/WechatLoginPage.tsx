import { useEffect, useRef, useState } from 'react'

type WlState =
  | { phase: 'checking' }
  | { phase: 'ok' }
  | { phase: 'pending' }
  | { phase: 'expired' }

/** 公众号回复链接的落地页：/#/wechat-login?code=xxxxxx
 *  场景：用户在微信里点开公众号回复中的一键登录链接（原网页已关闭或换设备）。
 *  行为与下载页轮询一致：调 /api/login/check，成功则签发 30 天 token 并引导去下载页。 */
export function WechatLoginPage({ code }: { code: string }) {
  const [state, setState] = useState<WlState>({ phase: 'checking' })
  const alive = useRef(true)

  useEffect(() => {
    document.title = '一键登录 · 高性价比打工指南'
    alive.current = true

    async function poll() {
      if (!alive.current) return
      try {
        const r = await fetch(`/api/login/check?code=${code}`)
        const j = (await r.json()) as { status: string; token?: string }
        if (!alive.current) return
        if (j.status === 'ok' && j.token) {
          try {
            localStorage.setItem('wg_token', j.token)
          } catch {
            /* ignore */
          }
          setState({ phase: 'ok' })
          return
        }
        if (j.status === 'pending') {
          window.setTimeout(poll, 2500)
          return
        }
        setState({ phase: 'expired' })
      } catch {
        window.setTimeout(poll, 4000)
      }
    }

    if (/^\d{6}$/.test(code)) poll()
    else setState({ phase: 'expired' })

    return () => {
      alive.current = false
    }
  }, [code])

  return (
    <div className="wl-wrap">
      <div className="wl-card">
        <div className="wl-eyebrow">一键登录</div>
        {state.phase === 'checking' && (
          <>
            <h1 className="wl-title">正在确认登录…</h1>
            <p className="wl-sub">正在向服务器核验登录码 {code}，请稍候。</p>
          </>
        )}
        {state.phase === 'pending' && (
          <>
            <h1 className="wl-title">等待验证中…</h1>
            <p className="wl-sub">
              登录码 {code} 还没被确认。请在公众号里重新发送这个 6 位数字，页面会自动完成登录。
            </p>
          </>
        )}
        {state.phase === 'ok' && (
          <>
            <h1 className="wl-title">✓ 登录成功</h1>
            <p className="wl-sub">本设备已记住登录状态（30 天有效），下载不再需要验证。</p>
            <a className="wl-cta" href="#/download">
              去下载全书 →
            </a>
          </>
        )}
        {state.phase === 'expired' && (
          <>
            <h1 className="wl-title">链接已失效</h1>
            <p className="wl-sub">
              登录链接 5 分钟内有效、仅可使用一次——它可能已被原网页使用或已超时。请回到原网页重新获取登录码。
            </p>
            <a className="wl-cta" href="#/download">
              返回下载页 →
            </a>
          </>
        )}
      </div>
    </div>
  )
}
