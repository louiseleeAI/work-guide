import { useEffect, useState } from 'react'
import { chapters, entries } from '../data'
import { downloadMarkdown, downloadWord, goPrint } from '../lib/download'
import wechatBanner from '../assets/wechat-search-banner.jpg'

/** 格式卡片数据：一比一对应参考站的五个格式位 */
const FORMATS = [
  {
    id: 'pdf-full',
    title: '下载 PDF 完整版',
    desc: '全部条目的完整解释、成本、收益、备注、来源和网站链接',
    icon: 'doc',
  },
  {
    id: 'pdf-simple',
    title: '下载 PDF 精简版',
    desc: '全部建议的精简要点、证据等级和三步清单，适合快速浏览',
    icon: 'doc',
  },
  {
    id: 'word-full',
    title: '下载 Word',
    desc: '可编辑的完整版，含完整解释、成本、收益、备注、来源和网站链接',
    icon: 'page',
  },
  {
    id: 'markdown-full',
    title: '下载 Markdown',
    desc: '完整纯文本，含全部建议、证据等级和来源；适合笔记与 AI 工具',
    icon: 'md',
  },
] as const

type FormatId = (typeof FORMATS)[number]['id']

function FormatIcon({ kind }: { kind: 'doc' | 'page' | 'md' }) {
  const stroke = { stroke: 'currentColor', strokeWidth: 1.4, fill: 'none' } as const
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      {kind === 'doc' && (
        <>
          <path d="M7 3h8l4 4v14H7z" {...stroke} />
          <path d="M15 3v4h4M10 12h6M10 16h6" {...stroke} />
        </>
      )}
      {kind === 'page' && (
        <>
          <path d="M6 3h12v18H6z" {...stroke} />
          <path d="M9 8h6M9 12h6M9 16h4" {...stroke} />
        </>
      )}
      {kind === 'md' && (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" {...stroke} />
          <path d="M7 14v-4l2.5 2.5L12 10v4M15.5 10v4M14 12.5l1.5 1.5 1.5-1.5" {...stroke} />
        </>
      )}
    </svg>
  )
}

function DownArrow() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4v13m0 0l-5-5m5 5l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type LoginState =
  | { phase: 'starting' }
  | { phase: 'server'; code: string; status: 'pending' | 'ok' }
  | { phase: 'local'; code: string }

/** 登录弹窗：一比一复刻参考站的「公众号验证码登录」。
 *  服务可用时走 /api/login/start + 轮询 check；不可用（本地预览/未部署）时降级为本地码。
 *  onVerified：验证成功时回调父级（父级负责放行下载并关弹窗）。 */
