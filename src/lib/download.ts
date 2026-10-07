/** 浏览器端文件下载 */
import { buildMarkdown, buildWordHtml } from './export'

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 3000)
}

export function downloadMarkdown(full: boolean) {
  const md = buildMarkdown(full)
  saveBlob(
    new Blob([md], { type: 'text/markdown;charset=utf-8' }),
    full ? '高性价比打工指南-完整版.md' : '高性价比打工指南-精简版.md'
  )
}

export function downloadWord(full: boolean) {
  // Word 可直接打开 HTML 兼容格式（.doc），中文无需特殊处理
  const html = buildWordHtml(full)
  saveBlob(
    new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' }),
    full ? '高性价比打工指南-完整版.doc' : '高性价比打工指南-精简版.doc'
  )
}

/** PDF 走打印视图：跳转独立路由后由用户「另存为 PDF」，中文渲染无依赖问题 */
export function goPrint(mode: 'full' | 'simple') {
  window.location.hash = `#/print/${mode}`
}
