# 站点配置

**改这个文件就够了，组件里不写死任何域名。**

```ts
export const AUTHOR_NAME = 'Louise'
export const AUTHOR_URL = 'https://github.com/louiseleeAI'
export const SHOW_BUILD_CREDIT = true
export const SITE_NAME = '高性价比打工指南'
export const UPDATED_AT = '2026-10-12'
```

## `AUTHOR_URL` 支持两种写法

组件会自动判断，不用手动切换：

| 写法 | 渲染结果 | 场景 |
|---|---|---|
| `'/'` | `<a href="/">` 站内跳转，不开新窗口 | 指南放在主站的 `/guide/` 路径下 |
| `'https://github.com/louiseleeAI'` | `target="_blank" rel="noreferrer"` 跨站跳转 | 指南用独立域名，署名链到 GitHub |

判断逻辑：`startsWith('/')` 视为站内，否则视为跨站加安全属性。

## 「需要两个域名吗」

不需要。域名数量和页面路径数量是两件事。详见 `docs/部署与域名.md`。