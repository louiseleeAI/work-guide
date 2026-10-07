import { useEffect, useMemo, useState } from 'react'
import { entries } from '../data'
import {
  calcSalary,
  DEFAULT_INSURANCE_RATE,
  FUND_TIERS,
  type SalaryInput,
} from '../lib/calc'

const PRESETS: { label: string; input: SalaryInput }[] = [
  {
    label: '月薪 12k · 10 小时',
    input: {
      grossMonthly: 12000,
      insuranceRate: DEFAULT_INSURANCE_RATE,
      fundRate: 0.07,
      baseCeiling: 0,
      dailyHours: 10,
      workDays: 24,
      specialDeduction: 1000,
    },
  },
  {
    label: '月薪 20k · 11 小时',
    input: {
      grossMonthly: 20000,
      insuranceRate: DEFAULT_INSURANCE_RATE,
      fundRate: 0.12,
      baseCeiling: 0,
      dailyHours: 11,
      workDays: 25,
      specialDeduction: 2000,
    },
  },
  {
    label: '月薪 35k · 12 小时',
    input: {
      grossMonthly: 35000,
      insuranceRate: DEFAULT_INSURANCE_RATE,
      fundRate: 0.12,
      baseCeiling: 35000,
      dailyHours: 12,
      workDays: 26,
      specialDeduction: 3000,
    },
  },
]

export function Calculator() {
  useEffect(() => {
    document.title = '到手测算与真实时薪 · 高性价比打工指南'
  }, [])

  const [salary, setSalary] = useState<SalaryInput>(PRESETS[1].input)
  const [otHours, setOtHours] = useState(20)
  const [otPremium, setOtPremium] = useState(200)

  const r = calcSalary(salary)

  const verdicts = useMemo(() => {
    const withT = entries
      .filter(
        (e) => e.threshold.unit === 'hourly' && (e.threshold.value ?? 0) > 0,
      )
      .map((e) => ({
        e,
        thr: e.threshold.value as number,
      }))
      .map(({ e, thr }) => ({
        e,
        thr,
        ok: r.realHourly >= thr,
        gap: thr - r.realHourly,
        over: r.realHourly - thr,
      }))
      .sort((a, b) => b.thr - a.thr)
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
            {PRESETS.map((p) => (
              <button
                key={p.label}
                className="preset"
                onClick={() => setSalary(p.input)}
              >
                {p.label}
              </button>
            ))}
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
            <label>五险个人缴纳比例（养老 + 医疗 + 失业）</label>
            <select
              value={salary.insuranceRate}
              onChange={(e) => setSalary({ ...salary, insuranceRate: Number(e.target.value) })}
            >
              <option value={0.1}>约 10%（医疗按 1.5% 的地区）</option>
              <option value={0.105}>约 10.5%（多数城市：8% + 2% + 0.5%）</option>
              <option value={0.108}>约 10.8%（失业按 0.8% 的地区，如部分广东口径）</option>
            </select>
            <div className="fhint">
              养老全国统一 8%，医疗 1.5%–2%、失业 0.2%–0.8% 各地略有差异。精确值查参保地公告。
            </div>
          </div>

          <div className="field">
            <label>公积金个人缴存比例</label>
            <select
              value={salary.fundRate}
              onChange={(e) => setSalary({ ...salary, fundRate: Number(e.target.value) })}
            >
              {FUND_TIERS.map((t) => (
                <option key={t.id} value={t.rate}>
                  {t.label}
                </option>
              ))}
            </select>
            <div className="fhint">
              5%–12% 由单位在法定区间内自定，同一份 offer 换家公司可能差一倍。
              单位同比例缴存，两部分都进你的账户。
            </div>
          </div>

          <div className="field">
            <label>缴费基数上限（元/月，0 表示不设限）</label>
            <input
              type="number"
              value={salary.baseCeiling}
              onChange={(e) => setSalary({ ...salary, baseCeiling: Number(e.target.value) || 0 })}
            />
            <div className="fhint">
              一般为当地上年度社平工资的 3 倍左右。月薪超过上限的部分不缴社保公积金。
              不确定就填 0，结果偏保守。
            </div>
          </div>

          <div className="field">
            <label>专项附加扣除（月扣除额，元）</label>
            <input
              type="number"
              value={salary.specialDeduction}
              onChange={(e) =>
                setSalary({ ...salary, specialDeduction: Number(e.target.value) || 0 })
              }
            />
            <div className="fhint">
              房贷 1000／租房 1500／子女教育 2000／赡养老人等，按个人情况填。填 0 则不扣。
            </div>
          </div>

          <div className="field">
            <label>每天实际工作小时数（在岗口径，含加班）</label>
            <input
              type="number"
              step="0.5"
              value={salary.dailyHours}
              onChange={(e) => setSalary({ ...salary, dailyHours: Number(e.target.value) || 0 })}
            />
            <div className="fhint">
              标准是 8 小时。按在岗时间算，午休不计工作就减掉。
            </div>
          </div>

          <div className="field">
            <label>每月实际出勤天数</label>
            <input
              type="number"
              step="0.5"
              value={salary.workDays}
              onChange={(e) => setSalary({ ...salary, workDays: Number(e.target.value) || 0 })}
            />
            <div className="fhint">
              标准工时约 21–22 天；大小周或每周 6 天约 25–26 天。
              真实时薪的分母是这个数 × 日工时，不是法定的 21.75 个计薪天。
            </div>
          </div>
        </div>

        <div className="out">
          <div className="out-top">
            <div className="ol">真实时薪（含公积金）</div>
            <div className="ov">
              {r.realHourly.toFixed(0)}
              <small>元/小时</small>
            </div>
            <div className="osub">下方所有阈值判定的分母</div>
          </div>
          <div className="out-row">
            <span className="orl">现金到手月薪</span>
            <span className="orv">{Math.round(r.netMonthly).toLocaleString('zh-CN')}</span>
          </div>
          <div className="out-row">
            <span className="orl">公积金个人缴存</span>
            <span className="orv">{Math.round(r.fundMonthly).toLocaleString('zh-CN')}</span>
          </div>
          <div className="out-row">
            <span className="orl">全口径月薪（现金 + 公积金）</span>
            <span className="orv">{Math.round(r.disposableMonthly).toLocaleString('zh-CN')}</span>
          </div>
          <div className="out-row">
            <span className="orl">缴费基数（截断后）</span>
            <span className="orv">{Math.round(r.contributionBase).toLocaleString('zh-CN')}</span>
          </div>
          <div className="out-row">
            <span className="orl">全年个税</span>
            <span className="orv">{Math.round(r.annualTax).toLocaleString('zh-CN')}</span>
          </div>
          <div className="out-row">
            <span className="orl">纯现金时薪</span>
            <span className="orv">{r.cashHourly.toFixed(0)} 元</span>
          </div>
          <div className="out-row">
            <span className="orl">月实际工时 / 折算每周</span>
            <span className="orv">
              {r.monthlyHours.toFixed(0)} h · {r.weeklyHours.toFixed(0)} h/周
            </span>
          </div>
          <div className="out-foot">
            与私活等现金报价比，用「纯现金时薪」；与 offer 总包、全站阈值比，用上面的「真实时薪」。
            个税按年度汇算口径折算月均，实际工资单逐月会跳动。
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
              基数是劳动合同约定的正常工作时间月工资 ÷ 21.75 ÷ 8。
              公司只按基本工资算基数是常见的少付手法，各地裁审口径有差异。
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
