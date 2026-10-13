/**
 * 章节配图：程序生成的抽象图形。
 * 参考站用 collage 照片，我们用与章节内容呼应的数据图形——
 * 「加班」章画工时条，「总包」章画拆解块，「合同」章画条款分层。
 * 好处：无外链依赖、加载快、和内容真的有关系。
 *
 * 配色按「部分」分色：进场=蓝、在职=teal、风险=琥珀红、转折=violet。
 * 读者扫一眼章节流的颜色就能看出书的骨架。
 */

type Props = {
  chapterId: string
  className?: string
}

type Palette = {
  bg: string
  line: string
  blue: string
  deep: string
  soft: string
  amber: string
  amberSoft: string
}

/** 进场：墨蓝（结构色） */
const BLUE: Palette = {
  bg: '#f7f4ee',
  line: '#ddd5c8',
  blue: '#5b7285',
  deep: '#22303d',
  soft: '#c3ccd3',
  amber: '#b4784f',
  amberSoft: '#e5cbb6',
}

const PALETTES: Record<string, Palette> = {
  进场: BLUE,
  在职: {
    bg: '#f4f6f3',
    line: '#d8e0d8',
    blue: '#4b6f63',
    deep: '#2c463d',
    soft: '#c3d2ca',
    amber: '#b4784f',
    amberSoft: '#e5cbb6',
  },
  风险: {
    bg: '#faf2ee',
    line: '#e8d3ca',
    blue: '#a3483c',
    deep: '#632c26',
    soft: '#ddbfb7',
    amber: '#a3483c',
    amberSoft: '#e3c2ba',
  },
  转折: {
    bg: '#f4f3f6',
    line: '#ddd9e5',
    blue: '#6a6285',
    deep: '#3f3a52',
    soft: '#c9c4d6',
    amber: '#b4784f',
    amberSoft: '#e5cbb6',
  },
}

/** chapterId → 所属部分（与数据 part 字段一致，这里静态映射避免循环依赖） */
function partOf(chapterId: string): string {
  const n = Number(chapterId.replace('ch', ''))
  if (n <= 5) return '进场'
  if (n <= 15) return '在职'
  if (n <= 22) return '风险'
  return '转折'
}

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 400 200" className={className} style={{ display: 'block', width: '100%' }}>
      {children}
    </svg>
  )
}

/** ch03 offer 总包拆解：一个整块被拆成几块，大的那块是底薪 */
function OfferSplit({ p, className }: { p: Palette; className?: string }) {
  return (
    <Frame className={className}>
      <rect width="400" height="200" fill={p.bg} />
      {/* 一整块 */}
      <rect x="24" y="26" width="352" height="30" rx="4" fill={p.line} />
      {/* 拆解后的部分 */}
      <rect x="24" y="72" width="196" height="34" rx="4" fill={p.deep} />
      <rect x="226" y="72" width="86" height="34" rx="4" fill={p.blue} />
      <rect x="318" y="72" width="58" height="34" rx="4" fill={p.soft} />
      {/* 待扣除 */}
      <rect x="24" y="122" width="118" height="26" rx="4" fill={p.amberSoft} />
      <rect x="150" y="122" width="74" height="26" rx="4" fill={p.amber} />
      <rect x="232" y="122" width="144" height="26" rx="4" fill="none" stroke={p.soft} strokeWidth="1" strokeDasharray="3 3" />
      <text x="24" y="176" fontSize="10" fill="#8a9bb0" fontFamily="system-ui">总包 → 拆成部分 → 扣掉社保个税 → 到手</text>
    </Frame>
  )
}

/** ch09 加班：工时条，超过 36 小时的部分标红 */
function Overtime({ p, className }: { p: Palette; className?: string }) {
  const rows = [8, 9, 11, 12, 14, 13]
  const w = 44
  return (
    <Frame className={className}>
      <rect width="400" height="200" fill={p.bg} />
      {/* 36 小时法定线 */}
      <line x1="24" y1="24" x2="376" y2="24" stroke={p.amber} strokeWidth="1" strokeDasharray="4 3" />
      <text x="376" y="18" fontSize="9" fill={p.amber} textAnchor="end" fontFamily="system-ui">36h 月上限</text>
      {rows.map((h, i) => {
        const x = 30 + i * 60
        const bh = (h / 16) * 130
        const over = h > 12
        return (
          <rect
            key={i}
            x={x}
            y={168 - bh}
            width={w}
            height={bh}
            rx="3"
            fill={over ? p.amber : p.blue}
            opacity={over ? 0.9 : 0.75}
          />
        )
      })}
      <text x="24" y="188" fontSize="10" fill="#8a9bb0" fontFamily="system-ui">每周实际工时</text>
    </Frame>
  )
}

/** ch16 合同：条款分层，越往下越硬 */
function ContractLayers({ p, className }: { p: Palette; className?: string }) {
  return (
    <Frame className={className}>
      <rect width="400" height="200" fill={p.bg} />
      {[
        { w: 300, y: 30, c: p.soft, o: 0.5 },
        { w: 268, y: 62, c: p.soft, o: 0.7 },
        { w: 232, y: 94, c: p.blue, o: 0.85 },
        { w: 178, y: 126, c: p.deep, o: 1 },
      ].map((l, i) => (
        <rect key={i} x="24" y={l.y} width={l.w} height="24" rx="3" fill={l.c} opacity={l.o} />
      ))}
      <text x="24" y="176" fontSize="10" fill="#8a9bb0" fontFamily="system-ui">法律 → 司法解释 → 行政指引 → 地方规定</text>
    </Frame>
  )
}

const MAP: Record<string, (a: { p: Palette; className?: string }) => JSX.Element> = {
  ch03: OfferSplit,
  ch09: Overtime,
  ch16: ContractLayers,
}

/** 按章节 ID 取图；未定义的章节给一个通用图形。配色跟随章节所属部分 */
export function ChapterArt({ chapterId, className }: Props) {
  const p = PALETTES[partOf(chapterId)] ?? BLUE
  const Cmp = MAP[chapterId] ?? ContractLayers
  return <Cmp p={p} className={className} />
}
