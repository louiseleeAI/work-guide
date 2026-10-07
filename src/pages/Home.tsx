import { useEffect, useState } from 'react'
import { book, entries, chapters, countOfChapter, entryNo } from '../data'
import { Arrow, thresholdText } from '../components/common'
import { calcSalary, type SalaryInput } from '../lib/calc'
import { promptOfDay, loadDaily, streak } from '../lib/daily'
import { ChapterArt } from '../components/ChapterArt'

export function Home() {
  useEffect(() => {
    document.title = '高性价比打工指南'
  }, [])

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>
              高性价比
              <br />
              打工指南
            </h1>
            <p className="sub">
              每条建议都写清楚：花掉什么，换回什么，以及
              <b>你的时薪要到多少，这条才值得做</b>。
              内容以现行法律和官方数据为准，不用从头读到尾，挑眼下最关心的一章开始。
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#/explore">
                从检索开始
                <Arrow />
              </a>
              <a className="btn" href="#/daily">
                今日一算
              </a>
              <a className="btn" href="#/calc">
                算我的时薪
              </a>
            </div>
          </div>
          <LiveHourly />
        </div>
      </section>

      <div className="wrap">
        <div className="stat-row" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
          <div className="stat">
            <div className="sv">{entries.length}</div>
            <div className="sl">条建议</div>
          </div>
          <div className="stat">
            <div className="sv">{chapters.length}</div>
            <div className="sl">个章节</div>
          </div>
          <div className="stat">
            <div className="sv">3</div>
            <div className="sl">种收益口径，互不换算</div>
          </div>
          <div className="stat">
            <div className="sv">{book.updatedAt.slice(5).replace('-', '.')}</div>
            <div className="sl">内容更新至</div>
          </div>
        </div>
      </div>

      <div className="wrap page">
        <div className="sec-head">
          <h2>这份指南和普通职场建议的区别</h2>
          <span className="sh-note">先算阈值线，再谈值不值</span>
        </div>

        <SampleEntry />

        <div className="pgrid">
          <div className="pcard">
            <div className="pn">01</div>
            <div className="pt">先看依据</div>
            <div className="pd">
              每条建议都标注证据等级与出处。法条给出条款号和生效日期，
              查得到具体数字的标 A 级，只有经验做法的标 C 级并直说。
            </div>
          </div>
          <div className="pcard">
            <div className="pn">02</div>
            <div className="pt">再算阈值</div>
            <div className="pd">
              打工决策高度依赖收入水平。同一个动作，对月薪 4k 的人是浪费，
              对 4w 的人是救命。所以每条建议先回答「你的时薪要到多少」。
            </div>
          </div>
          <div className="pcard">
            <div className="pn">03</div>
            <div className="pt">三种账不混算</div>
            <div className="pd">
              现金流、工龄复利、议价权分开算。省下的钱和避免的风险不合成总分。
              这条铁律决定了内容能不能被信任。
            </div>
          </div>
        </div>

        <DailyTeaser />

        <div className="sec-head">
          <h2>从最关心的章节开始</h2>
          <span className="sh-note">按打工生命周期编排</span>
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

        <p style={{ fontSize: 13.5, color: 'var(--ink-4)', marginTop: 20, lineHeight: 1.8 }}>
          当前为内容样板阶段，已完成三个章节：offer 总包拆解、加班的真实时薪、合同的坑。
          这三章覆盖了三种收益口径，法条密度最高，用来检验框架是否站得住。
          完整骨架共 28 篇 + 反面清单。
        </p>
      </div>
    </>
  )
}

function SampleEntry() {
  const e = entries[0]
  return (
    <div className="sample">
      <div className="sample-head">
        <div className="sample-eyebrow">示例条目 · {entryNo(e)}</div>
        <h3 className="sample-title">{e.title}</h3>
        <p className="sample-sum">{e.summary}</p>
      </div>
      <div className="sample-th">
        <div className="stl">阈值线</div>
        <div className="stv">{thresholdText(e)} 元/小时，这条建议才值得投入</div>
        <div className="stb">{e.threshold.below}</div>
      </div>
    </div>
  )
}

function DailyTeaser() {
  const prompt = promptOfDay()
  const [run, setRun] = useState(0)

  useEffect(() => {
    setRun(streak(loadDaily()))
  }, [])

  return (
    <a className="daily-teaser" href="#/daily">
      <div className="dt-left">
        <div className="dt-eyebrow">每日一问</div>
        <div className="dt-q">{prompt.q}</div>
        <div className="dt-mins">约 {prompt.mins} 分钟 · 今天还没算过</div>
      </div>
      <div className="dt-right">
        {run > 0 && (
          <>
            <div className="dt-run">{run}</div>
            <div className="dt-runl">连续天数</div>
          </>
        )}
        <div className="dt-go">
          去算
          <Arrow />
        </div>
      </div>
    </a>
  )
}

function LiveHourly() {
  const [s, setS] = useState<SalaryInput>({
    grossMonthly: 25000,
    insuranceRate: 0.105,
    fundRate: 0.12,
    baseCeiling: 0,
    dailyHours: 11,
    workDays: 25,
    specialDeduction: 2000,
  })
  const r = calcSalary(s)

  return (
    <div className="hero-card">
      <div className="hc-label">你的真实时薪（含公积金）</div>
      <div className="hc-val">
        {r.realHourly.toFixed(0)}
        <small>元/小时</small>
      </div>
      <div className="hc-sub">
        这是所有阈值判断的分母。改下面的数字试试，看结论怎么变。
      </div>

      <div style={{ marginTop: 18 }}>
        <div className="field" style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12.5, marginBottom: 5 }}>税前月薪</label>
          <input
            type="number"
            value={s.grossMonthly}
            onChange={(e) => setS({ ...s, grossMonthly: Number(e.target.value) || 0 })}
            style={{ padding: '7px 10px', fontSize: 14 }}
          />
        </div>
        <div className="field" style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12.5, marginBottom: 5 }}>每天实际工作小时（在岗口径）</label>
          <input
            type="number"
            step="0.5"
            value={s.dailyHours}
            onChange={(e) => setS({ ...s, dailyHours: Number(e.target.value) || 0 })}
            style={{ padding: '7px 10px', fontSize: 14 }}
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: 12.5, marginBottom: 5 }}>每月实际出勤天数</label>
          <input
            type="number"
            step="0.5"
            value={s.workDays}
            onChange={(e) => setS({ ...s, workDays: Number(e.target.value) || 0 })}
            style={{ padding: '7px 10px', fontSize: 14 }}
          />
        </div>
      </div>

      <div className="hc-row" style={{ marginTop: 14 }}>
        <span>现金到手月薪</span>
        <span style={{ fontWeight: 600 }}>{Math.round(r.netMonthly).toLocaleString('zh-CN')}</span>
      </div>
      <div className="hc-row">
        <span>公积金个人缴存</span>
        <span style={{ fontWeight: 600 }}>{Math.round(r.fundMonthly).toLocaleString('zh-CN')}</span>
      </div>
      <div className="hc-row">
        <span>月实际工时</span>
        <span style={{ fontWeight: 600 }}>{r.monthlyHours.toFixed(0)} 小时</span>
      </div>
    </div>
  )
}