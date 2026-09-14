import { lazy, Suspense, useEffect, useState } from 'react'
import { SiteFooter, SiteHeader } from './components/site/SiteLayout'
import { AboutPage, GuidePage, HomePage, NotesPage, PAGE_META, PrivacyPage } from './pages/StaticPages'
import { GlossaryDetailPage, GlossaryIndexPage } from './pages/GlossaryPages'
import { GLOSSARY_TERMS } from './data/glossary'
import { NotFoundPage, TermsPage } from './pages/PublicPages'
import { learningTopicFromPath } from './data/learningTopics'
import { LearningCatalogPage } from './pages/LearningCatalogPage'

// New learning topics are loaded only when the user opens them. The existing
// visualizer keeps its established state and remains independent from this route.
const LearningTopicPage = lazy(() => import('./pages/LearningTopicPage'))
let visualizerPagePromise: Promise<typeof import('./pages/VisualizerPage')> | undefined
const loadVisualizerPage = () => visualizerPagePromise ??= import('./pages/VisualizerPage')
const VisualizerPage = lazy(loadVisualizerPage)

// A direct visit to /visualizer is the main learning entry point. Start the
// route chunk before React reaches its Suspense boundary, without loading the
// Three.js scene for ordinary site pages.
if (window.location.pathname.replace(/\/+$/, '') === '/visualizer') void loadVisualizerPage()

type StaticSitePath = keyof typeof PAGE_META

function normalizedPath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/'
}

function glossaryIdFromPath(path: string) {
  if (!path.startsWith('/glossary/')) return null
  try {
    return decodeURIComponent(path.slice('/glossary/'.length))
  } catch {
    return null
  }
}

function VisualizerLoadingFallback({ onNavigate }: { onNavigate: (path: string) => void }) {
  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <SiteHeader path="/visualizer" onNavigate={onNavigate} />
    <div className="mx-auto max-w-[1600px] px-5 pb-6 pt-5 lg:px-8">
      <p className="eyebrow">3D ネットワークシミュレーション</p>
      <h1 className="mt-1 text-base font-bold tracking-tight text-slate-900 sm:text-lg">URLアクセス：見えないインフラをたどる</h1>
      <section aria-busy="true" aria-live="polite" className="mt-4 grid h-[520px] place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:h-[650px]">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700">3D</div>
          <p className="mt-4 text-sm font-bold text-slate-800">3Dモデルを読み込んでいます</p>
          <p className="mt-1 text-xs text-slate-500">PCからWebサーバーまでのネットワークを準備中です。</p>
        </div>
      </section>
    </div>
  </main>
}

export default function App() {
  const [path, setPath] = useState(() => normalizedPath(window.location.pathname))

  useEffect(() => {
    const handlePopState = () => setPath(normalizedPath(window.location.pathname))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const glossaryId = glossaryIdFromPath(path)
    const glossaryTerm = glossaryId ? GLOSSARY_TERMS.find(term => term.id === glossaryId) : null
    const learningTopic = learningTopicFromPath(path)
    const [title, description] = learningTopic
      ? [`${learningTopic.shortTitle} | 学びを深める | ITインフラ・シミュレーター`, learningTopic.summary]
      : glossaryTerm
      ? [`${glossaryTerm.term} | 用語集 | ITインフラ・シミュレーター`, glossaryTerm.summary]
      : PAGE_META[path as StaticSitePath] ?? PAGE_META['/404']
    document.title = title
    let descriptionElement = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!descriptionElement) {
      descriptionElement = document.createElement('meta')
      descriptionElement.name = 'description'
      document.head.appendChild(descriptionElement)
    }
    descriptionElement.content = description
  }, [path])

  const navigate = (nextPath: string) => {
    const next = normalizedPath(nextPath)
    if (next === path) return
    window.history.pushState({}, '', next)
    setPath(next)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  if (path === '/visualizer') return <Suspense fallback={<VisualizerLoadingFallback onNavigate={navigate} />}><VisualizerPage onNavigate={navigate} /></Suspense>

  const glossaryId = glossaryIdFromPath(path)
  const glossaryTerm = glossaryId ? GLOSSARY_TERMS.find(term => term.id === glossaryId) : null
  const learningTopic = learningTopicFromPath(path)
  const page = learningTopic ? <Suspense fallback={<main className="mx-auto max-w-6xl px-5 py-20 text-sm text-slate-600 lg:px-8">教材を準備しています…</main>}><LearningTopicPage topic={learningTopic} onNavigate={navigate} /></Suspense>
    : path === '/glossary' ? <GlossaryIndexPage onNavigate={navigate} />
    : glossaryTerm ? <GlossaryDetailPage key={glossaryTerm.id} term={glossaryTerm} onNavigate={navigate} />
    : path === '/about' ? <AboutPage onNavigate={navigate} />
    : path === '/guide' ? <GuidePage onNavigate={navigate} />
      : path === '/topics' ? <LearningCatalogPage onNavigate={navigate} />
        : path === '/notes' ? <NotesPage onNavigate={navigate} />
          : path === '/privacy' ? <PrivacyPage onNavigate={navigate} />
          : path === '/terms' ? <TermsPage onNavigate={navigate} />
            : path === '/' ? <HomePage onNavigate={navigate} />
              : <NotFoundPage onNavigate={navigate} />

  return <div className="min-h-screen bg-slate-50 text-slate-900"><SiteHeader path={path} onNavigate={navigate} />{page}<SiteFooter onNavigate={navigate} /></div>
}
