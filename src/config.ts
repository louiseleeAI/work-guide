/**
 *站点配置。改这里就行，组件里不写死。
 *
 * 关于「主站链接」：
 * Ben 的howtolivebetter.net 用独立域名，所以footer 链回 benx.ai 是跨站链接。
 * 你有两种选择：
 *
 * 1. 指南放在主站的子路径下（如 yoursite.com/guide）
 *    → AUTHOR_URL 填主站的绝对地址，链接是普通站内跳转
 *    → 不需要额外买域名
 *
 * 2. 指南用独立域名（如 workguide.example.com）
 *    → AUTHOR_URL 填主站绝对地址，链接是跨站跳转
 *    → 需要单独买域名并配DNS，但品牌更独立、便于转让
 *
 * 两种情况下 footer 的写法完全一样，区别只在这个配置值。
 */

/** 署名者名字，会被渲染成超链接 */
export const AUTHOR_NAME = 'Ben'

/** 署名链接指向的地址。站内写 '/', 独立域名写完整 https URL */
export const AUTHOR_URL = 'https://benx.ai/'

/** 是否在署名后显示「Build with ❤ and AI」 */
export const SHOW_BUILD_CREDIT = true

/** 站点名称 */
export const SITE_NAME = '高性价比打工指南'

/** 内容更新日期 */
export const UPDATED_AT = '2026-10-06'