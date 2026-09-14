import { LearningPathOverview } from '../components/learning/LearningPathOverview'
import { PageContainer, SectionTitle, type Navigate } from '../components/site/SiteLayout'
import { GlossaryText } from '../components/ui/GlossaryText'
import { LEARNING_CATEGORIES, LEARNING_TOPICS } from '../data/learningTopics'
import { NEXT_TOPIC_GROUPS, TOPIC_GROUPS } from '../data/siteContent'
import type { LearningCategory, LearningTopic, VisualizationType } from '../types/learning'

const VISUALIZATION_LABELS: Record<VisualizationType, string> = {
  'interactive-2d': '操作する2D図解',
  'step-animation': '止めて読むステップ図解',
  '3d': '3D探索',
  'hybrid-3d': '3Dとステップ図解',
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

function CategoryLessonGrid({ category, topics, onNavigate }: { category: LearningCategory; topics: LearningTopic[]; onNavigate: Navigate }) {
  if (topics.length === 0) return null

  return <section aria-labelledby={`category-${category.id}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 id={`category-${category.id}`} className="text-xl font-bold text-slate-900">{category.title}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{category.description}</p>
      </div>
      <StatusBadge status={category.status} />
    </div>
    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {topics.map(topic => <article key={topic.id} className="panel flex flex-col p-6">
        <p className="eyebrow">{VISUALIZATION_LABELS[topic.visualization]}</p>
        <h4 className="mt-3 text-lg font-bold text-slate-900">{topic.shortTitle}</h4>
        <p className="mt-3 flex-1 text-sm leading-7 text-slate-600"><GlossaryText text={topic.summary} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} /></p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => onNavigate(`/learn/${topic.id}`)} className="rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-bold text-cyan-800 transition hover:border-cyan-500 hover:bg-cyan-100">教材を開く →</button>
        </div>
      </article>)}
    </div>
  </section>
}

export function LearningCatalogPage({ onNavigate }: { onNavigate: Navigate }) {
  const availableTopics = (categoryId: LearningCategory['id']) => LEARNING_TOPICS.filter(topic => topic.category === categoryId && topic.status === 'available')
  const networkCategory = LEARNING_CATEGORIES.find(category => category.id === 'network')
  const expansionCategories = LEARNING_CATEGORIES.filter(category => category.id !== 'network')

  return <PageContainer>
    <SectionTitle
      eyebrow="学習の入口"
      title="3Dで全体像をつかんでから、仕組みを深掘りする"
      lead="最初にウェブサイトへつながる流れを3Dで体験し、その後に通信の仕組みを順にたどります。PC、OS、データベースなどの教材は、通信の土台をつかんでから広げられます。"
      onOpenTerm={termId => onNavigate(`/glossary/${termId}`)}
    />

    <section className="mt-10 rounded-3xl border border-cyan-200 bg-cyan-50/60 p-5 sm:p-7" aria-labelledby="simulation-entry">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-3xl">
          <p className="eyebrow">ステップ1: 全体像を見る</p>
          <h2 id="simulation-entry" className="mt-2 text-2xl font-bold tracking-tight text-slate-900">まずは3Dシミュレーションで、ウェブサイトへつながる流れを見る</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">PCからウェブサーバーまでのアクセスを入口に、ネットワーク全体、機器の内部、データ構造へ段階的に入れます。気になるものは、シミュレーション中でも自由に選んで確認できます。</p>
        </div>
        <button type="button" onClick={() => onNavigate('/visualizer')} className="shrink-0 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-800">3Dシミュレーションを始める →</button>
      </div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {TOPIC_GROUPS.map(group => <section key={group.title} className="rounded-2xl border border-white/90 bg-white/85 p-5">
          <p className="eyebrow">シミュレーションで見る内容</p>
          <h3 className="mt-2 text-lg font-bold text-slate-900">{group.title}</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {group.items.map(item => <li key={item} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700"><GlossaryText text={item} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} /></li>)}
          </ul>
        </section>)}
      </div>
    </section>

    <LearningPathOverview onNavigate={onNavigate} />

    {networkCategory && <section className="mt-16 border-t border-slate-200 pt-12" aria-labelledby="network-lessons">
      <div className="mb-8">
        <p className="eyebrow">ステップ2: 通信を深掘りする</p>
        <h2 id="network-lessons" className="mt-2 text-2xl font-bold tracking-tight text-slate-900">3Dで見たウェブアクセスを、通信の順に確かめる</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">設定を受け取るところから、次の相手の確認、経路選択、名前解決、接続までをたどります。最初からすべてを覚えるのではなく、3Dシミュレーションで気になった項目へ戻りながら進められます。</p>
      </div>
      <CategoryLessonGrid category={networkCategory} topics={availableTopics(networkCategory.id)} onNavigate={onNavigate} />
    </section>}

    <section className="mt-16 border-t border-slate-200 pt-12" aria-labelledby="expansion-lessons">
      <div className="mb-8">
        <p className="eyebrow">ステップ3: 他のIT分野へ広げる</p>
        <h2 id="expansion-lessons" className="mt-2 text-2xl font-bold tracking-tight text-slate-900">通信を支えるPC・OS・サービスの仕組みを学ぶ</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">ウェブアクセスで見た処理は、CPU、OS、データベース、セキュリティ、システム構成、アルゴリズムなどの仕組みに支えられています。興味のある分野から、止めて操作しながら広げてください。</p>
      </div>
      <div className="space-y-12">
        {expansionCategories.map(category => <CategoryLessonGrid key={category.id} category={category} topics={availableTopics(category.id)} onNavigate={onNavigate} />)}
      </div>
    </section>

    <section className="mt-16 border-t border-slate-200 pt-12">
      <p className="eyebrow">今後深めるテーマ</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">次に追加する候補</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">すべてを一度に追加せず、動かして理解できる完成教材を少しずつ増やします。</p>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {NEXT_TOPIC_GROUPS.map(topic => <article key={topic.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="font-bold text-slate-900"><GlossaryText text={topic.title} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} /></h3>
          <p className="mt-2 text-sm leading-7 text-slate-600"><GlossaryText text={topic.body} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} /></p>
        </article>)}
      </div>
    </section>
  </PageContainer>
}

export default LearningCatalogPage
