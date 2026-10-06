/** 到手测算与时薪计算 */

export interface SalaryInput {
  /** 税前月薪（元） */
  grossMonthly: number
  /** 五险一金个人缴纳比例，如 0.27 */
  socialRate: number
  /** 每月实际工作小时数 */
  dailyHours: number
  /** 每月计薪天数，默认 21.75 */
  payDays: number
  /** 专项附加扣除月减税额（元），如房贷+租房+子女教育 */
  monthlyDeduction: number
}

/** 全国社保个人缴纳比例分档：低档（内陆/较低基数城市） */
export const SOCIAL_TIERS = [
  { id: 'low', label: '较低（内陆城市或低缴费基数）', rate: 0.24 },
  { id: 'mid', label: '中等（多数省会城市）', rate: 0.265 },
  { id: 'high', label: '较高（一线城市或高基数参保）', rate: 0.28 },
] as const

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

export const ANNUAL_BASIC_DEDUCTION = 60000

/** 计算一个年度综合所得的个税 */
export function annualTax(annualTaxable: number): number {
  if (annualTaxable <= 0) return 0
  const b = TAX_BRACKETS.find((x) => annualTaxable <= x.upTo)!
  return annualTaxable * b.rate - b.deduct
}

export interface SalaryResult {
  /** 税前月薪 */
  grossMonthly: number
  /** 每月五险一金个人缴纳额 */
  socialMonthly: number
  /** 税前 - 社保（= 个税计税基数） */
  taxableMonthly: number
  /** 全年应纳税所得额 */
  annualTaxable: number
  /** 全年个税 */
  annualTax: number
  /** 每月个税（平均） */
  taxMonthly: number
  /** 到手月薪 */
  netMonthly: number
  /** 每月公积金进入个人账户的金额（不含在到手内） */
  fundMonthly: number
  /** 税后真实时薪 */
  realHourly: number
  /** 每周工作小时数 */
  weeklyHours: number
}

export function calcSalary(input: SalaryInput): SalaryResult {
  const {
    grossMonthly,
    socialRate,
    dailyHours,
    payDays = 21.75,
    monthlyDeduction = 0,
  } = input

  const socialMonthly = grossMonthly * socialRate
  const taxableMonthly = Math.max(0, grossMonthly - socialMonthly)
  const annualTaxable = Math.max(
    0,
    taxableMonthly * 12 - ANNUAL_BASIC_DEDUCTION - monthlyDeduction * 12,
  )
  const taxYear = annualTax(annualTaxable)
  const taxMonthly = taxYear / 12
  const netMonthly = grossMonthly - socialMonthly - taxMonthly

  // 公积金个人部分通常在 5%-12%，此处按上限 12% 估算个人账户积累
  const fundMonthly = grossMonthly * 0.12

  const realHourly = dailyHours > 0 ? netMonthly / payDays / dailyHours : 0
  const weeklyHours = dailyHours * payDays / 5

  return {
    grossMonthly,
    socialMonthly,
    taxableMonthly,
    annualTaxable,
    annualTax: taxYear,
    taxMonthly,
    netMonthly,
    fundMonthly,
    realHourly,
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