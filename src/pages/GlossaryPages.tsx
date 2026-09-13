import { GLOSSARY_CATEGORIES, GLOSSARY_TERMS, glossaryCategoryTrail } from '../data/glossary'
import { LEARNING_TOPICS } from '../data/learningTopics'
import type { GlossaryCategory, GlossaryCategoryId, GlossaryTerm } from '../types/glossary'
import { PageContainer, SectionTitle, type Navigate } from '../components/site/SiteLayout'
import { GlossaryText } from '../components/ui/GlossaryText'
import { useState } from 'react'

function TermButton({ term, onNavigate }: { term: GlossaryTerm; onNavigate: Navigate }) {
  return <button type="button" onClick={() => onNavigate(`/glossary/${term.id}`)} className="group flex w-full items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50/40">
    <span><span className="block font-bold text-slate-900">{term.term}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{term.expansion ?? '一般名称'}</span></span>
    <span className="pt-1 text-sm font-semibold text-cyan-700 transition group-hover:translate-x-0.5">→</span>
  </button>
}

const termsForCategory = (categoryId: GlossaryCategoryId) => GLOSSARY_TERMS
  .filter(term => term.category === categoryId)
  .sort((a, b) => a.term.localeCompare(b.term, 'en'))

const childCategories = (categoryId: GlossaryCategoryId) => GLOSSARY_CATEGORIES.filter(category => category.parent === categoryId)

function branchTermCount(categoryId: GlossaryCategoryId): number {
  return termsForCategory(categoryId).length + childCategories(categoryId).reduce((count, child) => count + branchTermCount(child.id), 0)
}

