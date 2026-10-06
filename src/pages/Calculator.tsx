import { useEffect, useMemo, useState } from 'react'
import { entries } from '../data'
import { calcSalary, SOCIAL_TIERS, type SalaryInput } from '../lib/calc'

export function Calculator() {
  useEffect(() => {
    document.title = '到手测算与真实时薪 · 高性价比打工指南'
  }, [])

  const [salary, setSalary] = useState<SalaryInput>({
    grossMonthly: 25000,
    socialRate: 0.265,
    dailyHours: 11,
    payDays: 21.75,
    monthlyDeduction: 2000,
  })
  const [otHours, setOtHours] = useState(20)
  const [otPremium, setOtPremium] = useState(200)

  const r = calcSalary(salary)

  const verdicts = useMemo(() => {
    const withT = entries
      .filter((e) => e.threshold.unit === 'hourly' && e.threshold.value > 0)
      .map((e) => ({
        e,
        ok: r.realHourly >= e.threshold.value,
        gap: e.threshold.value - r.realHourly,
        over: r.realHourly - e.threshold.value,
      }))
      .sort((a, b) => b.e.threshold.value - a.e.threshold.value)
    return { yes: withT.filter((x) => x.ok), no: withT.filter((x) => !x.ok) }
  }, [r.realHourly])

  const afterTaxRatio = r.grossMonthly > 0 ? r.netMonthly / r.grossMonthly : 0.75
  const otHourly = otPremium * afterTaxRatio
  const otMonthly = otHours * 4

  return (
    <div className="wrap page">
      <h1 className="page-title">到手测算与真实时薪</h1>
      <p className="page-lede">
        填一次数字，全站条目的阈值线会实时判定：这个动作对你值不值得做。
        所有参数只存在你的浏览器里，不上传。
      </p>

      <div className="sec-head">
        <h2>第一部分　薪资结构</h2>
        <span className="sh-note">先算出分母</span>
      </div>

      <div className="calc-grid">
        <div>
          <div className="presets">
            <button
              className="preset"
              onClick={() =>
                setSalary({
                  grossMonthly: 12000,
                  socialRate: 0.24,
                  dailyHours: 10,
                  payDays: 21.75,
                  monthlyDeduction: 1000,
                })
              }
            >
              月薪 12k · 10 小时
            </button>
            <button
              className="preset"
              onClick={() =>
                setSalary({
                  grossMonthly: 20000,
                  socialRate: 0.265,
                  dailyHours: 11,
                  payDays: 21.75,
                  monthlyDeduction: 2000,
                })
              }
            >
              月薪 20k · 11 小时
            </button>
            <button
              className="preset"
              onClick={() =>
                setSalary({
                  grossMonthly: 35000,
                  socialRate: 0.28,
                  dailyHours: 12,
                  payDays: 21.75,
                  monthlyDeduction: 3000,
                })
              }
            >
              月薪 35k · 12 小时
            </button>
          </div>

          <div className="field">
            <label>税前月薪（元）</label>
            <input
              type="number"
              value={salary.grossMonthly}
              onChange={(e) => setSalary({ ...salary, grossMonthly: Number(e.target.value) || 0 })}
            />
            <div className="fhint">指发给你的总额。年包 ÷ 12 可作为起点。</div>
          </div>

          <div className="field">
            <label>五险一金个人缴纳比例</label>
            <select
              value={salary.socialRate}
              onChange={(e) => setSalary({ ...salary, socialRate: Number(e.target.value) })}
            >
              {SOCIAL_TIERS.map((t) => (
                <option key={t.id} value={t.rate}>
                  {t.label} —— {Math.round(t.rate * 1000) / 10}%
                </option>
              ))}
            </select>
            <div className="fhint">
              全国不是统一比例，各省各年度会调整。这里按档位取整，精确值请查参保地人社部门公告。
            </div>
          </div>

          <div className="field">
            <label>专项附加扣除（月减税额，元）</label>
            <input
              type="number"
              value={salary.monthlyDeduction}
              onChange={(e) =>
                setSalary({ ...salary, monthlyDeduction: Number(e.target.value) || 0 })
              }
            />
            <div className="fhint">
              房贷 1000／租房 1500／子女教育 2000／赡养老人等，按个人情况填。填 0 则不扣。
            </div>
          </div>

          <div className="field">
            <label>每天实际工作小时数（含加班）</label>
            <input
              type="number"
              step="0.5"
              value={salary.dailyHours}
              onChange={(e) => setSalary({ ...salary, dailyHours: Number(e.target.value) || 0 })}
            />
            <div className="fhint">
              标准是 8 小时。这个数字越高，真实时薪越低，这是很多人没意识到的部分。
            </div>
          </div>
        </div>

        <div className="out">
          <div className="out-top">
            <div className="ol">税后真实时薪</div>
            <div className="ov">
              {r.realHourly.toFixed(0)}
              <small>元/小时</small>
            </div>
            <div className="osub">下方所有阈值判定的分母</div>
          </div>
          <div className="out-row">
            <span className="orl">到手月薪</span>
            <span className="orv">{Math.round(r.netMonthly).toLocaleString('zh-CN')}</span>
          </div>
          <div className="out-row">
            <span className="orl">每月社保个人缴纳</span>
            <span className="orv">{Math.round(r.socialMonthly).toLocaleString('zh-CN')}</span>
          </div>
          <div className="out-row">
            <span className="orl">个税计税基数</span>
            <span className="orv">{Math.round(r.taxableMonthly).toLocaleString('zh-CN')}</span>
          </div>
          <div className="out-row">
            <span className="orl">全年个税</span>
            <span className="orv">{Math.round(r.annualTax).toLocaleString('zh-CN')}</span>
          </div>
          <div className="out-row">
            <span className="orl">每周工时</span>
            <span className="orv">{r.weeklyHours.toFixed(0)} 小时</span>
          </div>
          <div className="out-foot">
            公积金个人账户约 {Math.round(r.fundMonthly).toLocaleString('zh-CN')} 元/月
            （按上限 12% 估算），不进「到手」但属于你的钱。
          </div>
        </div>
      </div>

      <div className="sec-head">
        <h2>第二部分　阈值判定</h2>
        <span className="sh-note">
          你的时薪 {r.realHourly.toFixed(0)} 元/小时
        </span>
      </div>

      <div className="verdicts">
        {verdicts.yes.length > 0 && (
          <>
            <div className="vgroup-head yes">
              <span className="vgn">达到</span>
              {verdicts.yes.length} 条对你划算
            </div>
            {verdicts.yes.map(({ e, over }) => (
              <a className="verdict yes" key={e.id} href={`#/entry/${e.id}`}>
                <span className="vm">+{Math.round(over)}</span>
                <span className="vt">
                  <b>{e.title}</b>
                  阈值 {e.threshold.value} 元/小时，你高出 {Math.round(over)} 元。
                </span>
              </a>
            ))}
          </>
        )}

        {verdicts.no.length > 0 && (
          <>
            <div className="vgroup-head no">
              <span className="vgn">未达</span>
              {verdicts.no.length} 条建议先别投入
            </div>
            {verdicts.no.map(({ e, gap }) => (
              <a className="verdict no" key={e.id} href={`#/entry/${e.id}`}>
                <span className="vm">差 {Math.round(gap)}</span>
                <span className="vt">
                  <b>{e.title}</b>
                  需要时薪 {e.threshold.value} 元才划算。{e.threshold.below}
                </span>
              </a>
            ))}
          </>
        )}
      </div>

      <div className="sec-head">
        <h2>第三部分　加班值不值</h2>
        <span className="sh-note">把加班折算成时薪再比</span>
      </div>

      <div className="calc-grid">
        <div>
          <div className="field">
            <label>本月被安排加班多少小时</label>
            <input
              type="number"
              value={otHours}
              onChange={(e) => setOtHours(Number(e.target.value) || 0)}
            />
            <div className="fhint">
              按 4 周估算约 {otMonthly.toFixed(0)} 小时/月。
            </div>
          </div>

          <div className="field">
            <label>加班费计发基数（元/小时）</label>
            <input
              type="number"
              value={otPremium}
              onChange={(e) => setOtPremium(Number(e.target.value) || 0)}
            />
            <div className="fhint">
              公司按工作日 150% 发时，基数通常是正常时薪的 1.5 倍。填你实际拿到的数。
            </div>
          </div>

          {otMonthly > 36 && (
            <div className="note">
              <span className="n-label">已越过法定上限</span>
              本月加班约 {otMonthly.toFixed(0)} 小时，超过《劳动法》第 41 条规定的每月 36 小时上限。
              这不改变你该拿多少加班费，但意味着公司制度已越线，证据固定下来比追钱更重要。
            </div>
          )}
        </div>

        <div className="out">
          <div className="out-top">
            <div className="ol">加班折算时薪</div>
            <div className="ov">
              {otHourly.toFixed(0)}
              <small>元/小时</small>
            </div>
            <div className="osub">按实际拿到的加班费，已折税</div>
          </div>
          <div className="out-row">
            <span className="orl">对比基准时薪</span>
            <span className="orv">
              {otHourly >= r.realHourly ? '高' : '低'} {Math.abs(otHourly - r.realHourly).toFixed(0)} 元
            </span>
          </div>
          <div className="out-row">
            <span className="orl">你的基准时薪</span>
            <span className="orv">{r.realHourly.toFixed(0)} 元</span>
          </div>
          <div className="out-row">
            <span className="orl">本月加班折算</span>
            <span className="orv">{Math.round(otPremium * otHours).toLocaleString('zh-CN')}</span>
          </div>
          <div className="out-foot">
            判断顺序：先看加班费折算的时薪有没有低于你的基准时薪。如果低了，
            说明这笔加班在机会成本上是亏的，不管它叫不叫「奋斗」。
          </div>
        </div>
      </div>
    </div>
  )
}