/** 导出全书 Markdown。用法：npx esbuild --bundle 后用 node 运行，或 npx tsx 直接运行。 */
import { writeFileSync } from 'node:fs'
import { buildMarkdown } from '../src/lib/export'

const out = process.argv[2] ?? '高性价比打工指南-完整版.md'
writeFileSync(out, buildMarkdown(true), 'utf-8')
const lines = buildMarkdown(true).split('\n').length
console.log(`已导出 ${out}（${lines} 行）`)