function TermGroup({ category, onNavigate }: { category: GlossaryCategory; onNavigate: Navigate }) {
  const terms = termsForCategory(category.id)
  if (terms.length === 0) return null
  return <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
    <div className="flex flex-wrap items-baseline justify-between gap-2"><div><h3 className="font-bold text-slate-900">{category.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{category.description}</p></div><span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">{terms.length} 用語</span></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{terms.map(term => <TermButton key={term.id} term={term} onNavigate={onNavigate} />)}</div>
  </section>
}

export function GlossaryIndexPage({ onNavigate }: { onNavigate: Navigate }) {
  const roots = GLOSSARY_CATEGORIES.filter(category => !category.parent)
  const [activeRootId, setActiveRootId] = useState<GlossaryCategoryId>('web')
  const [query, setQuery] = useState('')
  const activeRoot = GLOSSARY_CATEGORIES.find(category => category.id === activeRootId) ?? roots[0]
  const children = childCategories(activeRoot.id)
  const normalizedQuery = query.trim().toLocaleLowerCase('ja-JP')
  const searchResults = normalizedQuery
    ? GLOSSARY_TERMS.filter(term => [term.term, term.expansion ?? '', term.summary, term.why].join(' ').toLocaleLowerCase('ja-JP').includes(normalizedQuery))
    : []
  return <PageContainer>
    <SectionTitle title="用語集" lead="シミュレーションや図解教材に登場する用語を、通信の階層や役割から探せます。正式名称・役割・関連する仕組みも確認できます。" />
    <section className="mt-8 max-w-2xl"><label htmlFor="glossary-search" className="text-sm font-bold text-slate-800">用語を検索</label><div className="relative mt-2"><input id="glossary-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="例：TCP、光ファイバ、ルーター" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" />{query && <button type="button" aria-label="検索をクリア" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800">×</button>}</div><p className="mt-2 text-xs leading-5 text-slate-500">日本語・略語・正式名称・説明文から検索できます。</p></section>
    {normalizedQuery ? <section className="mt-8"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="eyebrow">SEARCH RESULTS</p><h2 className="mt-1 text-xl font-bold text-slate-900">「{query.trim()}」の検索結果</h2></div><span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">{searchResults.length} 件</span></div>{searchResults.length > 0 ? <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{searchResults.map(term => <TermButton key={term.id} term={term} onNavigate={onNavigate} />)}</div> : <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">一致する用語が見つかりません。略語、英語表記、またはより短い言葉で試してください。</div>}</section> : <>
    <section className="mt-10">
      <p className="eyebrow">まずジャンルを選ぶ</p>
      <div className="mt-3 grid gap-3 md:grid-cols-3">{roots.map(category => <button key={category.id} type="button" aria-pressed={activeRootId === category.id} onClick={() => setActiveRootId(category.id)} className={`rounded-2xl border p-5 text-left transition ${activeRootId === category.id ? 'border-cyan-500 bg-cyan-50 shadow-sm' : 'border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/40'}`}><span className="text-sm font-bold text-slate-900">{category.title}</span><span className="mt-2 block text-sm leading-6 text-slate-600">{category.description}</span><span className="mt-4 inline-block text-xs font-semibold text-cyan-700">{branchTermCount(category.id)} 用語を見る →</span></button>)}</div>
    </section>
    <section className="mt-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500"><span>用語集</span><span>›</span><span className="font-semibold text-slate-800">{activeRoot.title}</span></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold text-slate-900">{activeRoot.title}から探す</h2><p className="mt-2 text-sm leading-6 text-slate-600">{children.length > 0 ? '下位の分類から目的の用語を選べます。' : 'この分類に含まれる用語を選べます。'}</p></div>
      <TermGroup category={activeRoot} onNavigate={onNavigate} />
      {children.map(category => <TermGroup key={category.id} category={category} onNavigate={onNavigate} />)}
    </section>
    </>}
  </PageContainer>
}

export function GlossaryDetailPage({ term, onNavigate }: { term: GlossaryTerm; onNavigate: Navigate }) {
  const [showDetails, setShowDetails] = useState(false)
  const relatedTerms = (term.related ?? []).map(name => GLOSSARY_TERMS.find(candidate => candidate.term === name)).filter((item): item is GlossaryTerm => Boolean(item))
  const relatedLessons = LEARNING_TOPICS.filter(topic => topic.status === 'available' && topic.glossaryTerms.includes(term.id))
  const categoryTrail = glossaryCategoryTrail(term.category)
  return <PageContainer>
    <button type="button" onClick={() => onNavigate('/glossary')} className="mb-8 text-sm font-semibold text-cyan-700 transition hover:text-cyan-900">← 用語集に戻る</button>
    <nav aria-label="用語の分類" className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500"><button type="button" onClick={() => onNavigate('/glossary')} className="hover:text-cyan-700">用語集</button>{categoryTrail.map(category => <span key={category.id} className="flex items-center gap-2"><span>›</span><span className="font-semibold text-slate-700">{category.title}</span></span>)}</nav>
    <SectionTitle eyebrow="GLOSSARY" title={term.term} lead={term.expansion ? `正式名称：${term.expansion}` : '一般名称（略語ではありません）'} />
    <section className="mt-10 max-w-3xl space-y-5">
      <article className="panel p-6"><h2 className="text-lg font-bold text-slate-900">これは何？</h2><p className="mt-3 text-sm leading-7 text-slate-700"><GlossaryText text={term.summary} onOpenTerm={(termId) => onNavigate(`/glossary/${termId}`)} /></p></article>
      <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="text-lg font-bold text-amber-950">なぜ必要？</h2><p className="mt-3 text-sm leading-7 text-amber-950/80"><GlossaryText text={term.why} onOpenTerm={(termId) => onNavigate(`/glossary/${termId}`)} /></p></article>
      {(term.deepDive?.length ?? 0) > 0 && <section className="panel overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-4 p-6"><div><h2 className="text-lg font-bold text-slate-900">さらに詳しく</h2><p className="mt-1 text-sm text-slate-600">仕組み・内部の流れ・実際の扱いを、もう一段深く確認できます。</p></div><button type="button" aria-expanded={showDetails} onClick={() => setShowDetails(value => !value)} className="rounded-lg border border-cyan-600 bg-cyan-50 px-4 py-2.5 text-sm font-bold text-cyan-700 transition hover:bg-cyan-100">{showDetails ? '詳細を閉じる' : 'もっと詳しく読む'}</button></div>{showDetails && <div className="border-t border-slate-200 bg-slate-50 p-6"><div className="space-y-5">{term.deepDive?.map(section => <article key={section.title} className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-bold text-slate-900">{section.title}</h3><p className="mt-2 text-sm leading-7 text-slate-700"><GlossaryText text={section.body} onOpenTerm={(termId) => onNavigate(`/glossary/${termId}`)} /></p></article>)}</div></div>}</section>}
      <article className="panel p-6"><h2 className="text-lg font-bold text-slate-900">教材との関係</h2><p className="mt-3 text-sm leading-7 text-slate-600"><GlossaryText text="この用語は、URLアクセスの流れ、機器・データ構造の探索、個別の図解教材で、他の仕組みと組み合わせて登場します。通信の全体像や学習テーマに戻り、関連する場面を確認してみましょう。" onOpenTerm={(termId) => onNavigate(`/glossary/${termId}`)} /></p>{relatedLessons.length > 0 && <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4"><p className="text-sm font-bold text-slate-900">この用語を動かして学ぶ</p><div className="mt-3 flex flex-wrap gap-2">{relatedLessons.map(lesson => <button key={lesson.id} type="button" onClick={() => onNavigate(`/learn/${lesson.id}`)} className="rounded-lg border border-cyan-300 bg-white px-3 py-2 text-sm font-semibold text-cyan-800 transition hover:border-cyan-500 hover:bg-cyan-50">{lesson.shortTitle} →</button>)}</div></div>}<div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => onNavigate('/visualizer')} className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700">シミュレーションを開く</button><button type="button" onClick={() => onNavigate('/topics')} className="rounded-lg border border-cyan-300 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100">学習を探す</button></div></article>
      {relatedTerms.length > 0 && <section className="panel p-6"><h2 className="text-lg font-bold text-slate-900">関連する用語</h2><div className="mt-4 flex flex-wrap gap-2">{relatedTerms.map(related => <button key={related.id} type="button" onClick={() => onNavigate(`/glossary/${related.id}`)} className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm font-semibold text-cyan-800 transition hover:border-cyan-400 hover:bg-cyan-100">{related.term}</button>)}</div></section>}
    </section>
  </PageContainer>
}
