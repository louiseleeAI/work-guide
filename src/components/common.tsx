import type { Entry } from '../types'
import { BENEFIT_LABEL } from '../types'
import { entryNo } from '../data'

/** 阈值线的文字描述 */
export function thresholdText(e: Entry): string {
  const t = e.threshold
  if (t.unit === 'none') return '不设阈值线'
  if (t.unit === 'hourly') return `时薪 ≥ ${t.value}`
  if (t.unit === 'years') return `年限 ≥ ${t.value} 年`
  return `总包 ≥ ${t.value}`
}

function ThresholdIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M6 1.5L11 10H1L6 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function BenefitPill({ e }: { e: Entry }) {
  const cls =
    e.benefit.kind === 'cash'
      ? 'pill-teal'
      : e.benefit.kind === 'seniority'
        ? 'pill-blue'
        : 'pill-violet'
  return (
    <span className={`pill ${cls}`}>
      {BENEFIT_LABEL[e.benefit.kind]} · {e.benefit.level}
    </span>
  )
}

export function EvidencePill({ level }: { level: 'A' | 'B' | 'C' }) {
  const cls = level === 'A' ? 'pill-blue' : level === 'B' ? 'pill-amber' : ''
  const desc =
    level === 'A' ? '查得到具体数字' : level === 'B' ? '有依据无精确数字' : '经验与通行做法'
  return (
    <span className={`pill ${cls}`} title={desc}>
      证据 {level}
    </span>
  )
}

export function ThresholdMark({ e }: { e: Entry }) {
  const t = e.threshold
  if (t.unit === 'none') return null
  return (
    <span className="th-mark">
      <ThresholdIcon />
      {thresholdText(e)}
      {t.unit === 'hourly' && t.value ? ' 元/时' : ''}
    </span>
  )
}

export function EntryCard({ e }: { e: Entry; index?: number }) {
  return (
    <a className="entry-card" href={`#/entry/${e.id}`}>
      <div className="ec-head">
        <span className="ec-no">{entryNo(e)}</span>
        <span className="ec-title">{e.title}</span>
      </div>
      <p className="ec-sum">{e.summary}</p>
      <div className="ec-foot">
        <ThresholdMark e={e} />
        <BenefitPill e={e} />
        <EvidencePill level={e.evidence.level} />
        {e.legal && <span className="pill pill-red">涉法律</span>}
      </div>
    </a>
  )
}

export function Arrow() {
  return <ArrowIcon />
}