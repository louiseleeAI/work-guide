import type { BookMeta, Chapter, Entry } from '../types'
import { ch03, entries as e03 } from './chapters/ch03'
import { ch09, entries as e09 } from './chapters/ch09'
import { ch16, entries as e16 } from './chapters/ch16'

export const DISCLAIMER =
  '本站内容用于信息参考，不构成法律意见。劳动仲裁时效、竞业限制补偿、社保与公积金的具体口径存在明显的地区差异，' +
  '且政策文件会不定期修订。涉及具体决策时，请以你所在地的人力资源和社会保障部门、公积金管理中心口径为准，' +
  '并在关键节点咨询执业律师。'

export const chapters: Chapter[] = [ch03, ch09, ch16]

export const entries: Entry[] = [...e03, ...e09, ...e16]

export const book: BookMeta = {
  title: '高性价比打工指南',
  subtitle: '每条建议都写清楚：花掉什么，换回什么，以及你的时薪要到多少才值得做。',
  updatedAt: '2026-10-06',
  chapters,
  entries,
  disclaimer: DISCLAIMER,
}

/** 章节 ID → 章节 */
export const chapterMap = new Map(chapters.map((c) => [c.id, c]))

/** 条目 ID → 条目 */
export const entryMap = new Map(entries.map((e) => [e.id, e]))

/** 某章下的条目 */
export function entriesOfChapter(chapterId: string): Entry[] {
  return entries.filter((e) => e.chapterId === chapterId)
}

/** 某章条目数 */
export function countOfChapter(chapterId: string): number {
  return entriesOfChapter(chapterId).length
}

/**
 * 条目的可见编号，形如 `09-03`。
 *
 * 为什么不用条目 ID 当编号：ID 形如 `work-09-03`，是内部标识，不适合印在纸上、
 * 也不适合口头引用（「第九章第三条」）。参考站的PDF 用的是 `02-01` 这种两段式，
 * 章号-序号，两位数补零——辨识度高、可朗读、可交叉引用。
 *
 * 序号从条目在所属章节内的出现顺序推导，不写进数据文件：
 * 这样调整条目顺序时编号自动重排，不会出现手写序号对不上的情况。
 */
export function entryNo(e: Entry): string {
  const ch = chapterMap.get(e.chapterId)
  if (!ch) return ''
  const i = entriesOfChapter(e.chapterId).findIndex((x) => x.id === e.id) + 1
  return `${ch.number}-${String(i).padStart(2, '0')}`
}

/** 上一章 / 下一章（按 index 排序） */
export function neighborChapters(chapterId: string): { prev?: Chapter; next?: Chapter } {
  const sorted = [...chapters].sort((a, b) => a.index - b.index)
  const i = sorted.findIndex((c) => c.id === chapterId)
  if (i === -1) return {}
  return { prev: sorted[i - 1], next: sorted[i + 1] }
}