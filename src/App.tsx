import { useEffect, useState } from 'react'
import { Home } from './pages/Home'
import { Explore } from './pages/Explore'
import { ChapterPage } from './pages/ChapterPage'
import { EntryPage } from './pages/EntryPage'
import { Calculator } from './pages/Calculator'
import { Daily } from './pages/Daily'
import { AntiPage } from './pages/AntiPage'
import { DownloadPage } from './pages/DownloadPage'
import { PrintPage } from './pages/PrintPage'
import { WechatLoginPage } from './pages/WechatLoginPage'
import { SiteFooter } from './components/SiteFooter'
import { StaticPage } from './pages/StaticPage'

type Route =
  | { name: 'home' }
  | { name: 'explore' }
  | { name: 'chapter'; id: string }
  | { name: 'entry'; id: string }
  | { name: 'calc' }
  | { name: 'daily' }
  | { name: 'anti' }
  | { name: 'download' }
  | { name: 'wechat-login'; code: string }
  | { name: 'print'; mode: 'full' | 'simple' }
  | { name: 'static'; id: string }

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '')
  if (!h) return { name: 'home' }
  const [head, arg] = h.split('/')
  if (head === 'explore') return { name: 'explore' }
  if (head === 'calc') return { name: 'calc' }
  if (head === 'daily') return { name: 'daily' }
  if (head === 'anti') return { name: 'anti' }
  if (head === 'download') return { name: 'download' }
  if (head.startsWith('wechat-login')) {
    const m = h.match(/[?&]code=(\d{6})/)
    return { name: 'wechat-login', code: m ? m[1] : '' }
  }
  if (head === 'print') return { name: 'print', mode: arg === 'simple' ? 'simple' : 'full' }
  if (head === 'chapter' && arg) return { name: 'chapter', id: arg }
  if (head === 'entry' && arg) return { name: 'entry', id: arg }
  if (['about', 'contact', 'privacy', 'terms', 'changelog'].includes(head))
    return { name: 'static', id: head }
  return { name: 'home' }
}

function Nav({ route }: { route: Route }) {
  const isHome = route.name === 'home'
  const isExplore = route.name === 'explore' || route.name === 'chapter' || route.name === 'entry'
  const isCalc = route.name === 'calc'
  const isDaily = route.name === 'daily'
  const isAnti = route.name === 'anti'
  const isDownload = route.name === 'download'
  return (
    <nav className="nav">
      <a href="#/" className={isHome ? 'on' : ''}>
        首页
      </a>
      <a href="#/explore" className={isExplore ? 'on' : ''}>
        检索
      </a>
      <a href="#/daily" className={isDaily ? 'on' : ''}>
        每日一问
      </a>
      <a href="#/calc" className={isCalc ? 'on' : ''}>
        测算
      </a>
      <a href="#/anti" className={isAnti ? 'on' : ''}>
        反面清单
      </a>
      <a href="#/download" className={isDownload ? 'on' : ''}>
        下载
      </a>
      <UserChip routeKey={route.name + ('id' in route ? route.id : '')} />
    </nav>
  )
}

/** 登录用户昵称（服务端 KV 存取）。未登录不显示；点击可改昵称。 */
function UserChip({ routeKey }: { routeKey: string }) {
  const [name, setName] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    let t: string | null = null
    try {
      t = localStorage.getItem('wg_token')
    } catch {
      t = null
    }
    setToken(t)
    if (!t) return
    fetch(`/api/user?token=${encodeURIComponent(t)}`)
      .then((r) => r.json())
      .then((j: { ok: boolean; name?: string | null }) => {
        if (j.ok && j.name) setName(j.name)
      })
      .catch(() => {})
  }, [routeKey])

  if (!token) return null

  async function editName() {
    if (!token) return
    const input = window.prompt('设置你的昵称（20 字以内，登录设备间同步）', name || '')
    if (input === null) return
    const next = input.trim()
    if (!next || [...next].length > 20) return
    try {
      const r = await fetch('/api/user', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, name: next }),
      })
      const j = (await r.json()) as { ok: boolean; name?: string }
      if (j.ok && j.name) {
        setName(j.name)
        return
      }
    } catch {
      /* fallthrough */
    }
    window.alert('昵称保存失败：登录服务暂不可用（本页需通过正式域名访问）')
  }

  return (
    <button className="nav-user" onClick={editName} title="点击修改昵称">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8.2" r="3.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4.8 19.4c1.2-3.2 3.9-4.8 7.2-4.8s6 1.6 7.2 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {name || '设置昵称'}
    </button>
  )
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash)

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <>
      <header className="site-head">
        <div className="wrap inner">
          <a className="brand" href="#/">
            高性价比打工指南
            <em>算账，不打鸡血</em>
          </a>
          <Nav route={route} />
        </div>
      </header>

      <main>
        {route.name === 'home' && <Home />}
        {route.name === 'explore' && <Explore />}
        {route.name === 'chapter' && <ChapterPage id={route.id} />}
        {route.name === 'entry' && <EntryPage id={route.id} />}
        {route.name === 'calc' && <Calculator />}
        {route.name === 'daily' && <Daily />}
        {route.name === 'anti' && <AntiPage />}
        {route.name === 'download' && <DownloadPage />}
        {route.name === 'wechat-login' && <WechatLoginPage code={route.code} />}
        {route.name === 'print' && <PrintPage mode={route.mode} />}
        {route.name === 'static' && <StaticPage id={route.id} />}
      </main>

      <SiteFooter />
    </>
  )
}