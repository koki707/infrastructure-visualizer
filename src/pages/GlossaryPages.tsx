import { GLOSSARY_CATEGORIES, GLOSSARY_TERMS, glossaryCategoryTrail } from '../data/glossary'
import { LEARNING_TOPICS } from '../data/learningTopics'
import type { GlossaryCategory, GlossaryCategoryId, GlossaryTerm } from '../types/glossary'
import { PageContainer, SectionTitle, type Navigate } from '../components/site/SiteLayout'
import { GlossaryText } from '../components/ui/GlossaryText'
import { useState } from 'react'

/**
 * The glossary data can gradually add beginner-oriented copy without making it
 * mandatory for every existing term. Keep this view tolerant while content is
 * expanded a term at a time.
 */
type BeginnerGlossarySupport = {
  beginnerSummary?: string
  firstLook?: string
  oneLine?: string
  familiarExample?: string
  analogy?: string
  simulationContext?: string
  appearsInSimulation?: string
  learningOrder?: string[]
  learningSteps?: string[]
  prerequisites?: string[]
  nextTerms?: string[]
}

const beginnerSupportFor = (term: GlossaryTerm) => term as GlossaryTerm & BeginnerGlossarySupport

const familiarExamples: Record<GlossaryCategoryId, string> = {
  computer: 'コンピュータの中には、計算を進める場所・一時的に覚える場所・長く保存する場所があります。この用語は、その役割分担を理解するための手がかりです。',
  os: 'OSは、複数のアプリが1台のコンピュータを安全に使えるよう調整する、交通整理役のような存在です。この用語はその調整の一部を表します。',
  database: 'データベースは、たくさんの記録を「必要なときに探せて、途中で壊れにくい」形で管理する台帳のようなものです。',
  system: 'ウェブサービスは1台の機器だけで動くとは限りません。役割を分け、障害に備えるための仕組みとしてこの用語が登場します。',
  algorithms: 'アルゴリズムは、目的地までの道順のようなものです。同じ目的でも、選ぶ手順によって必要な時間や覚えておく量が変わります。',
  web: 'ブラウザでウェブページを開くときは、名前を調べ、接続し、要求と応答をやり取りします。この用語はその流れの一部です。',
  network: 'ネットワークは、離れた機器どうしへ情報を届けるための仕組みです。この用語は、データをどこへ・どう運ぶかに関係します。',
  transport: '同じコンピュータ内には複数のアプリがあります。届け方や到着確認を整えることで、必要なアプリへデータを渡しやすくします。',
  'ip-routing': '住所を見て配送先を選ぶように、ネットワークでも宛先の情報を使って次の中継先を選びます。',
  link: '近くにある機器どうしでデータを渡す区間では、まず「次にどの機器へ渡すか」を決める必要があります。',
  access: '家庭や学校のネットワークは、回線事業者や接続事業者を通じて、より広いネットワークへつながっています。',
  security: '鍵をかけるだけでなく、「相手は本物か」「途中で書き換えられていないか」も確かめることで、通信やデータを守ります。',
}

