import { useEffect, useMemo, useState } from 'react'
import { book, chapters, entries, countOfChapter } from '../data'
import type { BenefitKind, EvidenceLevel } from '../types'
import { BENEFIT_LABEL } from '../types'
import { Arrow, EntryCard } from '../components/common'
import { ChapterArt } from '../components/ChapterArt'

type BenefitFilter = BenefitKind | 'all'

export function Explore() {
  useEffect(() => {
    document.title = '检索全部建议 · 高性价比打工指南'
  }, [])

  const [q, setQ] = useState('')
  const [chId, setChId] = useState<string>('all')
  const [ev, setEv] = useState<EvidenceLevel | 'all'>('all')
  const [ben, setBen] = useState<BenefitFilter>('all')

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return entries.filter((e) => {
      if (chId !== 'all' && e.chapterId !== chId) return false
      if (ev !== 'all' && e.evidence.level !== ev) return false
      if (ben !== 'all' && e.benefit.kind !== ben) return false
      if (!kw) return true
      const hay = [e.title, e.summary, ...e.body, ...e.sources.map((s) => s.title)]
        .join(' ')
        .toLowerCase()
      return hay.includes(kw)
    })
  }, [q, chId, ev, ben])

  const filtered = q || chId !== 'all' || ev !== 'all' || ben !== 'all'
  const reset = () => {
    setQ('')
    setChId('all')
    setEv('all')
    setBen('all')
  }

  return (
    <div className="wrap page">
      <h1 className="page-title">检索全部建议</h1>
      <p className="page-lede">
        这是主入口。打工场景下最常见的用法是按「我现在卡在哪一步」查，
        比方说被裁了在看第 16 章、准备跳槽在看第 03 章。
      </p>

      <div className="filters">
        <input
          className="search-in"
          placeholder="搜索：竞业、加班费、试用期、社保、年终奖、时薪……"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="frow">
          <span className="flabel">章节</span>
          <button className={`chip ${chId === 'all' ? 'on' : ''}`} onClick={() => setChId('all')}>
            全部
          </button>
          {chapters.map((c) => (
            <button
              key={c.id}
              className={`chip ${chId === c.id ? 'on' : ''}`}
              onClick={() => setChId(c.id)}
            >
              第 {c.number} 章 {c.title}
            </button>
          ))}
        </div>

        <div className="frow">
          <span className="flabel">证据</span>
          {(['A', 'B', 'C'] as const).map((x) => (
            <button key={x} className={`chip ${ev === x ? 'on' : ''}`} onClick={() => setEv(x)}>
              {x}
            </button>
          ))}
          <div className="fdiv" />
          <span className="flabel">收益</span>
          <button className={`chip ${ben === 'all' ? 'on' : ''}`} onClick={() => setBen('all')}>
            全部
          </button>
          {(Object.keys(BENEFIT_LABEL) as BenefitKind[]).map((k) => (
            <button key={k} className={`chip ${ben === k ? 'on' : ''}`} onClick={() => setBen(k)}>
              {BENEFIT_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="result-line">
        <span className="rn">{list.length}</span>
        <span>{filtered ? `条 / 全部 ${entries.length} 条` : '条建议'}</span>
        {filtered && (
          <button className="rclear" onClick={reset}>
            清除筛选
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="empty">
          没有符合条件的建议。换个关键词，或
          <a onClick={reset} style={{ cursor: 'pointer' }}>
            {' '}
            清除筛选
          </a>
          {' '}
          试试。
        </div>
      ) : (
        <div className="entry-list">
          {list.map((e) => (
            <EntryCard key={e.id} e={e} />
          ))}
        </div>
      )}

      <div className="sec-head">
        <h2>按章节浏览</h2>
        <span className="sh-note">共 {chapters.length} 章</span>
      </div>

      <div className="ch-flow">
        {chapters.map((c) => (
          <a className="ch-row" key={c.id} href={`#/chapter/${c.id}`}>
            <div className="cr-art">
              <ChapterArt chapterId={c.id} />
            </div>
            <div>
              <div className="cr-title">
                <span className="cr-no">第 {c.number} 章</span>
                {c.title}
              </div>
              <div className="cr-part">{c.part}</div>
            </div>
            <div className="cr-count">{countOfChapter(c.id)} 条建议</div>
            <div className="cr-arrow">
              <Arrow />
            </div>
          </a>
        ))}
      </div>

      <div className="disclaimer mt-l">
        <span className="dc-label">免责说明</span>
        {book.disclaimer}
      </div>
    </div>
  )
}