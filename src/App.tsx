import { useEffect, useState } from 'react'
import { Home } from './pages/Home'
import { Explore } from './pages/Explore'
import { ChapterPage } from './pages/ChapterPage'
import { EntryPage } from './pages/EntryPage'
import { Calculator } from './pages/Calculator'
import { Daily } from './pages/Daily'
import { AntiPage } from './pages/AntiPage'
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
  | { name: 'static'; id: string }

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '')
  if (!h) return { name: 'home' }
  const [head, arg] = h.split('/')
  if (head === 'explore') return { name: 'explore' }
  if (head === 'calc') return { name: 'calc' }
  if (head === 'daily') return { name: 'daily' }
  if (head === 'anti') return { name: 'anti' }
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
    </nav>
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
        {route.name === 'static' && <StaticPage id={route.id} />}
      </main>

      <SiteFooter />
    </>
  )
}