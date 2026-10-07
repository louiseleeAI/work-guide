import { useEffect } from 'react'
import { antiItems, antiMeta } from '../data/anti'

/** 反面清单：你以为 / 实际上 / 代价 */
export function AntiPage() {
  useEffect(() => {
    document.title = '反面清单 · 高性价比打工指南'
  }, [])

  return (
    <div className="wrap-narrow anti">
      <div className="anti-head">
        <h1 className="anti-title">{antiMeta.title}</h1>
        <p className="anti-lede">{antiMeta.lede}</p>
      </div>

      <div className="anti-list">
        {antiItems.map((a, i) => (
          <article className="anti-row" key={a.id}>
            <div className="anti-no">{String(i + 1).padStart(2, '0')}</div>
            <div className="anti-main">
              <h2 className="anti-item-title">{a.title}</h2>
              <div className="anti-line">
                <span className="anti-tag t-trap">你以为</span>
                <span>{a.trap}</span>
              </div>
              <div className="anti-line">
                <span className="anti-tag t-truth">实际上</span>
                <span>{a.truth}</span>
              </div>
              <div className="anti-line">
                <span className="anti-tag t-loss">代价</span>
                <span className="anti-loss">{a.loss}</span>
              </div>
              <div className="anti-basis">依据：{a.basis}</div>
            </div>
          </article>
        ))}
      </div>

      <p className="anti-foot">
        本清单与正文条目互为对照，完整出处见各条目详情页的「出处」区；
        涉及法律的事项以劳动合同履行地的裁审口径为准，本站内容不构成法律意见。
      </p>
    </div>
  )
}
