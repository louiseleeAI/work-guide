import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { chapters, DISCLAIMER } from '../data'

/** 社群平台配置。链接待定，先用占位，用户替换成真实群链接即可。 */
const PLATFORMS = [
  {
    id: 'wechat',
    name: '微信群',
    /** 群二维码图片的 URL。放 public/ 目录下，或填外部图片地址。 */
    img: '/qrcode-wechat.png',
    /** 扫码后的引导文案 */
    hint: '微信扫一扫，或保存图片后在微信中识别。',
    /** 是否有「点击加入」按钮：微信只能扫码，没有深链 */
    joinable: false,
    /** 二维码有效期提示 */
    expiry: '此二维码长期有效。若已失效，请通过反馈页联系。',
    joinLabel: '',
    joinUrl: '',
    accent: '#2b7a3d',
    accentBg: '#f2f7f0',
  },
  {
    id: 'feishu',
    name: '飞书群',
    img: '/qrcode-feishu.png',
    hint: '飞书扫一扫，或点击下方按钮直接加入。',
    /** 飞书支持深链，可以直接跳转到加入页面 */
    joinable: true,
    expiry: '飞书二维码标记为永久有效。',
    joinLabel: '点击加入飞书群',
    joinUrl: '',
    accent: '#1f2329',
    accentBg: '#f2f3f5',
  },
] as const

type PlatformId = (typeof PLATFORMS)[number]['id']

export function CommunityDialog({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<PlatformId>('wechat')
  const platform = PLATFORMS.find((p) => p.id === tab)!
  const qrRef = useRef<HTMLCanvasElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  /** public/ 下是否放了真实的群二维码图片 */
  const [hasRealImage, setHasRealImage] = useState(false)

  /**
   * 二维码来源有两条路：
   * 1. 如果 public/ 下放了真实的社群二维码图片，直接用它（真实可扫）
   * 2. 没有的话，用当前站点地址生成一张（可扫到本站），并明确标注这是占位
   */
  useEffect(() => {
    let cancelled = false
    setQrDataUrl('')
    setHasRealImage(false)

    const probe = new Image()
    probe.onload = () => {
      if (!cancelled) setHasRealImage(true)
    }
    probe.onerror = () => {
      if (cancelled) return
      // 没有图片文件，用 qrcode 生成占位二维码
      const url = typeof window !== 'undefined' ? window.location.origin : ''
      QRCode.toDataURL(`${url}/#/contact`, {
        width: 560,
        margin: 1,
        color: { dark: '#16181d', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      })
        .then((d) => {
          if (!cancelled) setQrDataUrl(d)
        })
        .catch(() => {
          if (!cancelled) setQrDataUrl('')
        })
    }
    probe.src = platform.img
    return () => {
      cancelled = true
    }
  }, [platform.id, platform.img])

  // 生成占位码后绘制到 canvas，供下载使用
  useEffect(() => {
    if (!qrDataUrl || !qrRef.current) return
    const img = new Image()
    img.onload = () => {
      const cv = qrRef.current
      if (!cv) return
      const ctx = cv.getContext('2d')
      if (!ctx) return
      cv.width = img.width
      cv.height = img.height
      ctx.drawImage(img, 0, 0)
    }
    img.src = qrDataUrl
  }, [qrDataUrl])

  const download = () => {
    if (!hasRealImage) {
      // 占位码：从 canvas 导出
      const cv = qrRef.current
      if (!cv) return
      const a = document.createElement('a')
      a.href = cv.toDataURL('image/png')
      a.download = `占位二维码-${platform.name}.png`
      a.click()
      return
    }
    const a = document.createElement('a')
    a.href = platform.img
    a.download = `高性价比打工指南-${platform.name}二维码.png`
    a.click()
  }

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal community" onClick={(e) => e.stopPropagation()}>
        <div className="comm-head">
          <span className="comm-eyebrow">一起变得更划算</span>
          <button type="button" onClick={onClose} aria-label="关闭">
            <CloseIcon />
          </button>
        </div>

        <div className="comm-title">
          高性价比打工指南 <span>交流群</span>
        </div>

        <p className="comm-lede">
          聊聊你踩过的坑、分享算过的账。选你常用的平台加入交流。
        </p>

        {/* 平台切换 Tab */}
        <div className="comm-tabs">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`comm-tab ${tab === p.id ? 'on' : ''}`}
              onClick={() => setTab(p.id)}
              style={tab === p.id ? { background: '#fff', color: p.accent } : undefined}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* 二维码 */}
        <div className="comm-qr" style={{ background: platform.accentBg }}>
          {hasRealImage ? (
            <>
              <img src={platform.img} alt={`${platform.name}群二维码`} className="qr-img" />
              <div className="qr-logo">
                {platform.id === 'wechat' ? <WechatIcon /> : <FeishuIcon />}
              </div>
            </>
          ) : qrDataUrl ? (
            <>
              <img src={qrDataUrl} alt={`${platform.name}群二维码（占位）`} className="qr-img" />
              <div className="qr-logo" style={{ opacity: 0.35 }}>
                {platform.id === 'wechat' ? <WechatIcon /> : <FeishuIcon />}
              </div>
            </>
          ) : (
            <div className="qr-missing">
              正在生成二维码…
            </div>
          )}
          <canvas ref={qrRef} style={{ display: 'none' }} />
        </div>

        {!hasRealImage && (
          <p className="qr-note">
            这是指向本站的占位码。放真实群二维码到
            <code>public/qrcode-{platform.id}.png</code>
            即可替换。
          </p>
        )}

        <p className="comm-hint" style={{ color: platform.accent }}>
          {platform.hint}
        </p>

        {/* 主按钮：飞书支持深链 */}
        {platform.joinable && platform.joinUrl && (
          <a
            className="btn btn-primary comm-join"
            href={platform.joinUrl}
            target="_blank"
            rel="noreferrer"
            style={{ background: platform.accent, borderColor: platform.accent }}
          >
            {platform.joinLabel}
            <ExternalIcon />
          </a>
        )}

        {/* 下载按钮 */}
        <button
          type="button"
          className="btn comm-save"
          onClick={download}
          style={{ borderColor: platform.accent, color: platform.accent }}
        >
          <DownloadIcon />
          保存入群二维码
        </button>

        <p className="comm-expiry">
          {platform.expiry}
          <br />
          若已失效，请通过
          <a href="#/contact" onClick={onClose}>
            {' '}反馈页
          </a>
          告诉我们。
        </p>
      </div>
    </div>
  )
}

