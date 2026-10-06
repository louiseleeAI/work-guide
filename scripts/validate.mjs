/**
 * 内容校验：在 build 之前检查条目数据是否完整、字段是否合法。
 * 这套「出处必填、阈值线必填」的约束是内容可信度的地基，不能靠人记。
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CHAPTERS_DIR = join(__dirname, '..', 'src', 'data', 'chapters')

const VALID_EVIDENCE = ['A', 'B', 'C']
const VALID_COST = ['零', '低', '中', '高']
const VALID_LEVEL = ['大', '中', '小']
const VALID_UNIT = ['hourly', 'years', 'total']

let errors = 0
let warnings = 0
const ids = new Set()
let count = 0

function err(chapter, msg) {
  errors++
  console.error(`  [错误] 第 ${chapter} 章: ${msg}`)
}
function warn(chapter, msg) {
  warnings++
  console.warn(`  [提醒] 第 ${chapter} 章: ${msg}`)
}

const files = readdirSync(CHAPTERS_DIR).filter((f) => f.endsWith('.tsx'))

console.log(`检查 ${files.length} 个章节文件\n`)

for (const f of files) {
  const raw = readFileSync(join(CHAPTERS_DIR, f), 'utf8')
  const num = f.match(/^ch(\d+)/)?.[1] ?? '??'
  console.log(`第 ${num} 章  ${f}`)

  // 提取 chapter 元信息
  const title = raw.match(/title:\s*'([^']+)'/)?.[1]
  if (!title) err(num, '缺少章节 title')
  const intro = raw.match(/intro:\s*([\s\S]*?),\n\}/)?.[1]
  if (!intro || intro.length < 80) warn(num, '章节 intro 过短，建议说明本章解决什么问题')

  // 提取所有条目标题用于计数校验
  const entryBlocks = raw.split(/\n  \{\n/).slice(1)
  for (const block of entryBlocks) {
    count++
    const id = block.match(/id:\s*'([^']+)'/)?.[1]
    if (!id) {
      err(num, '有条目缺少 id')
      continue
    }
    if (ids.has(id)) err(num, `id 重复：${id}`)
    ids.add(id)

    const expectedPrefix = `work-${num}-`
    if (!id.startsWith(expectedPrefix)) {
      err(num, `id ${id} 与章节号不匹配，应以 ${expectedPrefix} 开头`)
    }

    if (!block.match(/title:\s*'[^']+'/)) err(num, `${id} 缺少 title`)
    if (!block.match(/summary:\s*'[^']+'/)) err(num, `${id} 缺少 summary（结论应前置）`)

    // threshold
    const thValue = block.match(/threshold:\s*\{[\s\S]*?value:\s*(-?\d+)/)?.[1]
    const thUnit = block.match(/threshold:\s*\{[\s\S]*?unit:\s*'([^']+)'/)?.[1]
    const thBasis = block.match(/threshold:\s*\{[\s\S]*?basis:\s*'([^']+)'/)?.[1]
    const thBelow = block.match(/threshold:\s*\{[\s\S]*?below:\s*'([\s\S]*?)',\n    \}/)?.[1]
    if (thValue === undefined) err(num, `${id} 缺少 threshold.value（这是核心字段，不能省）`)
    if (!thUnit || !VALID_UNIT.includes(thUnit)) err(num, `${id} threshold.unit 非法：${thUnit}`)
    if (!thBasis) err(num, `${id} 缺少 threshold.basis（阈值口径要说清楚）`)
    if (!thBelow || thBelow.length < 20) {
      err(num, `${id} threshold.below 过短，必须说明「低于阈值会怎样」`)
    }
    if (thUnit === 'hourly' && Number(thValue) === 0) {
      warn(num, `${id} 时薪阈值为 0，确认是否有意为之`)
    }

    // cost
    for (const k of ['money', 'time', 'will']) {
      const m = block.match(new RegExp(`${k}:\\s*'([^']+)'`))
      if (!m) err(num, `${id} 缺少 cost.${k}`)
      else if (!VALID_COST.includes(m[1])) err(num, `${id} cost.${k} 取值非法：${m[1]}`)
    }

    // benefit
    const benKind = block.match(/kind:\s*'([^']+)'/)?.[1]
    const benLevel = block.match(/benefit:\s*\{[\s\S]*?level:\s*'([^']+)'/)?.[1]
    if (!['cash', 'seniority', 'bargain'].includes(benKind))
      err(num, `${id} benefit.kind 非法：${benKind}`)
    if (!benLevel || !VALID_LEVEL.includes(benLevel)) err(num, `${id} benefit.level 非法：${benLevel}`)

    // evidence
    const ev = block.match(/evidence:\s*\{[\s\S]*?level:\s*'([^']+)'/)?.[1]
    const evReason = block.match(/evidence:\s*\{[\s\S]*?reason:\s*'([\s\S]*?)',\n    \}/)?.[1]
    if (!ev || !VALID_EVIDENCE.includes(ev)) err(num, `${id} evidence.level 非法：${ev}`)
    if (!evReason || evReason.length < 15) err(num, `${id} 缺少 evidence.reason（要说明为什么是这个等级）`)

    // appliesTo
    if (!block.match(/appliesTo:\s*'[^']+'/)) err(num, `${id} 缺少 appliesTo`)

    // sources —— 可信度地基，必须有
    const srcCount = (block.match(/effectiveDate:/g) || []).length
    if (srcCount === 0) err(num, `${id} 缺少 sources（每条建议必须有出处，这是本项目的立身之本）`)
    else if (srcCount > 1) warn(num, `${id} 有 ${srcCount} 条出处，确认是否都必要`)

    // source 必须有生效日期
    const badDate = block.match(/effectiveDate:\s*'([^']*)'/)?.[1]
    if (badDate === '') err(num, `${id} source 缺生效日期`)

    // legal 标记
    const isLegal = /legal:\s*true/.test(block)
    const hasNote = /note:\s*'/.test(block)
    if (isLegal && !hasNote) warn(num, `${id} 标记为法律条目但没有 note（建议标注争议点或地区差异）`)
  }

  console.log(`        ${entryBlocks.length} 条`)
  console.log('')
}

console.log(`共 ${count} 条条目`)
if (errors > 0) {
  console.error(`\n✗ ${errors} 个错误，${warnings} 个提醒`)
  process.exit(1)
}
console.log(`\n✓ 校验通过${warnings > 0 ? `（${warnings} 个提醒）` : ''}`)