function LoginModal({
  onClose,
  onVerified,
}: {
  onClose: () => void
  onVerified: () => void
}) {
  const [state, setState] = useState<LoginState>({ phase: 'starting' })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    let timer: number | undefined

    async function start() {
      try {
        const r = await fetch('/api/login/start', { method: 'POST' })
        if (!r.ok) throw new Error('unavailable')
        const j = (await r.json()) as { ok: boolean; code?: string }
        if (!j.ok || !j.code) throw new Error('unavailable')
        if (!alive) return
        setState({ phase: 'server', code: j.code, status: 'pending' })
        poll(j.code)
      } catch {
        if (!alive) return
        setState({ phase: 'local', code: '' })
      }
    }

    async function poll(code: string) {
      try {
        const r = await fetch(`/api/login/check?code=${code}`)
        const j = (await r.json()) as { status: string; token?: string }
        if (!alive) return
        if (j.status === 'ok' && j.token) {
          try {
            localStorage.setItem('wg_token', j.token)
          } catch {
            /* ignore */
          }
          setState((s) => (s.phase === 'server' ? { ...s, status: 'ok' } : s))
          onVerified()
          return
        }
        if (j.status === 'pending') {
          timer = window.setTimeout(() => poll(code), 2500)
          return
        }
      } catch {
        // 网络抖动继续轮询
        timer = window.setTimeout(() => poll(code), 4000)
      }
    }

    start()
    return () => {
      alive = false
      if (timer) clearTimeout(timer)
    }
  }, [])

  const code = state.phase === 'starting' ? '……' : state.code || '——'
  const verified = state.phase === 'server' && state.status === 'ok'

  return (
    <div className="dl-modal-mask" onClick={onClose}>
      <div className="dl-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dlm-head">
          <div className="dlm-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5c-2-1.5-4.5-2-7-1.5v14c2.5-.5 5 0 7 1.5 2-1.5 4.5-2 7-1.5v-14C16.5 3 14 3.5 12 5z" stroke="currentColor" strokeWidth="1.4" />
              <path d="M12 5v14" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </div>
          <div>
            <div className="dlm-eyebrow">免费下载</div>
            <h3 className="dlm-title">{verified ? '验证成功' : '登录后继续下载'}</h3>
            <p className="dlm-sub">
              {verified ? '已解锁，正在返回下载…' : '完成登录后返回本页，即可选择 PDF、Word 或 Markdown 下载。'}
            </p>
          </div>
          <button className="dlm-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        <div className="dlm-body">
          <div className="dlm-form">
            <img
              className="dlm-banner"
              src={wechatBanner}
              alt="微信搜一搜：菠萝君学AI（扫码关注公众号）"
            />
            <div className="dlm-wechat-label">
              <span className="dlm-wx-dot" />
              微信登录
            </div>
            <p className="dlm-hint">
              关注公众号后，在公众号聊天窗口<b>直接发送</b>这 6 位数字（就像给朋友发微信消息一样），本页会自动登录。
            </p>
            <div className="dlm-code-card">
              <div className="dlm-code-label">在公众号发送这 6 位登录码</div>
              <div className="dlm-code-row">
                <span className={`dlm-code${verified ? ' dlm-code-ok' : ''}`}>{code}</span>
                <button
                  className="dlm-copy"
                  onClick={() => {
                    navigator.clipboard?.writeText(code).catch(() => {})
                    setCopied(true)
                  }}
                >
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <div className="dlm-status">
                <span className={`dlm-status-dot${verified ? ' ok' : ''}`} />
                {state.phase === 'starting' && '正在生成登录码…'}
                {state.phase === 'local' && '登录服务暂不可用，请稍后刷新重试'}
                {state.phase === 'server' && state.status === 'pending' && '等待你在微信中发送…'}
                {verified && '验证成功，登录已生效（30 天有效）'}
              </div>
            </div>
            {state.phase === 'local' && (
              <div className="dlm-beta-note">
                登录服务开小差了，<b>刷新页面</b>重新获取登录码；多次失败请稍后再来。
              </div>
            )}
            {verified && (
              <div className="dlm-beta-note">
                <b>已验证。</b>文件马上自动开始下载；若浏览器拦截，请允许「多个文件下载」或在弹窗关闭后重试。关注公众号可第一时间收到章节更新。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DownloadPage() {
  const [modal, setModal] = useState(
    () => typeof window !== 'undefined' && window.location.hash.includes('modal=1')
  )
  const [authed, setAuthed] = useState(
    () => typeof window !== 'undefined' && !!localStorage.getItem('wg_token')
  )
  const [pending, setPending] = useState<FormatId | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [wxHint, setWxHint] = useState(false)

  useEffect(() => {
    document.title = '下载全书 · 高性价比打工指南'
  }, [])

  const entryCount = entries.length
  const inWeChat =
    typeof window !== 'undefined' && /MicroMessenger/i.test(window.navigator.userAgent)

  function openModal(id: FormatId) {
    // 已登录过（30 天 token 在 localStorage）直接放行下载，不再弹窗
    if (authed) {
      execDownload(id)
      return
    }
    setPending(id)
    setModal(true)
  }

  function execDownload(id: FormatId | null) {
    if (!id) return
    // 微信内置浏览器不支持打印导出 PDF：给指引而不是跳打印页
    if ((id === 'pdf-full' || id === 'pdf-simple') && inWeChat) {
      setWxHint(true)
      return
    }
    if (id === 'pdf-full') goPrint('full')
    else if (id === 'pdf-simple') goPrint('simple')
    else if (id === 'word-full') downloadWord(true)
    else if (id === 'markdown-full') downloadMarkdown(true)
    setToast('已开始下载 / 已打开打印视图（浏览器菜单选「另存为 PDF」）')
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div className="dl-wrap">
      <div className="dl-panel">
        <div className="dl-left">
          <div className="dl-eyebrow">免费下载</div>
          <h1 className="dl-title">选择格式，开始下载</h1>
          <p className="dl-desc">
            PDF 适合打印，Word 适合编辑批注，Markdown 适合笔记与 AI 工具。点击格式后在公众号发送 6 位登录码即可解锁下载，登录 30 天内有效。
          </p>
          <div className="dl-meta">
            当前收录 {chapters.length} 章 · {entryCount} 条建议 · 数据即代码，随每次更新重排
            {authed && (
              <button
                className="dl-logout"
                onClick={() => {
                  try {
                    localStorage.removeItem('wg_token')
                  } catch {
                    /* ignore */
                  }
                  setAuthed(false)
                  setToast('已退出登录，下次下载需重新验证')
                  setTimeout(() => setToast(null), 4000)
                }}
              >
                已登录（30 天有效）· 退出登录
              </button>
            )}
          </div>
        </div>
        <div className="dl-cards">
          {FORMATS.map((f) => (
            <button key={f.id} className="dl-card" onClick={() => openModal(f.id)}>
              <span className="dl-card-icon">
                <FormatIcon kind={f.icon} />
              </span>
              <span className="dl-card-main">
                <span className="dl-card-title">{f.title}</span>
                <span className="dl-card-desc">{f.desc}</span>
              </span>
              <span className="dl-card-arrow">
                <DownArrow />
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="dl-foot">
        全部内容同样可以直接在网站上阅读（
        <a href="#/explore">检索页</a>）。本站的每一版文件都从同一份数据生成，更新网站即更新文件。
      </p>

      {toast && <div className="dl-toast">{toast}</div>}

      {wxHint && (
        <div className="dl-modal-mask" onClick={() => setWxHint(false)}>
          <div className="dl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dlm-head">
              <div>
                <div className="dlm-eyebrow">微信内导出 PDF</div>
                <h3 className="dlm-title">需要先跳到浏览器</h3>
                <p className="dlm-sub">微信内置浏览器不支持打印导出，两个办法任选：</p>
              </div>
              <button className="dlm-close" onClick={() => setWxHint(false)} aria-label="关闭">
                ×
              </button>
            </div>
            <div className="dlm-body">
              <div className="dlm-form">
                <p className="dlm-hint">
                  <b>办法一（拿到 PDF）</b>
                  <br />
                  点右上角「···」→「在浏览器中打开」→ 在浏览器里重新点 PDF → 打印窗口选「另存为 PDF」。
                  <br />
                  <br />
                  <b>办法二（手机更省事）</b>
                  <br />
                  直接下载 <b>Word</b> 或 <b>Markdown</b> 版本，手机上可以直接保存和查看。
                </p>
                <button
                  className="dlm-skip"
                  onClick={() => {
                    setWxHint(false)
                    downloadMarkdown(true)
                    setToast('Markdown 版已开始下载')
                    setTimeout(() => setToast(null), 4000)
                  }}
                >
                  直接下载 Markdown 版 →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <LoginModal
          onClose={() => {
            setModal(false)
            setPending(null)
          }}
          onVerified={() => {
            setAuthed(true)
            // 稍作停留让用户看到「验证成功」，然后自动开始下载并关闭弹窗
            const id = pending
            if (id) {
              window.setTimeout(() => {
                execDownload(id)
                setModal(false)
                setPending(null)
              }, 1500)
            }
          }}
        />
      )}
    </div>
  )
}
