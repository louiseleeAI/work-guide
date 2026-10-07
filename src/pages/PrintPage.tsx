import { useEffect } from 'react'
import { chapters, entriesOfChapter, entryNo, book } from '../data'
import type { Entry } from '../types'

/**
 * 打印视图：浏览器「打印 → 另存为 PDF」即得到 PDF 文件。
 * 黑字白底、衬线标题、按章分页，避免任何前端 PDF 库的中文字体问题。
 */
function thresholdLine(e: Entry): string {
  const t = e.threshold
  if (t.unit === 'none') return '不设时薪阈值'
  if (t.unit === 'hourly') return `时薪 ≥ ${t.value} 元/小时`
  if (t.unit === 'years') return `年限 ≥ ${t.value} 年`
  return `总包 ≥ ${t.value}`
}

export function PrintPage({ mode }: { mode: 'full' | 'simple' }) {
  useEffect(() => {
    document.title = mode === 'full' ? '完整版（打印）· 高性价比打工指南' : '精简版（打印）· 高性价比打工指南'
    const t = setTimeout(() => window.print(), 600)
    return () => clearTimeout(t)
  }, [mode])

  return (
    <div className="print-book">
      <h1 className="pb-title">{book.title}</h1>
      <p className="pb-sub">{book.subtitle}</p>
      <p className="pb-meta">
        更新日期 {book.updatedAt} · {chapters.length} 章 · {mode === 'full' ? '完整版' : '精简版'}
      </p>
      <p className="pb-disclaimer">{book.disclaimer}</p>

      {chapters.map((ch) => {
        const es = entriesOfChapter(ch.id)
        if (!es.length) return null
        return (
          <section className="pb-chapter" key={ch.id}>
            <h2 className="pb-ch-title">
              第 {ch.number} 章　{ch.title}
            </h2>
            {ch.intro.split('\n\n')[0] && <p className="pb-ch-intro">{ch.intro.split('\n\n')[0]}</p>}
            {es.map((e) => (
              <article className="pb-entry" key={e.id}>
                <h3 className="pb-en-title">
                  {entryNo(e)}　{e.title}
                </h3>
                <p className="pb-en-sum">{e.summary}</p>
                <p className="pb-en-th">
                  <b>阈值线</b>　{thresholdLine(e)}
                  {mode === 'full' && e.threshold.derivation && (
                    <span className="pb-en-deriv">推导：{e.threshold.derivation}</span>
                  )}
                </p>
                {e.steps?.length ? (
                  <ol className="pb-en-steps">
                    {e.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                ) : null}
                {mode === 'full' && (
                  <>
                    {e.body.map((p, i) => (
                      <p className="pb-en-p" key={i}>
                        {p.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
                          seg.startsWith('**') && seg.endsWith('**') ? <strong key={j}>{seg.slice(2, -2)}</strong> : seg
                        )}
                      </p>
                    ))}
                    <p className="pb-en-meta">
                      成本：钱 {e.cost.money} · 时间 {e.cost.time} · 毅力 {e.cost.will}　｜　
                      换回：{e.benefit.kind === 'cash' ? '现金流' : e.benefit.kind === 'seniority' ? '工龄复利' : '议价权'}
                      （{e.benefit.level}）　｜　证据 {e.evidence.level} 级
                    </p>
                    {e.sources.length > 0 && (
                      <p className="pb-en-src">
                        {e.sources.map((s) => `${s.title}${s.docNumber ? `（${s.docNumber}）` : ''}，${s.effectiveDate}`).join('；')}
                      </p>
                    )}
                  </>
                )}
              </article>
            ))}
          </section>
        )
      })}
      <p className="pb-end">— 全文完 —</p>
    </div>
  )
}
