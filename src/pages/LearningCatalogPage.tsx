import { LearningPathOverview } from '../components/learning/LearningPathOverview'
import { PageContainer, SectionTitle, type Navigate } from '../components/site/SiteLayout'
import { GlossaryText } from '../components/ui/GlossaryText'
import { LEARNING_CATEGORIES, LEARNING_TOPICS } from '../data/learningTopics'
import { NEXT_TOPIC_GROUPS, TOPIC_GROUPS } from '../data/siteContent'
import type { VisualizationType } from '../types/learning'

const VISUALIZATION_LABELS: Record<VisualizationType, string> = {
  'interactive-2d': '操作する2D図解',
  'step-animation': '止めて読むステップ図解',
  '3d': '3D探索',
  'hybrid-3d': '3D + ステップ図解',
  'text-diagram': '図と文章',
}

function StatusBadge({ status }: { status: 'available' | 'partial' | 'planned' }) {
  const label = status === 'available' ? '公開中' : status === 'partial' ? '一部公開' : '準備中'
  const tone = status === 'available'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : status === 'partial'
      ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
      : 'border-slate-200 bg-white text-slate-500'
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${tone}`}>{label}</span>
}

export function LearningCatalogPage({ onNavigate }: { onNavigate: Navigate }) {
  const topicsByCategory = new Map(LEARNING_CATEGORIES.map(category => [category.id, LEARNING_TOPICS.filter(topic => topic.category === category.id && topic.status === 'available')]))

  return <PageContainer>
    <SectionTitle
      eyebrow="LEARNING CATALOG"
      title="学習を探す"
      lead="気になる仕組みから自由に入ることも、つながりのある順番で進むこともできます。各教材では、途中で止めて「いま何をしているか」を確かめられます。"
      onOpenTerm={termId => onNavigate(`/glossary/${termId}`)}
    />

    <LearningPathOverview onNavigate={onNavigate} />

    <section className="mt-16 border-t border-slate-200 pt-12" aria-labelledby="available-topics">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">INTERACTIVE LESSONS</p><h2 id="available-topics" className="mt-2 text-2xl font-bold tracking-tight text-slate-900">いま操作できる教材</h2></div><button type="button" onClick={() => onNavigate('/visualizer')} className="rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-2.5 text-sm font-bold text-cyan-800 transition hover:border-cyan-500 hover:bg-cyan-100">3Dシミュレーションを開く →</button></div>
      <div className="mt-8 space-y-12">
        {LEARNING_CATEGORIES.map(category => {
          const topics = topicsByCategory.get(category.id) ?? []
          if (topics.length === 0) return null
          return <section key={category.id} aria-labelledby={`category-${category.id}`}>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 id={`category-${category.id}`} className="text-xl font-bold text-slate-900">{category.title}</h3><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{category.description}</p></div><StatusBadge status={category.status} /></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {topics.map(topic => <article key={topic.id} className="panel flex flex-col p-6"><p className="eyebrow">{VISUALIZATION_LABELS[topic.visualization]}</p><h4 className="mt-3 text-lg font-bold text-slate-900">{topic.shortTitle}</h4><p className="mt-3 flex-1 text-sm leading-7 text-slate-600"><GlossaryText text={topic.summary} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} /></p><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => onNavigate(`/learn/${topic.id}`)} className="rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-bold text-cyan-800 transition hover:border-cyan-500 hover:bg-cyan-100">教材を開く →</button></div></article>)}
            </div>
          </section>
        })}
      </div>
    </section>

    <section className="mt-16 border-t border-slate-200 pt-12"><p className="eyebrow">EXISTING 3D EXPLORATION</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">3Dシミュレーションで探索できる内容</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">PCからWeb Serverまでのアクセスを入口に、ネットワーク全体、機器の内部、データ構造へ段階的に入れます。</p><div className="mt-7 grid gap-4 sm:grid-cols-2">{TOPIC_GROUPS.map(group => <section key={group.title} className="panel p-6"><p className="eyebrow">SIMULATION</p><h3 className="mt-2 text-lg font-bold text-slate-900">{group.title}</h3><ul className="mt-4 flex flex-wrap gap-2">{group.items.map(item => <li key={item} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"><GlossaryText text={item} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} /></li>)}</ul></section>)}</div></section>

    <section className="mt-16 border-t border-slate-200 pt-12"><p className="eyebrow">NEXT CONNECTIONS</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">次に深める候補</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">すべてを一度に追加せず、動かして理解できる完成教材を少しずつ増やします。</p><div className="mt-7 grid gap-4 md:grid-cols-3">{NEXT_TOPIC_GROUPS.map(topic => <article key={topic.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-bold text-slate-900"><GlossaryText text={topic.title} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} /></h3><p className="mt-2 text-sm leading-7 text-slate-600"><GlossaryText text={topic.body} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} /></p></article>)}</div></section>
  </PageContainer>
}

export default LearningCatalogPage
