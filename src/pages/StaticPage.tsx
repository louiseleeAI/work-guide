import { useEffect } from 'react'
import { chapters, entries, DISCLAIMER } from '../data'

const PAGES: Record<string, { title: string; lede: string; body: string[] }> = {
  about: {
    title: '关于本站',
    lede: '一份按「值不值」组织的打工指南。',
    body: [
      '这个站的想法很简单：打工的绝大多数建议都被写成了「应该怎么做」，但很少有人告诉你「在什么条件下才值得做」。同一个动作，对月薪 4千 的人是浪费，对 4万 的人是救命。',
      '所以每条建议都有一条阈值线，回答的是「你的时薪要到多少，这条才划算」。这条线是可以代入的数字，不是形容词。',
      '内容框架参考了 HowToLiveBetter（高性价比人生指南），那是一份 667 条建议的生活指南。我们沿用了它最关键的两条纪律：每条建议必须标注出处，以及不同口径的收益不互相折算。新增的是打工场景专属的三种收益口径——现金流、工龄复利、议价权，以及每条建议的阈值线。',
      '法律相关内容以现行法律和官方数据为准，每条都标注条款号和生效日期。查不到全国统一规定的地方，明确标注「各地口径有差异」，不写成确定结论。',
    ],
  },
  contact: {
    title: '联系我们',
    lede: '最需要的是这两类反馈。',
    body: [
      '法条纠错：如果某一条的数字、条款号或生效日期不对，请指出来。这类错误会影响读者的实际决策，我们优先级最高。',
      '地区差异：竞业补偿、社保与公积金的口径各地差异很大。你所在地的实际情况，往往比通用规则更有价值。',
      '阈值线校准：如果你算过之后发现某条阈值明显不合理（比如对你所在的城市、你的家庭状况），告诉我们。',
      '其他：内容表述有歧义、算错了、或者只是觉得某条没用，都可以讲。',
    ],
  },
  privacy: {
    title: '隐私政策',
    lede: '这个站没有账号系统，也不上传任何数据。',
    body: [
      '本站目前不使用账号系统，不做登录，也没有任何形式的用户追踪。',
      '你的以下记录保存在你自己浏览器的本地存储里：每日一问的打卡日期、测算器填过的薪资参数。这些数据不会离开你的设备，清除浏览器数据会一并清掉。',
      '本站不收集邮箱、不收集个人信息、没有任何第三方统计脚本。',
      '如果你通过邮件联系我们，我们只用它回复你的问题。',
    ],
  },
  terms: {
    title: '服务条款',
    lede: '内容用于信息参考，不构成专业意见。',
    body: [
      '本站内容仅供信息参考，不构成法律、医疗或财务建议。具体决策请结合你的实际情况，咨询有资质的专业人士。',
      '劳动仲裁时效、竞业限制补偿标准、社保与公积金的具体口径存在明显的地区差异，且政策文件会不定期修订。本站的数字是全国性法律规定，地方性规定会单独标注。',
      '站点内的算账工具和阈值线是估算工具，不保证准确对应你的实际收入结构。社保缴费比例各地不同，测算结果仅供比较。',
      '本站为个人整理的公益项目，与参考站 HowToLiveBetter 无隶属关系。原书作者对内容拥有全部权利，本站仅作场景化改编。',
    ],
  },
  changelog: {
    title: '更新日志',
    lede: '这个站还在样板阶段。',
    body: [
      '2026-10-06　完成第一期内容样板：3 个章节、14 条建议，分别是 offer 总包拆解、加班的真实时薪、合同的坑。这三章覆盖了现金流、工龄复利、议价权三种收益口径，法条密度最高，用来检验框架是否站得住。',
      '2026-10-06　上线四个工具与机制：到手测算器、真实时薪阈值判定、每日一问的打卡统计、决策类条目的检索。',
      '2026-10-06　完成法条核实与内容校验。已修正若干流传中的误传，包括把「本科起薪 6435 元」归到国家统计局、把「仲裁结案率 98.4%」当成「劳动者胜诉率」。',
      '待完成：剩余 25 章内容、反面清单、社保测算器的逐城市配置、留下还是走的决策表。',
    ],
  },
}

export function StaticPage({ id }: { id: string }) {
  const p = PAGES[id]

  useEffect(() => {
    document.title = `${p?.title ?? '未找到'} · 高性价比打工指南`
  }, [p])

  if (!p) {
    return (
      <div className="wrap-narrow page">
        <div className="empty">
          没有这个页面。<a href="#/">回到首页</a>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap-narrow page">
      <a className="back" href="#/">
        <span aria-hidden="true">←</span> 返回
      </a>
      <h1 className="page-title">{p.title}</h1>
      <p className="page-lede">{p.lede}</p>

      <div className="d-body">
        {p.body.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </div>

      {id === 'about' && (
        <div className="sec-head mt-l">
          <h2>当前进度</h2>
          <span className="sh-note">
            {entries.length} 条建议 · {chapters.length} 章
          </span>
        </div>
      )}

      {id === 'terms' && (
        <div className="disclaimer mt-l">
          <span className="dc-label">免责说明</span>
          {DISCLAIMER}
        </div>
      )}

      <a className="back mt-l" href="#/">
        <span aria-hidden="true">←</span> 回到首页
      </a>
    </div>
  )
}