const simulationContexts: Record<GlossaryCategoryId, string> = {
  computer: '3Dシミュレーションでは、PCの内部へ入ると、この用語に関係する部品や処理の役割を確認できます。',
  os: '3Dシミュレーションでは、アプリケーションと機器の間をOSが調整する流れとして、この用語につながります。',
  database: 'ウェブアクセスの全体像を見たあと、ウェブサーバーの先でデータを扱う仕組みとして、この用語を個別教材で深掘りできます。',
  system: 'ウェブアクセスの全体像を見たあと、サービスを止めにくく・混み合いにくくする構成として、この用語を個別教材で深掘りできます。',
  algorithms: '3Dシミュレーションで全体像をつかんだあと、データを扱う手順そのものを個別教材で確かめると理解しやすくなります。',
  web: '3Dシミュレーションでは、URLを選んでからブラウザがウェブサーバーへ到達するまでの流れの中で登場します。',
  network: '3Dシミュレーションでは、PCからスイッチ、ルーターを経てウェブサーバーへ進む途中で登場します。',
  transport: '3Dシミュレーションでは、名前解決のあとに接続を作り、データを確実に届ける流れとして登場します。',
  'ip-routing': '3Dシミュレーションでは、ルーターが宛先を見て次のネットワークへ渡す場面で登場します。',
  link: '3Dシミュレーションでは、PC・スイッチ・ルーターの近い区間で、フレームを渡す場面として登場します。',
  access: '3Dシミュレーションでは、家庭や組織のネットワークからISPを経て外部ネットワークへ出る場面として登場します。',
  security: '3Dシミュレーションでは、ウェブサーバーへ要求を送る前後で、通信を保護する仕組みとして登場します。',
}

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
    ? GLOSSARY_TERMS.filter(term => [term.term, term.expansion ?? '', term.summary, term.why, term.beginnerGuide?.japaneseName ?? '', term.beginnerGuide?.pronunciation ?? '', term.beginnerGuide?.inOneSentence ?? '', term.beginnerGuide?.everydayImage ?? ''].join(' ').toLocaleLowerCase('ja-JP').includes(normalizedQuery))
    : []
  return <PageContainer>
    <SectionTitle title="用語集" lead="シミュレーションや図解教材に登場する用語を、通信の階層や役割から探せます。正式名称・役割・関連する仕組みも確認できます。" />
    <section className="mt-7 max-w-3xl rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5">
      <p className="text-sm font-bold text-cyan-950">初めての方へ：用語は全体像と行き来して読みます</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">まず「シミュレーション」でPCからウェブサーバーまでの流れを見て、分からなかった言葉をここで調べると、用語だけを暗記するより役割をつかみやすくなります。</p>
      <button type="button" onClick={() => onNavigate('/visualizer')} className="mt-4 rounded-lg border border-cyan-300 bg-white px-3.5 py-2 text-sm font-semibold text-cyan-800 transition hover:border-cyan-500 hover:bg-cyan-50">まずシミュレーションを見る →</button>
    </section>
    <section className="mt-8 max-w-2xl"><label htmlFor="glossary-search" className="text-sm font-bold text-slate-800">用語を検索</label><div className="relative mt-2"><input id="glossary-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="例：TCP、光ファイバ、ルーター" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" />{query && <button type="button" aria-label="検索をクリア" onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800">×</button>}</div><p className="mt-2 text-xs leading-5 text-slate-500">日本語・カタカナの読み方・略語・正式名称・説明文から検索できます。</p></section>
    {normalizedQuery ? <section className="mt-8"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="eyebrow">検索結果</p><h2 className="mt-1 text-xl font-bold text-slate-900">「{query.trim()}」の検索結果</h2></div><span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">{searchResults.length} 件</span></div>{searchResults.length > 0 ? <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{searchResults.map(term => <TermButton key={term.id} term={term} onNavigate={onNavigate} />)}</div> : <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">一致する用語が見つかりません。略語、英語表記、またはより短い言葉で試してください。</div>}</section> : <>
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
  const [showReadingOrder, setShowReadingOrder] = useState(false)
  const beginner = beginnerSupportFor(term)
  const relatedTerms = (term.related ?? []).map(name => GLOSSARY_TERMS.find(candidate => candidate.term === name)).filter((item): item is GlossaryTerm => Boolean(item))
  const relatedLessons = LEARNING_TOPICS.filter(topic => topic.status === 'available' && topic.glossaryTerms.includes(term.id))
  const categoryTrail = glossaryCategoryTrail(term.category)
  const guide = term.beginnerGuide
  const firstLook = guide?.inOneSentence ?? beginner.oneLine ?? beginner.firstLook ?? beginner.beginnerSummary ?? term.summary
  const familiarExample = guide?.everydayImage ?? beginner.familiarExample ?? beginner.analogy ?? familiarExamples[term.category]
  const simulationContext = guide?.whenItAppears ?? beginner.simulationContext ?? beginner.appearsInSimulation ?? simulationContexts[term.category]
  const customReadingOrder = beginner.learningOrder ?? beginner.learningSteps
  const relatedNames = relatedTerms.slice(0, 3).map(related => related.term)
  const readingOrder = customReadingOrder && customReadingOrder.length > 0 ? customReadingOrder : [
    '最初に「シミュレーション」で、PCからウェブサーバーまでの大まかな流れを見ます。',
    `次に、この用語が属する「${categoryTrail.map(category => category.title).join(' › ')}」の中で役割を確認します。`,
    relatedNames.length > 0 ? `最後に、関連する「${relatedNames.join('」「')}」も開き、仕組みのつながりを確かめます。` : '最後に、下の教材や関連する用語から、気になった部分を一つずつ確かめます。',
  ]
  return <PageContainer>
    <button type="button" onClick={() => onNavigate('/glossary')} className="mb-8 text-sm font-semibold text-cyan-700 transition hover:text-cyan-900">← 用語集に戻る</button>
    <nav aria-label="用語の分類" className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500"><button type="button" onClick={() => onNavigate('/glossary')} className="hover:text-cyan-700">用語集</button>{categoryTrail.map(category => <span key={category.id} className="flex items-center gap-2"><span>›</span><span className="font-semibold text-slate-700">{category.title}</span></span>)}</nav>
    <SectionTitle eyebrow="用語集" title={guide?.japaneseName ? `${guide.japaneseName}（${term.term}）` : term.term} lead={term.expansion ? `正式名称：${term.expansion}${guide?.pronunciation ? ` ／ 読み方：${guide.pronunciation}` : ''}` : guide?.pronunciation ? `読み方：${guide.pronunciation}` : '一般名称（略語ではありません）'} />
    <section className="mt-10 max-w-3xl space-y-5">
      <article className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-sm"><p className="text-xs font-bold tracking-[0.16em] text-cyan-700">まずひとことで</p><h2 className="mt-2 text-lg font-bold text-slate-900">{term.term} は、何を助ける仕組み？</h2><p className="mt-3 text-sm leading-7 text-slate-700"><GlossaryText text={firstLook} onOpenTerm={(termId) => onNavigate(`/glossary/${termId}`)} /></p></article>
      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-xs font-bold tracking-[0.14em] text-slate-500">身近なイメージ</p><h2 className="mt-2 text-base font-bold text-slate-900">難しい言葉を、まず役割でつかむ</h2><p className="mt-3 text-sm leading-7 text-slate-700"><GlossaryText text={familiarExample} onOpenTerm={(termId) => onNavigate(`/glossary/${termId}`)} /></p></article>
        <article className="rounded-2xl border border-teal-200 bg-teal-50/60 p-6"><p className="text-xs font-bold tracking-[0.14em] text-teal-700">シミュレーションではここで登場</p><h2 className="mt-2 text-base font-bold text-slate-900">全体の流れに戻って確かめる</h2><p className="mt-3 text-sm leading-7 text-slate-700"><GlossaryText text={simulationContext} onOpenTerm={(termId) => onNavigate(`/glossary/${termId}`)} /></p><button type="button" onClick={() => onNavigate('/visualizer')} className="mt-4 text-sm font-semibold text-teal-800 transition hover:text-teal-950">シミュレーションを開く →</button></article>
      </section>
      {guide?.beginnerNote && <aside className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5"><p className="text-sm font-bold text-sky-950">ここは誤解しやすいポイント</p><p className="mt-2 text-sm leading-7 text-slate-700"><GlossaryText text={guide.beginnerNote} onOpenTerm={(termId) => onNavigate(`/glossary/${termId}`)} /></p></aside>}
      <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="text-lg font-bold text-amber-950">なぜ必要？</h2><p className="mt-3 text-sm leading-7 text-amber-950/80"><GlossaryText text={guide?.whyNeeded ?? term.why} onOpenTerm={(termId) => onNavigate(`/glossary/${termId}`)} /></p></article>
      <section className="panel overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-4 p-6"><div><p className="text-xs font-bold tracking-[0.14em] text-cyan-700">迷ったときの道しるべ</p><h2 className="mt-1 text-lg font-bold text-slate-900">用語を読む順番</h2><p className="mt-1 text-sm leading-6 text-slate-600">一語だけで完結させず、全体像と関連する用語を行き来します。</p></div><button type="button" aria-expanded={showReadingOrder} onClick={() => setShowReadingOrder(value => !value)} className="rounded-lg border border-cyan-600 bg-cyan-50 px-4 py-2.5 text-sm font-bold text-cyan-700 transition hover:bg-cyan-100">{showReadingOrder ? '順番を閉じる' : '読む順番を見る'}</button></div>{showReadingOrder && <ol className="space-y-3 border-t border-slate-200 bg-slate-50 p-6">{readingOrder.map((step, index) => <li key={`${index}-${step}`} className="flex gap-3 text-sm leading-7 text-slate-700"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-800">{index + 1}</span><GlossaryText text={step} onOpenTerm={(termId) => onNavigate(`/glossary/${termId}`)} /></li>)}</ol>}</section>
      {(term.deepDive?.length ?? 0) > 0 && <section className="panel overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-4 p-6"><div><h2 className="text-lg font-bold text-slate-900">さらに詳しく</h2><p className="mt-1 text-sm text-slate-600">仕組み・内部の流れ・実際の扱いを、もう一段深く確認できます。</p></div><button type="button" aria-expanded={showDetails} onClick={() => setShowDetails(value => !value)} className="rounded-lg border border-cyan-600 bg-cyan-50 px-4 py-2.5 text-sm font-bold text-cyan-700 transition hover:bg-cyan-100">{showDetails ? '詳細を閉じる' : 'もっと詳しく読む'}</button></div>{showDetails && <div className="border-t border-slate-200 bg-slate-50 p-6"><div className="space-y-5">{term.deepDive?.map(section => <article key={section.title} className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-bold text-slate-900">{section.title}</h3><p className="mt-2 text-sm leading-7 text-slate-700"><GlossaryText text={section.body} onOpenTerm={(termId) => onNavigate(`/glossary/${termId}`)} /></p></article>)}</div></div>}</section>}
      <article className="panel p-6"><h2 className="text-lg font-bold text-slate-900">教材との関係</h2><p className="mt-3 text-sm leading-7 text-slate-600"><GlossaryText text="この用語は、URLアクセスの流れ、機器・データ構造の探索、個別の図解教材で、他の仕組みと組み合わせて登場します。通信の全体像や学習テーマに戻り、関連する場面を確認してみましょう。" onOpenTerm={(termId) => onNavigate(`/glossary/${termId}`)} /></p>{relatedLessons.length > 0 && <div className="mt-5 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4"><p className="text-sm font-bold text-slate-900">この用語を動かして学ぶ</p><div className="mt-3 flex flex-wrap gap-2">{relatedLessons.map(lesson => <button key={lesson.id} type="button" onClick={() => onNavigate(`/learn/${lesson.id}`)} className="rounded-lg border border-cyan-300 bg-white px-3 py-2 text-sm font-semibold text-cyan-800 transition hover:border-cyan-500 hover:bg-cyan-50">{lesson.shortTitle} →</button>)}</div></div>}<div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => onNavigate('/visualizer')} className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700">シミュレーションを開く</button><button type="button" onClick={() => onNavigate('/topics')} className="rounded-lg border border-cyan-300 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100">学びを深める</button></div></article>
      {relatedTerms.length > 0 && <section className="panel p-6"><h2 className="text-lg font-bold text-slate-900">関連する用語</h2><div className="mt-4 flex flex-wrap gap-2">{relatedTerms.map(related => <button key={related.id} type="button" onClick={() => onNavigate(`/glossary/${related.id}`)} className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm font-semibold text-cyan-800 transition hover:border-cyan-400 hover:bg-cyan-100">{related.term}</button>)}</div></section>}
    </section>
  </PageContainer>
}
