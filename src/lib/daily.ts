/**
 * 「每日一问」的数据层。
 *
 * 与参考站的「每日任务」区别：原站给的是可重复的小行动（多喝水、早睡），
 * 一次性完成即永久受益。打工场景里绝大多数条目是**一次性决策**
 * （要不要跳槽、要不要接私活），给决策打卡是荒谬的。
 *
 * 所以这里给的是「今天一个待算的账」——不是行动清单，是一个需要填数字的问题。
 * 低门槛日常回访的机制保留，内容符合打工场景。
 */

/** 每日一问的题目池。每题要填的字段对应一个具体的算账动作。 */
export interface DailyPrompt {
  id: string
  /** 题干：一个具体要算的账 */
  q: string
  /** 为什么值得算，一句话 */
  why: string
  /** 填什么（引导用户去算） */
  fill: string
  /** 关联的条目，用户算完可以去看依据 */
  ref?: string
  /** 预计耗时（分钟） */
  mins: number
}

export const DAILY_PROMPTS: DailyPrompt[] = [
  {
    id: 'd01',
    q: '你的税后真实时薪是多少？',
    why: '这是全书所有判断的分母。不知道它，「值不值」这三个字没有意义。',
    fill: '到手月薪 ÷ 21.75 ÷ 每天真实工作小时数',
    ref: 'work-09-01',
    mins: 2,
  },
  {
    id: 'd02',
    q: '这个月你实际工作了多久？超过多少小时算加班？',
    why: '《劳动法》第 41 条的法定上限是每月 36 小时。先知道自己的数字，才知道有没有被越线。',
    fill: '打卡记录、邮件时间戳的实际小时数',
    ref: 'work-09-02',
    mins: 3,
  },
  {
    id: 'd03',
    q: '你的 offer 里，「总包」有几个数字？折成到手是多少？',
    why: '年包通常由底薪、绩效、年终奖、股票组成，真正下个月到卡上的只是其中一部分。',
    fill: '税前月薪 → 减五险一金 → 减个税 → 到手',
    ref: 'work-03-01',
    mins: 5,
  },
  {
    id: 'd04',
    q: '你的劳动合同里，有竞业限制条款吗？签的时候你知不知道它最长 2 年？',
    why: '2025 年 9 月 1 日起施行的新司法解释明确：接触不到商业秘密的人，这条约定不生效。',
    fill: '翻出合同，看第 23、24 条',
    ref: 'work-16-01',
    mins: 3,
  },
  {
    id: 'd05',
    q: '你被规定过试用期吗？合同期限多久，试用期约定几个月？',
    why: '一年以上不满三年的最多约 2 个月，违法约定的已经履行了要按转正工资赔。',
    fill: '合同期限 vs 试用期上限，对一下',
    ref: 'work-16-03',
    mins: 2,
  },
  {
    id: 'd06',
    q: '如果你明天被裁，N+1 是多少？N 怎么算的？',
    why: 'N 是工作年限折算的月数，不满 6 个月按半个月。同一份工作 3 年，月薪 2 万和 1 万差 10 万。',
    fill: '按第 47 条折算，注意封顶规则',
    ref: 'work-16-04',
    mins: 4,
  },
  {
    id: 'd07',
    q: '你上一个加班月，实际拿到加班费了吗？折成时薪是多少？',
    why: '如果折算时薪低于你的基准时薪，这笔加班在机会成本上是亏的，不管它叫不叫奋斗。',
    fill: '加班费总额 ÷ 加班小时数',
    ref: 'work-09-04',
    mins: 3,
  },
  {
    id: 'd08',
    q: '你的社保、公积金按多少基数缴的？和实际工资差多少？',
    why: '缴费基数不是你的月薪。公积金个人部分不进「到手」但属于你的钱。',
    fill: '查最近一个月的工资条',
    mins: 3,
  },
  {
    id: 'd09',
    q: '你现在这份工作，实际时薪是多少？比你想的高还是低？',
    why: '很多人从没算过。算完之后再决定要不要谈涨薪，谈判位置完全不同。',
    fill: '和上一题同一个公式',
    ref: 'work-03-01',
    mins: 2,
  },
  {
    id: 'd10',
    q: '如果现在要跳槽，涨多少才够覆盖迁移成本？',
    why: '涨幅低于 30% 可能只是换一个地方上班。算清这条线，避免为了小幅涨幅承担失业风险。',
    fill: '猎头费 + 空窗期损失 + 搬迁成本，对比涨幅',
    mins: 8,
  },
  {
    id: 'd11',
    q: '你的岗位适用哪种工时制？标准工时、综合计算，还是不定时？',
    why: '不定时工作制原则上不适用加班费规定。这一条会直接改变你的时间账。',
    fill: '看合同或问 HR，要人社部门的批复文件',
    ref: 'work-09-05',
    mins: 3,
  },
  {
    id: 'd12',
    q: '你手上有公司给的「内部福利」吗？折成现钱是月薪的百分之几？',
    why: '体检、培训、团建、班车这类东西折现通常不到月薪 2%，但在看 offer 时很容易被当成筹码。',
    fill: '逐项估个价，再除以到手月薪',
    ref: 'work-03-04',
    mins: 5,
  },
  {
    id: 'd13',
    q: '你今年做过几次可能违反「36 小时/月」上限的加班月？',
    why: '违法加班费是笔小钱，但越线本身意味着公司制度有问题。证据比钱重要。',
    fill: '翻一年的打卡记录做估算',
    ref: 'work-09-02',
    mins: 6,
  },
  {
    id: 'd14',
    q: '你准备离开这家公司的原因，是钱、还是别的？两者各占多少？',
    why: '如果走的原因是别的，加钱未必能解决。分清这两者，才知道该不该谈涨薪。',
    fill: '列三件最想走的原因，标出哪些能用钱解决',
    mins: 5,
  },
  {
    id: 'd15',
    q: '你上一次核对自己工龄和社保年限，是为了什么？',
    why: '养老金最低缴费年限 2025-2029 年仍是 15 年，但 2030 年起每年提高 6 个月，到 2039 年变成 20 年。',
    fill: '查累计缴费年限，对照官方口径',
    mins: 4,
  },
]

