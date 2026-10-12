import { useEffect, useState } from 'react'
import { book, entries, chapters, countOfChapter, entryNo, entryMap, chapterMap } from '../data'
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
      <section className="hero hero-dark">
        <div className="wrap hero-grid">
          <div>
            <div className="hero-eyebrow">✳ 每条建议都写清成本、收益与阈值线</div>
            <h1>
              高性价比
              <br />
              打工指南
            </h1>
            <p className="sub">
              用最少的内耗和最明白的账，换回你对工作的掌控。
              内容以现行法律和官方数据为准，不用从头读到尾，挑眼下最关心的一章开始。
            </p>
            <div className="hero-actions">
              <a className="btn btn-amber" href="#/calc">
                3 分钟测出你的真实时薪
                <Arrow />
              </a>
              <a className="btn btn-ghost" href="#/explore">
                开始阅读
                <Arrow />
              </a>
            </div>
            <a className="hero-dl" href="#/download">
              免费下载全书 PDF / Word / Markdown
              <Arrow />
            </a>
          </div>
          <HeroPanel />
        </div>

        <div className="wrap">
          <div className="stat-row hero-stats">
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
          <div className="hero-band">
            <span className="hb-item hb-1">进场</span>
            <span className="hb-item hb-2">在职</span>
            <span className="hb-item hb-3">风险</span>
            <span className="hb-item hb-4">转折</span>
          </div>
        </div>
      </section>

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
              对 4w 的人是救命。能算出临界时薪的建议，阈值和推导过程直接给你；
              算不出的，直说为什么不用算。
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
          <h2>你现在最头疼什么</h2>
          <span className="sh-note">直达对应章节，比从头翻快</span>
        </div>

        <ProblemNav />

        <div className="sec-head">
          <h2>从最关心的章节开始</h2>
          <span className="sh-note">按打工生命周期编排 · 全书已完成</span>
        </div>

        <PartFlow />

        <div className="sec-band sb-blue">
          <EvidenceCards />
        </div>

        <div className="sec-band sb-green">
          <TierSection />
        </div>

        <DownloadBand />

        <AntiBand />

        <div className="sec-band sb-sand">
          <Faq />
        </div>

        <CtaEnd />
      </div>
    </>
  )
}

/** 问题导航：读者带着问题来，直达对应章节（对标参考站「你想为生活多留住什么」） */
const PROBLEMS = [
  { q: '怕被裁，想提前准备', sub: '第 20 章 · 被裁当天：按小时排的操作清单', href: '#/chapter/ch20' },
  { q: '要谈薪，不知道怎么开口', sub: '第 04 章 · 把年包换成到手，再换成时薪', href: '#/chapter/ch04' },
  { q: '焦虑 35 岁', sub: '第 25 章 · 拆开看，是一组可提前应对的结构问题', href: '#/chapter/ch25' },
  { q: '想跳槽，不知道值不值', sub: '第 23 章 · 把全书的变量合成一张表', href: '#/chapter/ch23' },
  { q: '加班太狠，算算真实时薪', sub: '第 09 章 · 加班的真实时薪', href: '#/chapter/ch09' },
  { q: '社保公积金怕断缴', sub: '第 17 章 · 断缴比少缴更贵', href: '#/chapter/ch17' },
]

function ProblemNav() {
  return (
    <div className="qgrid">
      {PROBLEMS.map((it) => (
        <a className="qcard" key={it.href} href={it.href}>
          <div className="q-q">{it.q}</div>
          <div className="q-a">{it.sub}</div>
          <div className="q-go">
            去看
            <Arrow />
          </div>
        </a>
      ))}
    </div>
  )
}

/** 章节流按「部分」分组渲染，组间加部分标签 */
const PARTS: { name: string; range: string; note: string }[] = [
  { name: '进场', range: '第 01–05 章', note: '从投简历到签字入职，每一步都能算' },
  { name: '在职', range: '第 06–15 章', note: '把在职期间的每一项隐性收支显性化' },
  { name: '风险', range: '第 16–22 章', note: '法条最密集的部分，出事前先读完' },
  { name: '转折', range: '第 23–28 章', note: '跳槽、35 岁、转行与长期财务' },
]

