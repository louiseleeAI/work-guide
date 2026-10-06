import { useEffect } from 'react'
import { chapters, chapterMap, entriesOfChapter, neighborChapters } from '../data'
import { Arrow, EntryCard } from '../components/common'
import { ChapterArt } from '../components/ChapterArt'

export function ChapterPage({ id }: { id: string }) {
  const ch = chapterMap.get(id)
  const list = entriesOfChapter(id)
  const { prev, next } = neighborChapters(id)

  useEffect(() => {
    document.title = ch
      ? `第 ${ch.number} 章 ${ch.title} · 高性价比打工指南`
      : '未找到 · 高性价比打工指南'
  }, [ch])

  if (!ch) {
    return (
      <div className="wrap page">
        <div className="empty">
          没有这个章节。<a href="#/">回到首页</a>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap page">
      <div className="ch-layout">
        <aside className="ch-side">
          <div className="side-art">
            <ChapterArt chapterId={ch.id} />
          </div>
          <div className="cs-label">全部章节</div>
          {chapters.map((c) => (
            <a key={c.id} href={`#/chapter/${c.id}`} className={c.id === id ? 'on' : ''}>
              <span className="cs-no">{c.number}</span>
              {c.title}
            </a>
          ))}
        </aside>

        <div>
          <a className="back" href="#/">
            <span aria-hidden="true">←</span> 返回
          </a>

          <div style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 8 }}>
            第 {ch.number} 章 · {ch.part}
          </div>
          <h1 className="page-title">{ch.title}</h1>

          <div className="ch-hero">
            <ChapterArt chapterId={ch.id} />
          </div>

          <div
            style={{
              fontSize: 15.5,
              color: 'var(--ink-2)',
              lineHeight: 1.85,
              whiteSpace: 'pre-line',
              paddingBottom: 26,
              borderBottom: '1px solid var(--line)',
              marginBottom: 20,
            }}
          >
            {ch.intro}
          </div>

          <div style={{ marginBottom: 28 }}>
            {ch.sourceRepo && (
              <a className="srcbook" href={ch.sourceRepo} target="_blank" rel="noreferrer">
                查看本章源文件
                <Arrow />
              </a>
            )}
          </div>

          <div className="result-line">
            <span className="rn">{list.length}</span>
            <span>条建议</span>
          </div>

          <div className="entry-list">
            {list.map((e, i) => (
              <EntryCard key={e.id} e={e} index={i} />
            ))}
          </div>

          {(prev || next) && (
            <div className="ch-nav">
              {prev ? (
                <a className="prev" href={`#/chapter/${prev.id}`}>
                  <div className="cn-dir">上一章</div>
                  <div className="cn-title">
                    {prev.number} {prev.title}
                  </div>
                </a>
              ) : (
                <span />
              )}
              {next && (
                <a className="next" href={`#/chapter/${next.id}`}>
                  <div className="cn-dir">下一章</div>
                  <div className="cn-title">
                    {next.number} {next.title}
                  </div>
                </a>
              )}
            </div>
          )}

          <a className="back mt-l" href="#/explore">
            在检索页查看全部章节
            <Arrow />
          </a>
        </div>
      </div>
    </div>
  )
}