import { useEffect, useState } from 'react'
import { chapters, entries } from '../data'
import { downloadMarkdown, downloadWord, goPrint } from '../lib/download'

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

/** 登录弹窗：一比一复刻参考站的「公众号验证码登录」，后端接入前标注说明 */
function LoginModal({ onClose, onSkip }: { onClose: () => void; onSkip: () => void }) {
  const [code] = useState(() => String(Math.floor(100000 + Math.random() * 900000)))
  const [copied, setCopied] = useState(false)

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
            <h3 className="dlm-title">登录后继续下载</h3>
            <p className="dlm-sub">完成登录后返回本页，即可选择 PDF、Word 或 Markdown 下载。</p>
          </div>
          <button className="dlm-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        <div className="dlm-body">
          <div className="dlm-qr-zone">
            <div className="dlm-qr-card">
              <div className="dlm-qr-placeholder">
                <span>公众号</span>
                <span>二维码</span>
              </div>
            </div>
          </div>
          <div className="dlm-form">
            <div className="dlm-wechat-label">
              <span className="dlm-wx-dot" />
              微信登录
            </div>
            <p className="dlm-hint">关注公众号后，发送下方的 6 位登录码，本页会自动登录。</p>
            <div className="dlm-code-card">
              <div className="dlm-code-label">在公众号发送这 6 位登录码</div>
              <div className="dlm-code-row">
                <span className="dlm-code">{code}</span>
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
                <span className="dlm-status-dot" />
                等待你在微信中发送…
              </div>
            </div>
            <div className="dlm-beta-note">
              登录服务正在接入公众号后台，当前阶段所有格式<b>免登录直接下载</b>。
            </div>
            <button className="dlm-skip" onClick={onSkip}>
              跳过登录，直接下载 →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DownloadPage() {
  const [modal, setModal] = useState(false)
  const [pending, setPending] = useState<FormatId | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    document.title = '下载全书 · 高性价比打工指南'
  }, [])

  const entryCount = entries.length

  function openModal(id: FormatId) {
    setPending(id)
    setModal(true)
  }

  function execDownload(id: FormatId | null) {
    if (!id) return
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
            PDF 适合打印，Word 适合编辑批注，Markdown 适合笔记与 AI 工具。点击格式后，登录界面为预览状态，当前阶段直接下载。
          </p>
          <div className="dl-meta">
            当前收录 {chapters.length} 章 · {entryCount} 条建议 · 数据即代码，随每次更新重排
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

      {modal && (
        <LoginModal
          onClose={() => {
            setModal(false)
            setPending(null)
          }}
          onSkip={() => {
            execDownload(pending)
            setModal(false)
            setPending(null)
          }}
        />
      )}
    </div>
  )
}
