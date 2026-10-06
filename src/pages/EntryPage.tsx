import { useEffect } from 'react'
import { entryMap, book, chapterMap, entryNo } from '../data'
import { BENEFIT_LABEL } from '../types'
import { thresholdText } from '../components/common'

function ThresholdIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M6 1.5L11 10H1L6 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** 极简 Markdown：**粗体** → <strong>，段落按空行切分 */
function RichText({ text }: { text: string }) {
  const paras = text.split('\n\n')
  return (
    <div className="d-body">
      {paras.map((p, i) => (
        <p key={i}>
          {p.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
            seg.startsWith('**') && seg.endsWith('**') ? (
              <strong key={j}>{seg.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{seg}</span>
            ),
          )}
        </p>
      ))}
    </div>
  )
}

export function EntryPage({ id }: { id: string }) {
  const e = entryMap.get(id)

  useEffect(() => {
    document.title = e
      ? `${e.title} · 高性价比打工指南`
      : '未找到 · 高性价比打工指南'
  }, [e])

  if (!e) {
    return (
      <div className="wrap page">
        <div className="empty">
          没有这条建议。<a href="#/">回到首页</a>
        </div>
      </div>
    )
  }

  const ch = chapterMap.get(e.chapterId)
  const costRow: [string, string][] = [
    ['钱', e.cost.money],
    ['时间', e.cost.time],
    ['毅力', e.cost.will],
  ]

  return (
    <div className="wrap-narrow detail">
      <a className="back" href={`#/chapter/${e.chapterId}`}>
        <span aria-hidden="true">←</span> 第 {ch?.number} 章 {ch?.title}
      </a>

      <div className="d-eyebrow">
        <span className="d-no">{entryNo(e)}</span>
        <a href={`#/chapter/${e.chapterId}`}>
          第 {ch?.number} 章 · {ch?.title}
        </a>
      </div>

      <h1 className="d-title">{e.title}</h1>
      <p className="d-sum">{e.summary}</p>

      {e.threshold.value > 0 ? (
        <div className="d-th">
          <div className="dth-label">
            <ThresholdIcon />
            阈值线 · 本条的判断分母
          </div>
          <div className="dth-main">
            {e.threshold.unit === 'hourly'
              ? `你的税后时薪 ≥ ${e.threshold.value} 元 / 小时，这一条才值得投入`
              : thresholdText(e)}
          </div>
          <div className="dth-below">{e.threshold.below}</div>
          <div className="dth-basis">口径：{e.threshold.basis}</div>
        </div>
      ) : (
        <div className="d-noth">
          <b>本条不设时薪阈值。</b> {e.threshold.below}
        </div>
      )}

      <RichText text={e.body.join('\n\n')} />

      <div className="d-meta">
        <div className="mbox">
          <div className="mb-label">花掉什么 · 三档成本</div>
          <div className="mb-val">
            {costRow.map(([k, v]) => (
              <span key={k} style={{ marginRight: 14 }}>
                {k} <b>{v}</b>
              </span>
            ))}
          </div>
        </div>
        <div className="mbox">
          <div className="mb-label">换回什么</div>
          <div className="mb-val">
            {BENEFIT_LABEL[e.benefit.kind]} <b>{e.benefit.level}</b>
          </div>
        </div>
        <div className="mbox">
          <div className="mb-label">证据等级</div>
          <div className="mb-val">
            <b>{e.evidence.level} 级</b>
            <br />
            {e.evidence.reason}
          </div>
        </div>
        <div className="mbox">
          <div className="mb-label">适用范围</div>
          <div className="mb-val">
            {e.appliesTo}
            {e.notFor && (
              <>
                <br />
                <span style={{ color: 'var(--ink-4)' }}>不适用：{e.notFor}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="d-sec">
        <h3>出处</h3>
        {e.sources.map((s, i) => (
          <div className="src" key={i}>
            <div className="src-title">
              {s.title}
              {s.docNumber && <span className="src-docno">{s.docNumber}</span>}
              {s.local && <span className="src-local">{s.region} 地方规定</span>}
            </div>
            <div className="src-meta">
              {s.local ? '地方性规定' : '全国性规定'}　·　{s.effectiveDate}
            </div>
            {s.url && (
              <div className="src-link">
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.url}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {e.note && (
        <div className="d-sec">
          <h3>备注 · 口径与争议</h3>
          <div className="note">
            <span className="n-label">读这一条之前先看</span>
            {e.note}
          </div>
        </div>
      )}

      {e.legal && (
        <div className="d-sec">
          <div className="disclaimer">
            <span className="dc-label">免责说明 · 本条涉及法律</span>
            {book.disclaimer}
          </div>
        </div>
      )}

      <a className="back mt-l" href={`#/chapter/${e.chapterId}`}>
        <span aria-hidden="true">←</span> 返回第 {ch?.number} 章
      </a>
    </div>
  )
}