// ---------- 本地存储 ----------

const KEY_DAILY = 'wg.daily.v1'

export interface DailyState {
  /** 已打卡的日期（YYYY-MM-DD，本地时区） */
  days: string[]
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function loadDaily(): DailyState {
  if (typeof localStorage === 'undefined') return { days: [] }
  try {
    const raw = localStorage.getItem(KEY_DAILY)
    if (!raw) return { days: [] }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed?.days) ? { days: parsed.days } : { days: [] }
  } catch {
    return { days: [] }
  }
}

function saveDaily(s: DailyState) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(KEY_DAILY, JSON.stringify(s))
  } catch {
    /* 隐私模式下写入失败，静默处理 */
  }
}

export function checkIn(d = new Date()) {
  const k = todayKey(d)
  const s = loadDaily()
  if (s.days.includes(k)) return s
  const next = { days: [...s.days, k].sort() }
  saveDaily(next)
  return next
}

export function undoToday(d = new Date()) {
  const k = todayKey(d)
  const s = loadDaily()
  const next = { days: s.days.filter((x) => x !== k) }
  saveDaily(next)
  return next
}

/** 累计天数 */
export function totalDays(s: DailyState): number {
  return s.days.length
}

/** 当前连续天数（从今天或昨天往前推） */
export function streak(s: DailyState): number {
  if (s.days.length === 0) return 0
  const set = new Set(s.days)
  const now = new Date()

  // 从今天开始；如果今天没打卡，从昨天开始算
  let cursor = new Date(now)
  if (!set.has(todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!set.has(todayKey(cursor))) return 0
  }

  let n = 0
  while (set.has(todayKey(cursor))) {
    n++
    cursor.setDate(cursor.getDate() - 1)
  }
  return n
}

/** 本月打卡天数 */
export function monthDays(s: DailyState): number {
  const now = new Date()
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return s.days.filter((d) => d.startsWith(prefix)).length
}

/** 生成近 n 天的日期数组，供日历热力图使用 */
export function lastNDays(n: number): string[] {
  const out: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    out.push(todayKey(d))
  }
  return out
}

/** 今日的题目：按日期确定性选取，同一天进来看到同一题 */
export function promptOfDay(d = new Date()): DailyPrompt {
  const k = todayKey(d)
  // 用日期做哈希，保证同一天固定
  let h = 0
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0
  return DAILY_PROMPTS[h % DAILY_PROMPTS.length]
}