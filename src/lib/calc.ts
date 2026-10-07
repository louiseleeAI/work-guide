/** 到手测算与时薪计算 */

/**
 * 口径说明（评审后重写，2026-10-07）：
 *
 * 1. 真实时薪的分母是「当月实际出勤天数 × 每日实际工作小时数」，
 *    不是 21.75。21.75 是劳社部发〔2008〕3 号定义的「月计薪天数」，
 *    只用于把月工资折算成日/小时工资（加班费折算），它对应带薪标准工时。
 *    用它做真实时薪分母，996 场景会高估约 20%，标准工时会低估约 5%。
 *
 * 2. 社保/公积金缴费基数有上下限：一般为当地上年度职工月平均工资的
 *    60%–300%（劳社险中心函〔2006〕60 号）。月薪超过上限的部分不缴，
 *    本模块用 baseCeiling 截断；不填则按月薪全额计（保守口径）。
 *
 * 3. 公积金个人缴存部分计入真实时薪的分子。它进入劳动者个人账户，
 *    可用于购房、租房、销户提取，是「延迟到账的钱」，不是支出。
 *    同时提供纯现金时薪（cashHourly），用于与私活等现金报价比较。
 */

export interface SalaryInput {
  /** 税前月薪（元） */
  grossMonthly: number
  /** 五险个人缴纳比例（养老 + 医疗 + 失业，全国常见区间 10%–11%），如 0.105 */
  insuranceRate: number
  /** 公积金个人缴存比例（5%–12%，单位在法定区间内自定），如 0.12 */
  fundRate: number
  /**
   * 缴费基数上限（元/月）。当地上年度职工月平均工资的 300% 左右，
   * 超过部分不计入缴费基数。0 表示不设限（按月薪全额计，保守口径）。
   */
  baseCeiling: number
  /** 每日实际工作小时数（在岗口径，含加班） */
  dailyHours: number
  /** 每月实际出勤天数（996 约 26，标准工时约 21–22） */
  workDays: number
  /** 专项附加扣除（月扣除额，元），如房贷 1000 + 租房 1500 */
  specialDeduction: number
}

/**
 * 公积金个人缴存比例分档。
 *
 * 为什么按公积金分档而不是五险一金总比例：五险（养老 8%、医疗 1.5%–2%、
 * 失业 0.2%–0.8%）各地区差异约 1–2 个百分点，而公积金比例在 5%–12% 之间
 * 由单位自定，相差 7 个百分点，是到手金额的最大变量，也是 offer 之间
 * 最容易被忽略的差异（月薪 2 万时 5% 与 12% 的公积金年差近 1.7 万，
 * 单位同比例缴存后个人账户年差超 3 万）。
 */
export const FUND_TIERS = [
  { id: 'fund5', label: '公积金 5%（法定下限，部分民企按此缴）', rate: 0.05 },
  { id: 'fund7', label: '公积金 7%（上海等地区常见档）', rate: 0.07 },
  { id: 'fund8', label: '公积金 8%（中间档）', rate: 0.08 },
  { id: 'fund12', label: '公积金 12%（法定上限，大厂常见）', rate: 0.12 },
] as const

/** 五险个人比例默认值：养老 8% + 医疗 2% + 失业 0.5%。各地有 ±1 个百分点浮动 */
export const DEFAULT_INSURANCE_RATE = 0.105

/** 个人所得税年度税率表（综合所得） */
const TAX_BRACKETS = [
  { upTo: 36000, rate: 0.03, deduct: 0 },
  { upTo: 144000, rate: 0.1, deduct: 2520 },
  { upTo: 300000, rate: 0.2, deduct: 16920 },
  { upTo: 420000, rate: 0.25, deduct: 31920 },
  { upTo: 660000, rate: 0.3, deduct: 52920 },
  { upTo: 960000, rate: 0.35, deduct: 85920 },
  { upTo: Infinity, rate: 0.45, deduct: 181920 },
]

/** 基本减除费用：5000 元/月，即 60000 元/年 */
export const ANNUAL_BASIC_DEDUCTION = 60000

/** 计算一个年度综合所得的个税（年度汇算口径，月均为均值，实际工资单逐月会跳动） */
export function annualTax(annualTaxable: number): number {
  if (annualTaxable <= 0) return 0
  const b = TAX_BRACKETS.find((x) => annualTaxable <= x.upTo)!
  return annualTaxable * b.rate - b.deduct
}

export interface SalaryResult {
  /** 税前月薪 */
  grossMonthly: number
  /** 社保公积金缴费基数（已按上限截断） */
  contributionBase: number
  /** 每月五险个人缴纳额 */
  insuranceMonthly: number
  /** 每月公积金个人缴存额（进入个人账户，是你的钱） */
  fundMonthly: number
  /** 现金到手月薪（扣五险、公积金、个税之后） */
  netMonthly: number
  /** 现金到手 + 公积金个人缴存（全口径「你的钱」） */
  disposableMonthly: number
  /** 全年应纳税所得额 */
  annualTaxable: number
  /** 全年个税（年度汇算口径） */
  annualTax: number
  /** 真实时薪：全口径到手 ÷ 实际工时。与 offer 总包、需要全口径比较的阈值用这个 */
  realHourly: number
  /** 纯现金时薪：现金到手 ÷ 实际工时。与私活报价等现金收入比较用这个 */
  cashHourly: number
  /** 每月实际工作小时数 */
  monthlyHours: number
  /** 折算每周工作小时数 */
  weeklyHours: number
}

export function calcSalary(input: SalaryInput): SalaryResult {
  const {
    grossMonthly,
    insuranceRate,
    fundRate,
    baseCeiling = 0,
    dailyHours,
    workDays,
    specialDeduction = 0,
  } = input

  // 缴费基数：默认按月薪全额；填了上限则截断（超过 300% 社平的部分不缴）
  const contributionBase =
    baseCeiling > 0 ? Math.min(grossMonthly, baseCeiling) : grossMonthly

  const insuranceMonthly = contributionBase * insuranceRate
  const fundMonthly = contributionBase * fundRate

  // 应纳税所得额 = 税前 − 五险个人 − 公积金个人 − 基本减除 − 专项附加
  const taxableMonthly = Math.max(
    0,
    grossMonthly - insuranceMonthly - fundMonthly,
  )
  const annualTaxable = Math.max(
    0,
    taxableMonthly * 12 - ANNUAL_BASIC_DEDUCTION - specialDeduction * 12,
  )
  const taxYear = annualTax(annualTaxable)
  const taxMonthly = taxYear / 12

  const netMonthly = grossMonthly - insuranceMonthly - fundMonthly - taxMonthly
  const disposableMonthly = netMonthly + fundMonthly

  // 真实时薪的分母是实际工时，不是 21.75 个计薪天
  const monthlyHours = workDays * dailyHours
  const realHourly = monthlyHours > 0 ? disposableMonthly / monthlyHours : 0
  const cashHourly = monthlyHours > 0 ? netMonthly / monthlyHours : 0
  const weeklyHours = (monthlyHours * 12) / 52

  return {
    grossMonthly,
    contributionBase,
    insuranceMonthly,
    fundMonthly,
    netMonthly,
    disposableMonthly,
    annualTaxable,
    annualTax: taxYear,
    realHourly,
    cashHourly,
    monthlyHours,
    weeklyHours,
  }
}

/** 格式化金额，去掉多余小数 */
export function money(n: number): string {
  return Math.round(n).toLocaleString('zh-CN')
}

export function num(n: number, digits = 1): string {
  return n.toFixed(digits)
}
