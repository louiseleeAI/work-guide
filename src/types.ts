/**
 * 条目数据模型
 *
 * 扩展自 howtolivebetter.net 的条目结构，核心新增 field: threshold（阈值线）。
 * 阈值线把「性价比」从形容词变成可代入的数字：
 *   值得投入 ⟺ 预期收益 / 占用工时 ≥ 你的时薪
 */

export type EvidenceLevel = 'A' | 'B' | 'C'

/** 三档成本，沿用原站 */
export type CostLevel = '高' | '中' | '低' | '零'

/**
 * 打工版三种收益口径。
 * 沿用原站铁律：三种口径互不换算，不合成总分。
 */
export type BenefitKind = 'cash' | 'seniority' | 'bargain'

export const BENEFIT_LABEL: Record<BenefitKind, string> = {
  cash: '现金流',
  seniority: '工龄复利',
  bargain: '议价权',
}

/**
 * 阈值线单位。
 *
 * none 表示本条不适用阈值判断——不是偷懒，而是有些内容本来就不是
 * 「投入时间换收益」的决策：法条要件（竞业适用人群）、金额主张（补偿标准）
 * 没有时薪框架的位置。硬塞时薪只会产出「时薪 0 元」这种 UI 笑话。
 * 权利窗口类内容用 years（试用期上限对应合同期限、仲裁时效对应离职年限）。
 */
export type ThresholdUnit = 'hourly' | 'years' | 'total' | 'none'

/**
 * 阈值线：这是本项目区别于参考站的核心字段。
 *
 * 【分级使用原则 —— 2026-10-07 盲审后确立，写章前必读】
 * 阈值不是全站一个常数，而是每个决策自己的临界值。按适用性分三类：
 *
 * 1. unit:'hourly' —— 仅用于「确定的 X 小时换确定的 Y 元」的场景
 *    （如私活报价 vs 现金时薪）。value 必须由 derivation 里的 X、Y 算出：
 *    临界时薪 = Y / X。给不出 X 和 Y 的，不许拍一个数。
 *
 * 2. unit:'none' + 临界公式 —— 临界值本身是读者数字的函数的场景
 *    （如 offer 比较、搬家月租差、远程折算）。below 里给公式或临界表，
 *    让读者代入自己的数字。
 *
 * 3. unit:'none' + 无条件动作 —— 收益或成本一边不可量化的场景
 *    （如简历重写、面试准备、可见度损失）。below 直说为什么不用算，
 *    以及无条件成立的动作是什么。
 *
 * 注意：'进场'与'风险'两部的多数条目属于第 2、3 类——这不是框架失效，
 * 是生命周期阶段的性质。时薪阈值的主场在'在职'部（通勤、副业、装备、年假）。
 * 【硬纪律】任何 derivation 里的算式，提交前必须用 calc.ts 跑脚本验算，
 * 禁止手工心算（2026-10-07 盲审发现两处因心算导致的结论反转）。
 */
export interface Threshold {
  unit: ThresholdUnit
  /** 阈值数值。unit 为 none 时省略 */
  value?: number
  /** 该阈值的含义说明，如「税后时薪」 */
  basis: string
  /** 低于阈值时的行动，或 none 时的无条件行动 */
  below: string
  /**
   * 推导口径：这个数字怎么来的。
   * 没有推导的阈值就是拍脑袋，读者有权追问；写不出来就别设值。
   */
  derivation?: string
}

export interface Source {
  /** 文件名或法律名 */
  title: string
  /** 文号，如「法释〔2020〕26 号」，无则留空 */
  docNumber?: string
  /** 生效日期或发布日期 */
  effectiveDate: string
  /** 原文链接 */
  url?: string
  /** 是否为地方性规定 */
  local?: boolean
  /** 地方名称，local 为 true 时必填 */
  region?: string
}

export interface Entry {
  /** 稳定 ID，形如 work-06-09。内容可改，ID 不变，保证用户标记不丢 */
  id: string
  chapterId: string
  /** 标题写成动作，不写道理 */
  title: string
  /** 结论前置，一句话说完 */
  summary: string
  /**
   * 三步行动清单（可选）。动词开头、可直接执行，恰好 3 条；
   * 没写的条目说明它本来就不需要「今天做点什么」。
   */
  steps?: string[]
  /** 正文段落 */
  body: string[]
  threshold: Threshold
  /** 三档成本 */
  cost: {
    money: CostLevel
    time: CostLevel
    /** 毅力 */
    will: CostLevel
  }
  /** 收益口径及强度 */
  benefit: {
    kind: BenefitKind
    level: '大' | '中' | '小'
  }
  evidence: {
    level: EvidenceLevel
    /** 为什么是这个等级 */
    reason: string
  }
  /** 适用人群 */
  appliesTo: string
  /** 不适用人群 */
  notFor?: string
  /** 出处列表 */
  sources: Source[]
  /** 备注：例外情况、地区差异、口径限制 */
  note?: string
  /** 是否涉及法律决策，需显示免责提示 */
  legal?: boolean
}

export interface Chapter {
  id: string
  index: number
  part: string
  title: string
  /** 本章解决什么问题 */
  intro: string
  /** 章节编号，如「03」 */
  number: string
  /** 本章正文源文件链接（对应参考站的「查看原书」） */
  sourceRepo?: string
}

export interface BookMeta {
  title: string
  subtitle: string
  updatedAt: string
  chapters: Chapter[]
  entries: Entry[]
  disclaimer: string
}