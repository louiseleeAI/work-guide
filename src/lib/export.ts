/**
 * 全书导出：从数据层生成 Markdown / Word(HTML) 内容。
 * 完整版 = 正文 + 出处 + 备注；精简版 = 结论 + 阈值 + 三步清单。
 */
import { chapters, entriesOfChapter, entryNo, book } from '../data'
import type { Entry } from '../types'

/** 阈值的一句话主值 */
function thresholdMain(e: Entry): string {
  const t = e.threshold
  if (t.unit === 'none') return '不设时薪阈值——' + t.basis
  if (t.unit === 'hourly') return `你的税后时薪 ≥ ${t.value} 元/小时`
  if (t.unit === 'years') return `年限 ≥ ${t.value} 年`
  return `总包 ≥ ${t.value}`
}

const BENEFIT: Record<string, string> = { cash: '现金流', seniority: '工龄复利', bargain: '议价权' }

export function entryMarkdown(e: Entry, full: boolean): string {
  const lines: string[] = []
  lines.push(`### ${entryNo(e)} ${e.title}`)
  lines.push('')
  lines.push(`> ${e.summary}`)
  lines.push('')
  lines.push(`**阈值线**：${thresholdMain(e)}`)
  if (full && e.threshold.derivation) lines.push(`\n> 推导：${e.threshold.derivation}`)
  lines.push('')
  if (e.steps?.length) {
    lines.push('**三步清单**')
    e.steps.forEach((s, i) => lines.push(`${i + 1}. ${s}`))
    lines.push('')
  }
  if (full) {
    lines.push(e.body.join('\n\n'))
    lines.push('')
    lines.push(
      `成本：钱 ${e.cost.money} · 时间 ${e.cost.time} · 毅力 ${e.cost.will}　|　` +
        `换回：${BENEFIT[e.benefit.kind]}（${e.benefit.level}）　|　证据 ${e.evidence.level} 级`
    )
    if (e.evidence.reason) lines.push(`\n证据说明：${e.evidence.reason}`)
    lines.push(`适用：${e.appliesTo}`)
    if (e.notFor) lines.push(`不适用：${e.notFor}`)
    if (e.note) lines.push(`\n> 备注：${e.note}`)
    if (e.sources.length) {
      lines.push('')
      lines.push('**出处**')
      for (const s of e.sources) {
        lines.push(
          `- ${s.title}${s.docNumber ? `（${s.docNumber}）` : ''}，${s.effectiveDate}${s.local ? `，${s.region}地方规定` : ''}`
        )
      }
    }
    if (e.legal) lines.push('\n⚠️ 本条涉及法律决策，具体以当地裁审口径为准，不构成法律意见。')
  }
  lines.push('')
  return lines.join('\n')
}

export function buildMarkdown(full: boolean): string {
  const out: string[] = []
  out.push(`# ${book.title}`)
  out.push('')
  out.push(`> ${book.subtitle}`)
  out.push(`> 更新日期：${book.updatedAt} · 共 ${chapters.length} 章`)
  out.push('')
  out.push(book.disclaimer)
  out.push('')
  out.push('> 来源：《高性价比打工指南》 https://louiseai.site ｜ 本版本源码：https://github.com/louiseleeAI/work-guide')
  out.push('> 创作灵感来自《高性价比人生指南》原作（作者 eternity4719）：https://github.com/eternity4719/HowToLiveBetter ；功能形态参考读者网站 HowToLiveBetter.net')
  out.push('> 内容为独立新写，遵循 CC BY 4.0：https://creativecommons.org/licenses/by/4.0/ （转载请注明出处并附许可证链接）')
  out.push('')
  for (const ch of chapters) {
    const es = entriesOfChapter(ch.id)
    if (!es.length) continue
    out.push(`## 第 ${ch.number} 章　${ch.title}`)
    out.push('')
    out.push(ch.intro.split('\n\n')[0])
    out.push('')
    for (const e of es) out.push(entryMarkdown(e, full))
    out.push('---')
    out.push('')
  }
  return out.join('\n')
}

/** Word 用的 HTML（.doc 兼容格式，Word/WPS 直接打开） */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** 把 **粗体** 转成 <strong>，其余原样转义 */
function inline(s: string): string {
  return esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

export function buildWordHtml(full: boolean): string {
  const parts: string[] = []
  parts.push(`<h1>${esc(book.title)}</h1><p><em>${esc(book.subtitle)}</em></p>`)
  parts.push(`<p>更新日期：${esc(book.updatedAt)}</p><p>${esc(book.disclaimer)}</p><hr/>`)
  for (const ch of chapters) {
    const es = entriesOfChapter(ch.id)
    if (!es.length) continue
    parts.push(`<h2>第 ${ch.number} 章　${esc(ch.title)}</h2>`)
    for (const p of ch.intro.split('\n\n')) parts.push(`<p>${inline(p).replace(/\n/g, '<br/>')}</p>`)
    for (const e of es) {
      parts.push(`<h3>${entryNo(e)}　${esc(e.title)}</h3>`)
      parts.push(`<p><strong>【结论】</strong>${inline(e.summary)}</p>`)
      parts.push(`<p><strong>【阈值线】</strong>${inline(thresholdMain(e))}</p>`)
      if (full && e.threshold.derivation)
        parts.push(`<p><em>推导：${inline(e.threshold.derivation)}</em></p>`)
      if (e.steps?.length) {
        parts.push('<p><strong>【三步清单】</strong></p><ol>')
        e.steps.forEach((s) => parts.push(`<li>${inline(s)}</li>`))
        parts.push('</ol>')
      }
      if (full) {
        for (const p of e.body) parts.push(`<p>${inline(p).replace(/\n/g, '<br/>')}</p>`)
        parts.push(
          `<p><small>成本：钱 ${e.cost.money} · 时间 ${e.cost.time} · 毅力 ${e.cost.will}｜换回：${BENEFIT[e.benefit.kind]}（${e.benefit.level}）｜证据 ${e.evidence.level} 级</small></p>`
        )
        if (e.sources.length) {
          parts.push('<p><small><strong>出处：</strong><br/>')
          for (const s of e.sources)
            parts.push(
              `${esc(s.title)}${s.docNumber ? `（${esc(s.docNumber)}）` : ''}，${esc(s.effectiveDate)}<br/>`
            )
          parts.push('</small></p>')
        }
      }
    }
    parts.push('<hr/>')
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(book.title)}</title>
<style>body{font-family:'Songti SC',SimSun,serif;line-height:1.8;max-width:42em;margin:0 auto;padding:2em;color:#16181d}
h1{font-size:1.9em}h2{border-bottom:1px solid #ccc;padding-bottom:6px}h3{margin-top:1.6em}
blockquote{border-left:3px solid #1d5cab;margin:0;padding-left:12px;color:#3f434c}
small{color:#6b7280}</style></head><body>${parts.join('\n')}</body></html>`
}