function PartFlow() {
  return (
    <>
      {PARTS.map((pt) => {
        const list = chapters.filter((c) => c.part === pt.name)
        if (!list.length) return null
        return (
          <div key={pt.name} className="part-block">
            <div className={`part-label pl-${pt.name}`}>
              <b>{pt.name}</b>
              <span className="pl-range">{pt.range}</span>
              <span className="pl-note">{pt.note}</span>
            </div>
            <div className="ch-flow">
              {list.map((c) => (
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
          </div>
        )
      })}
    </>
  )
}

/** 证据分级 A/B/C：信任感的最大来源，独立成节 */
const EVIDENCE = [
  {
    g: 'A',
    t: '有具体数字可查',
    d: '来自法条原文、官方统计或可自行验算的推导，能查到具体数字。',
    c: 'var(--blue-700)',
  },
  {
    g: 'B',
    t: '有研究或文件支持',
    d: '有研究或政策文件依据，但缺少可直接套用的数字，或主要来自单项来源。',
    c: '#17766a',
  },
  {
    g: 'C',
    t: '经验与通行做法',
    d: '主要依据从业经验或公认做法——直说，不冒充 A 级。',
    c: '#a4754e',
  },
]

function EvidenceCards() {
  return (
    <>
      <div className="sec-head">
        <h2>先看依据，再决定相信多少</h2>
        <span className="sh-note">证据分级 A / B / C</span>
      </div>
      <div className="ev-grid">
        {EVIDENCE.map((it) => (
          <div className="ev-card" key={it.g} style={{ borderTopColor: it.c }}>
            <div className="ev-g" style={{ color: it.c }}>
              {it.g}
            </div>
            <div className="ev-t">{it.t}</div>
            <div className="ev-d">{it.d}</div>
          </div>
        ))}
      </div>
      <p className="fine-note">
        分级是本站自己的标注。A 级也可能有争议——阅读时请一并留意适用条件。
      </p>
    </>
  )
}

/** 阈值线三档：极高 / 高 / 一般 */
function TierSection() {
  const tiers = [
    { t: '极高', d: '收益大，钱、时间、毅力三项成本都低或为零。', hl: true },
    { t: '高', d: '收益大且成本不高，或收益中等、成本为零。', hl: false },
    { t: '一般', d: '其余组合——结合自己的收入与处境，再衡量投入是否值得。', hl: false },
  ]
  return (
    <>
      <div className="sec-head">
        <h2>值得相信，也要值得你去做</h2>
        <span className="sh-note">看完依据，再算行动这笔账</span>
      </div>
      <div className="ev-grid">
        {tiers.map((it) => (
          <div className={`ev-card tier-card ${it.hl ? 'tier-hl' : ''}`} key={it.t}>
            <div className="tier-t">{it.t}</div>
            <div className="ev-d">{it.d}</div>
          </div>
        ))}
      </div>
      <p className="fine-note">
        档位判断的分母是你的真实时薪——
        <a href="#/calc">先去测算器算一次</a>
        ，再看每条建议的阈值线。
      </p>
    </>
  )
}

/** 下载横条：左插画 + 右标题与按钮 */
function DownloadBand() {
  return (
    <div className="band band-dl">
      <div className="band-art">
        <ChapterArt chapterId="ch03" />
      </div>
      <div className="band-txt">
        <div className="band-eyebrow">PDF / WORD / MARKDOWN · 免费下载</div>
        <h3 className="band-title">免费下载《高性价比打工指南》</h3>
        <p className="band-desc">
          全书 28 章 93 条，含完整解释、算例推导与出处；公众号验证码登录后即可下载，
          登录 30 天内有效。
        </p>
        <div className="band-actions">
          <a className="btn btn-amber" href="#/download">
            去下载全书
            <Arrow />
          </a>
          <a className="btn btn-ghost2" href="#/explore">
            先在线阅读
          </a>
        </div>
      </div>
    </div>
  )
}

/** 反面清单横条（对标参考站「避坑检测」） */
function AntiBand() {
  return (
    <a className="band band-anti" href="#/anti">
      <div className="band-txt">
        <h3 className="band-title">反面清单：你以为的常识，实际上全是坑</h3>
        <p className="band-desc">
          10 条「你以为 / 实际上 / 代价」——竞业协议、被迫辞职、试用期陷阱，
          每一条都标了法律后果。
        </p>
      </div>
      <span className="band-btn">
        打开反面清单
        <Arrow />
      </span>
    </a>
  )
}

/** FAQ 折叠 */
const FAQS = [
  {
    q: '这本指南免费吗？',
    a: '免费阅读、免费下载 PDF / Word / Markdown，没有付费墙，也不会有广告。',
  },
  {
    q: '为什么要公众号登录才能下载？',
    a: '一是把内容修订和纠错通知发给你，二是过滤机器批量抓取。验证一次 30 天内不再弹窗，取消关注也不影响已登录的设备。',
  },
  {
    q: '算出来的数字准吗？',
    a: '阈值线是算术推导，每条都给了过程，可以自己验算。社保、公积金等口径存在地区差异，条目内会单独标注「各地口径有差异」。',
  },
  {
    q: '这是法律建议吗？',
    a: '不是。法条都标注条款号和生效日期，但劳动争议的裁审口径因地区和个案而异，关键节点请咨询执业律师。',
  },
  {
    q: '内容会持续更新吗？',
    a: '会。法条修订、数字过时都会更新，更新日期见首页统计行。已关注公众号的读者会收到修订通知。',
  },
]

function Faq() {
  return (
    <>
      <div className="sec-head">
        <h2>开始前，你可能想知道</h2>
        <span className="sh-note">常见问题</span>
      </div>
      <div className="faq-list">
        {FAQS.map((it) => (
          <details className="faq-item" key={it.q}>
            <summary>{it.q}</summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
    </>
  )
}

/** 墨蓝收尾 CTA */
function CtaEnd() {
  return (
    <div className="cta-dark">
      <div className="cta-eyebrow">下一件小事</div>
      <div className="cta-title">打工不必一次算完。</div>
      <p className="cta-sub">
        挑一章适合今天的，剩下的留给以后的自己。
      </p>
      <a className="btn btn-amber" href="#/explore">
        开始阅读
        <Arrow />
      </a>
    </div>
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
        <div className="stv">
          {e.threshold.unit === 'none'
            ? `本条不设时薪阈值——${e.threshold.basis}`
            : `${thresholdText(e)} 元/小时，这条建议才值得投入`}
        </div>
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

/** 精选条目：Hero 轮播池（冲击力优先，可随时换） */
const FEATURED = [
  'work-09-01',
  'work-20-01',
  'work-25-01',
  'work-04-01',
  'work-17-01',
  'work-23-01',
]

/** Hero 右侧面板：精选条目轮播 / 实时时薪计算器，Tab 切换 */
function HeroPanel() {
  const [tab, setTab] = useState<'featured' | 'calc'>('featured')

  return (
    <div className="hp">
      <div className="hp-tabs">
        <button
          type="button"
          className={`hp-tab ${tab === 'featured' ? 'on' : ''}`}
          onClick={() => setTab('featured')}
        >
          精选条目
        </button>
        <button
          type="button"
          className={`hp-tab ${tab === 'calc' ? 'on' : ''}`}
          onClick={() => setTab('calc')}
        >
          时薪计算器
        </button>
      </div>
      {tab === 'featured' ? <FeaturedCarousel /> : <LiveHourly />}
    </div>
  )
}

function FeaturedCarousel() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hover, setHover] = useState(false)
  const n = FEATURED.length

  useEffect(() => {
    if (paused || hover) return
    const t = window.setInterval(() => setI((v) => (v + 1) % n), 6000)
    return () => window.clearInterval(t)
  }, [paused, hover, n])

  const e = entryMap.get(FEATURED[i])!
  const ch = chapterMap.get(e.chapterId)!

  return (
    <div
      className="fc"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="fc-card">
        <div className="fc-art">
          <ChapterArt chapterId={e.chapterId} />
          <span className="fc-badge">{e.chapterId.replace('ch', '')}</span>
        </div>
        <div className="fc-body">
          <div className="fc-eyebrow">
            {entryNo(e)} / {ch.title}
          </div>
          <div className="fc-title">{e.title}</div>
          <div className="fc-foot">
            <span className="fc-th">{thresholdText(e)}</span>
            <a className="fc-link" href={`#/entry/${e.id}`}>
              看看怎么做
              <Arrow />
            </a>
          </div>
        </div>
      </div>

      <div className="fc-controls">
        <div className="fc-dots">
          {FEATURED.map((id, di) => (
            <button
              key={id}
              type="button"
              aria-label={`第 ${di + 1} 条`}
              className={`fc-dot ${di === i ? 'on' : ''}`}
              onClick={() => setI(di)}
            />
          ))}
        </div>
        <button
          type="button"
          className="fc-btn"
          aria-label={paused ? '播放' : '暂停'}
          onClick={() => setPaused(!paused)}
        >
          {paused ? '▶' : '❚❚'}
        </button>
        <button
          type="button"
          className="fc-btn"
          aria-label="上一条"
          onClick={() => setI((i + n - 1) % n)}
        >
          ←
        </button>
        <button
          type="button"
          className="fc-btn"
          aria-label="下一条"
          onClick={() => setI((i + 1) % n)}
        >
          →
        </button>
      </div>
    </div>
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