/** 静态说明：加入社群能获得什么 */
export function CommunityValue({ onOpen }: { onOpen: () => void }) {
  const n = chapters.length
  return (
    <div className="note" style={{ marginTop: 20 }}>
      <span className="n-label">加入交流群</span>
      聊聊你踩过的坑、分享算过的账。社群最需要的是两类反馈：
      <b>法条纠错</b>（数字、条款号、生效日期不对）和
      <b>地区差异</b>（竞业补偿、社保口径各地不一样，你所在地的实际情况更有价值）。
      <br />
      目前本站已完成 {n} 章，样板阶段。
      <button
        type="button"
        onClick={onOpen}
        style={{
          marginTop: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          fontSize: 13.5,
          padding: '8px 16px',
          borderRadius: 100,
          border: '1px solid var(--blue-200)',
          background: '#fff',
          color: 'var(--blue-700)',
          fontFamily: 'inherit',
        }}
      >
        <ChatIcon />
        加入交流群
      </button>
    </div>
  )
}

export { DISCLAIMER }

// ---- icons ----

function WechatIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
      <path d="M8.7 3C4.9 3 1.8 5.6 1.8 8.8c0 1.8 1 3.4 2.5 4.5l-.6 1.9 2.2-1.1c.7.2 1.5.3 2.3.3h.4a5.6 5.6 0 0 1-.2-1.4c0-3.2 3.1-5.8 7-5.8h.6C15.4 4.3 12.3 3 8.7 3zM6.3 6.7a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8zm4.6 0a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8z" />
      <path d="M22.2 13.1c0-2.6-2.7-4.7-6-4.7s-6 2.1-6 4.7 2.7 4.7 6 4.7c.7 0 1.3-.1 1.9-.2l1.8.9-.5-1.6c1.6-.9 2.8-2.3 2.8-3.8zm-8-.9a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6zm4 0a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6z" />
    </svg>
  )
}

function FeishuIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
      <path d="M18.2 10.5c-.2-.6-.8-1-1.4-.8l-3.4.9-1.9-3.3c-.2-.4-.7-.6-1.1-.4l-3.5 1.7c-.5.2-.8.8-.6 1.3l.5 1.2-1.3.3a1.3 1.3 0 0 0-.9 1.6l.9 3.2c.2.7.9 1.1 1.6.9l2-.5.1 3.5c0 .5.4.8.8.8h1.9c.5 0 .8-.4.8-.8v-3.6l3.6-.9c.6-.1 1-.8.9-1.4l-.9-3.5c-.2-.6-.5-.8-1-.8z" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}