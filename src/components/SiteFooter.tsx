import { useEffect, useState } from 'react'
import { chapters } from '../data'
import { CommunityDialog } from './CommunityDialog'
import { AUTHOR_NAME, AUTHOR_URL, SHOW_BUILD_CREDIT } from '../config'

/** 一比一复刻 howtolivebetter.net 的页脚结构：四列 + 底部三段 */
export function SiteFooter() {
  const [shareOpen, setShareOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  useEffect(() => {
    if (!shareOpen && !joinOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShareOpen(false)
        setJoinOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shareOpen, joinOpen])

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <>
      <footer className="life-footer">
        <div className="wrap">
          <div className="lf-grid">
            {/* 第一列：品牌 + 分享 */}
            <div className="lf-intro">
              <div className="lf-brand">
                高性价比打工指南
                <span className="lf-mark">✳</span>
              </div>
              <p>把好建议，过成好生活</p>
              <button
                type="button"
                className="lf-share"
                onClick={() => setShareOpen(true)}
              >
                <ShareIcon />
                把好建议分享给朋友
              </button>
            </div>

            {/* 第二列：探索内容 */}
            <nav className="lf-links" aria-label="探索内容">
              <span className="lf-heading">探索内容</span>
              <a href="#/chapter/ch03">阅读全书</a>
              <a href="#/explore">检索全部建议</a>
              <a href="#/daily">每日一问</a>
              <a href="#/calc">到手测算</a>
              <a href="#/explore">法律与风险</a>
              <a href="#/explore">高时薪专属</a>
              <a href="#/changelog">更新日志</a>
            </nav>

            {/* 第三列：交流与联系 */}
            <div className="lf-connect">
              <span className="lf-heading">交流与联系</span>
              <button type="button" className="lf-join" onClick={() => setJoinOpen(true)}>
                <ChatIcon />
                <span>加入社群</span>
              </button>
              <a href="#/contact">反馈与纠错</a>
              <a href="https://github.com/eternity4719/HowToLiveBetter" target="_blank" rel="noreferrer">
                原书仓库
              </a>
            </div>
          </div>

          <div className="lf-bottom">
            {/* 左：内容来源与声明 */}
            <div className="lf-sources">
              <span className="lf-heading">内容来源与声明</span>
              <p>
                本站为独立整理的打工场景版本，非官方版本。框架与计价方法参考
                <a href="https://howtolivebetter.net/" target="_blank" rel="noreferrer">
                  {' '}
                  HowToLiveBetter
                </a>
                ，新增「阈值线」判定口径。中文原作：
                <a
                  href="https://github.com/eternity4719/HowToLiveBetter"
                  target="_blank"
                  rel="noreferrer"
                >
                  eternity4719
                </a>
              </p>
              <p>
                内容仅供参考，劳动、法律和财务事项请结合当地情况与专业意见。
                {chapters.length > 0 && ' 本站已完成章节见下方导航。'}
              </p>
            </div>

            {/* 右：法律链接 + 署名 */}
            <div className="lf-legal">
              <a href="#/about">关于本站</a>
              <a href="#/contact">联系我们</a>
              <span className="lf-privacy">
                <a href="#/privacy">隐私政策</a>
                <button type="button" onClick={() => setShareOpen(true)}>
                  隐私设置
                </button>
              </span>
              <a href="#/terms">服务条款</a>
            </div>

            {/* 署名：名字是可点击的，指向作者主站 */}
            <div className="lf-credit">
              © 2026 Created by{' '}
              <a
                href={AUTHOR_URL}
                target={AUTHOR_URL.startsWith('/') ? undefined : '_blank'}
                rel={AUTHOR_URL.startsWith('/') ? undefined : 'noreferrer'}
              >
                {AUTHOR_NAME}
              </a>
              . All rights reserved.
              {SHOW_BUILD_CREDIT && ' Build with ❤ and AI'}
            </div>
          </div>
        </div>
      </footer>

      {shareOpen && (
        <Modal onClose={() => setShareOpen(false)} title="把好建议分享给朋友">
          <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: '0 0 18px', lineHeight: 1.7 }}>
            复制下面的链接发给同事，或者分享某一章。你的阅读进度不会随链接传出去，
            记录只存在你自己的浏览器里。
          </p>
          <CopyField label="网站首页" value={shareUrl} />
          <CopyField label="每日一问" value={`${shareUrl}/#/daily`} />
          <CopyField label="到手测算器" value={`${shareUrl}/#/calc`} />
        </Modal>
      )}

      {joinOpen && <CommunityDialog onClose={() => setJoinOpen(false)} />}
    </>
  )
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false)
  const copy = () => {
    const write = navigator.clipboard?.writeText(value)
    if (write) {
      write.then(() => {
        setDone(true)
        setTimeout(() => setDone(false), 1600)
      })
    }
  }
  return (
    <div className="copy-row">
      <div className="cr-label">{label}</div>
      <div className="cr-field">
        <input readOnly value={value} onFocus={(e) => e.currentTarget.select()} />
        <button type="button" onClick={copy}>
          {done ? '已复制' : '复制'}
        </button>
      </div>
    </div>
  )
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode
  onClose: () => void
  title: string
}) {
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} aria-label="关闭">
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
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