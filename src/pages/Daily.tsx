import { useEffect, useState } from 'react'
import {
  checkIn,
  loadDaily,
  monthDays,
  promptOfDay,
  streak,
  todayKey,
  totalDays,
  undoToday,
  lastNDays,
  type DailyState,
} from '../lib/daily'
import { Arrow } from '../components/common'

export function Daily() {
  const [state, setState] = useState<DailyState>({ days: [] })
  const prompt = promptOfDay()

  useEffect(() => {
    document.title = '每日一问 · 高性价比打工指南'
    setState(loadDaily())
  }, [])

  const t = todayKey()
  const checked = state.days.includes(t)
  const total = totalDays(state)
  const run = streak(state)
  const month = monthDays(state)
  const cal = lastNDays(119)
  const set = new Set(state.days)

  return (
    <div className="wrap-narrow page">
      <div className="daily-head">
        <div className="dh-eyebrow">每日一问</div>
        <h1 className="page-title">今天，算一个账</h1>
        <p className="page-lede">
          不用立大目标。今天挑一个需要填数字的问题，花两到五分钟算清楚。
          算完再去读依据——先算再看，和先看再算，读到的东西不一样。
        </p>
      </div>

      <div className="daily-card">
        <div className="dc-mins">约 {prompt.mins} 分钟</div>
        <h2 className="dc-q">{prompt.q}</h2>
        <p className="dc-why">{prompt.why}</p>

        <div className="dc-fill">
          <div className="dcf-label">要算什么</div>
          <div className="dcf-val">{prompt.fill}</div>
        </div>

        <div className="dc-actions">
          {checked ? (
            <>
              <span className="dc-done">今天已点亮</span>
              <button className="btn" onClick={() => setState(undoToday())}>
                撤销
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setState(checkIn())}>
              算完了，点亮今天
            </button>
          )}
          {prompt.ref && (
            <a className="btn" href={`#/entry/${prompt.ref}`}>
              看依据
              <Arrow />
            </a>
          )}
        </div>
      </div>

      <div className="sec-head">
        <h2>你的记录</h2>
        <span className="sh-note">存在本机浏览器，不上传</span>
      </div>

      <div className="stat3">
        <div className="s3">
          <div className="s3v">{total}</div>
          <div className="s3l">累计天数</div>
        </div>
        <div className="s3">
          <div className="s3v">{run}</div>
          <div className="s3l">当前连续</div>
        </div>
        <div className="s3">
          <div className="s3v">{month}</div>
          <div className="s3l">本月</div>
        </div>
      </div>

      <div className="cal">
        {cal.map((d) => (
          <div key={d} className={`cal-cell ${set.has(d) ? 'on' : ''}`} title={d} />
        ))}
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 14, lineHeight: 1.7 }}>
        近 17 周的记录。方格点亮代表那天算过一个账。漏掉的日期没关系，连续天数断了，累计还在。
      </p>

      <div className="sec-head">
        <h2>关于每日一问</h2>
      </div>

      <div className="faq">
        <div className="faq-i">
          <div className="fi-q">这和「每日打卡」有什么区别？</div>
          <div className="fi-a">
            这里不给行动清单，只给需要算的账。打工场景里绝大多数条目是一次性决策，
            不是可以反复做的小习惯——给决策打卡没有意义。算一遍，数字记下来，
            后面每个和钱有关的判断都用得上。
          </div>
        </div>
        <div className="faq-i">
          <div className="fi-q">题目是随机的吗？</div>
          <div className="fi-a">
            按日期确定，同一天进来看到的是同一题。题目池共 15 个，覆盖到手测算、加班、
            竞业、试用期、工时制这些高频场景。
          </div>
        </div>
        <div className="faq-i">
          <div className="fi-q">需要登录吗？</div>
          <div className="fi-a">
            不需要。记录保存在当前浏览器，清除浏览器数据会丢失。
          </div>
        </div>
      </div>

      <a className="back mt-l" href="#/">
        <span aria-hidden="true">←</span> 回到首页
      </a>
    </div>
  )
}