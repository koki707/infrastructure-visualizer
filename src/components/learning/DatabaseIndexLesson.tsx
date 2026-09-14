import { useMemo, useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type DatabaseIndexLessonProps = {
  onNavigate: Navigate
}

type SearchKey = 12 | 42 | 65 | 88

type SearchExample = {
  key: SearchKey
  rootRange: string
  internalNode: string
  leafNode: string
  result: string
}

type SearchStep = {
  label: string
  title: string
  body: string
  detail: string
}

const SEARCH_EXAMPLES: Record<SearchKey, SearchExample> = {
  12: { key: 12, rootRange: '12 < 40', internalNode: '内部ノード A [12 | 25]', leafNode: '葉ノード A1 [5 | 12]', result: 'キー=12 の行への参照を見つける' },
  42: { key: 42, rootRange: '40 ≤ 42 < 70', internalNode: '内部ノード B [50 | 60]', leafNode: '葉ノード B1 [42 | 47]', result: 'キー=42 の行への参照を見つける' },
  65: { key: 65, rootRange: '40 ≤ 65 < 70', internalNode: '内部ノード B [50 | 60]', leafNode: '葉ノード B3 [60 | 65]', result: 'キー=65 の行への参照を見つける' },
  88: { key: 88, rootRange: '70 ≤ 88', internalNode: '内部ノード C [80 | 90]', leafNode: '葉ノード C2 [88 | 96]', result: 'キー=88 の行への参照を見つける' },
}

const SEARCH_STEPS: SearchStep[] = [
  {
    label: '検索（SEARCH）',
    title: '探す値を決める',
    body: 'データベースは、条件に合う行を探すとき、インデックス（Index）を利用できる場合があります。この教材では検索キーを1つ選び、どのノードをたどるかを止めながら確認します。',
    detail: 'インデックスを使えるかどうかは、検索条件、統計情報、テーブルの大きさ、データベースの最適化器（Optimizer）などによって変わります。常にインデックスを使うとは限りません。',
  },
  {
    label: 'ルート（ROOT）',
    title: 'ルートノード（Root Node）で、次に進む範囲を絞る',
    body: 'ルートノードの区切り値と検索キーを比べ、候補となる枝を1つ選びます。一度にすべてのデータを読む代わりに、検索範囲を段階的に狭められます。',
    detail: 'この図のルートノードは [40 | 70] です。たとえば42なら「40以上70未満」の枝へ進みます。ここで値そのものを見つけるのではなく、次のノードを選びます。',
  },
  {
    label: '内部（INTERNAL）',
    title: '内部ノード（Internal Node）で、候補をさらに小さくする',
    body: '選んだ枝の内部ノードでも同じように比較し、検索キーを含む葉ノードを選びます。木の高さが低いまま多くのキーを扱えることが、B-tree系インデックスの考え方です。',
    detail: '実際のノードの大きさやキーの数、分割方法はデータベースやページサイズで異なります。この教材では比較の流れが見えるよう、少ないキーで表しています。',
  },
  {
    label: '葉（LEAF）',
    title: '葉ノード（Leaf Node）で、目的のキーを見つける',
    body: '葉ノードには検索キーと、対応する行または行を参照する情報が置かれます。ここでキーを見つけ、必要ならテーブル（Table）の行を読みます。',
    detail: 'インデックスだけで必要な列を取得できる場合もあれば、インデックスからテーブルの行を追加で読む場合もあります。どちらになるかはインデックスの設計と問い合わせ内容によります。',
  },
  {
    label: '結果（RESULT）',
    title: '検索結果へ到達する',
    body: 'ルート → 内部 → 葉と少数のノードをたどり、目的のキーに到達しました。全行を順番に読む方法と比べ、条件に合う候補へ早く近づけることがあります。',
    detail: 'インデックスには書き込み時の更新コスト、保存領域、偏った条件での効果差などのトレードオフがあります。「インデックスを増やせば常に速い」わけではありません。',
  },
]

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

function nodeClass(active: boolean, completed: boolean, tone: 'indigo' | 'sky' | 'emerald') {
  const base = 'rounded-xl border p-3 transition'
  const colors = tone === 'indigo'
    ? 'border-indigo-200 bg-indigo-50 text-indigo-950'
    : tone === 'sky'
      ? 'border-sky-200 bg-sky-50 text-sky-950'
      : 'border-emerald-200 bg-emerald-50 text-emerald-950'
  if (active) return `${base} border-cyan-500 bg-cyan-50 text-cyan-950 ring-2 ring-cyan-100 shadow-sm`
  if (completed) return `${base} ${colors} opacity-85`
  return `${base} border-slate-200 bg-slate-50 text-slate-500 opacity-75`
}

/**
 * A deliberately small B-tree-family index model. It teaches the search path,
 * not a particular database product, on-disk layout, or query planner.
 */
export function DatabaseIndexLesson({ onNavigate }: DatabaseIndexLessonProps) {
  const [selectedKey, setSelectedKey] = useState<SearchKey>(42)
  const [step, setStep] = useState(0)
  const example = SEARCH_EXAMPLES[selectedKey]
  const route = useMemo(() => [example.rootRange, example.internalNode, example.leafNode], [example])
  const current = SEARCH_STEPS[step]

  const selectKey = (key: SearchKey) => {
    setSelectedKey(key)
    setStep(0)
  }

  const reset = () => {
    setSelectedKey(42)
    setStep(0)
  }

  const rootActive = step === 1
  const internalActive = step === 2
  const leafActive = step === 3 || step === 4
  const resultVisible = step === SEARCH_STEPS.length - 1

  return <section aria-label="データベースのインデックスの検索ステップ図解" className="rounded-3xl border border-indigo-200 bg-indigo-50/45 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow text-indigo-700">操作して学ぶデータベース</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">インデックスをたどって、目的のデータへ近づく</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="データベースのインデックス（Index）は、すべての行を順番に見る代わりに、検索条件に近い場所を素早く探すための補助構造です。ここではB-tree系の代表的な検索経路だけに絞り、ルートから葉までを手動で進めます。" onNavigate={onNavigate} /></p>
      </div>
      <span className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-800">キー = {selectedKey} · {step + 1} / {SEARCH_STEPS.length}</span>
    </div>

    <div className="mt-6 grid gap-2 sm:grid-cols-5" role="tablist" aria-label="インデックス検索の段階">
      {SEARCH_STEPS.map((item, index) => <button key={item.label} type="button" role="tab" aria-selected={step === index} onClick={() => setStep(index)} className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${step === index ? 'border-indigo-500 bg-white text-indigo-950 shadow-sm' : 'border-indigo-100 bg-indigo-50 text-slate-600 hover:border-indigo-300 hover:bg-white'}`}><span className="block text-[10px] text-indigo-700">{index + 1}</span><span className="mt-1 block">{item.label}</span></button>)}
    </div>

    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2" aria-label="検索キーを選ぶ">
        <span className="self-center text-xs font-bold text-slate-600">検索キー</span>
        {(Object.keys(SEARCH_EXAMPLES) as unknown as SearchKey[]).map(key => <button key={key} type="button" aria-pressed={selectedKey === key} onClick={() => selectKey(key)} className={`rounded-lg border px-3 py-2 font-mono text-xs font-bold transition ${selectedKey === key ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'}`}>{key}</button>)}
      </div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setStep(value => Math.max(0, value - 1))} disabled={step === 0} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-indigo-300 disabled:cursor-not-allowed disabled:opacity-45">← 前の状態</button><button type="button" onClick={() => setStep(value => Math.min(SEARCH_STEPS.length - 1, value + 1))} disabled={step === SEARCH_STEPS.length - 1} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-45">次の状態 →</button><button type="button" onClick={reset} className="rounded-lg px-2 py-2 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-slate-900">リセット</button></div>
    </div>

    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div aria-live="polite"><p className="text-xs font-bold text-indigo-800">{current.label}</p><h3 className="mt-1 text-lg font-bold text-slate-900">{current.title}</h3><p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={current.body} onNavigate={onNavigate} /></p><p className="mt-3 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><LinkedText text={current.detail} onNavigate={onNavigate} /></p></div>
        <aside className="rounded-xl border border-indigo-200 bg-indigo-50 p-4"><p className="text-xs font-bold text-indigo-950">今回の検索経路</p><ol className="mt-3 space-y-2 text-xs"><li className={`rounded-lg px-3 py-2 ${step >= 1 ? 'bg-white font-semibold text-indigo-900' : 'text-slate-500'}`}>1. ルート：{step >= 1 ? route[0] : '[40 | 70] を比較する'}</li><li className={`rounded-lg px-3 py-2 ${step >= 2 ? 'bg-white font-semibold text-indigo-900' : 'text-slate-500'}`}>2. 内部：{step >= 2 ? route[1] : '次のノードを選ぶ'}</li><li className={`rounded-lg px-3 py-2 ${step >= 3 ? 'bg-white font-semibold text-indigo-900' : 'text-slate-500'}`}>3. 葉：{step >= 3 ? route[2] : '候補の葉ノードへ進む'}</li></ol>{resultVisible && <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold leading-6 text-emerald-950">✓ {example.result}</p>}</aside>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4" aria-label="B-tree系インデックスの概念図">
        <div className="min-w-[44rem]">
          <div className="mx-auto max-w-[14rem]"><article className={nodeClass(rootActive, step > 1, 'indigo')}><p className="text-[10px] font-bold tracking-[.12em]">ルートノード</p><p className="mt-2 font-mono text-sm font-bold">[ 40 | 70 ]</p><p className="mt-1 text-[10px]">検索範囲を3つの枝へ分ける</p></article></div>
          <div className="mx-auto h-5 w-px bg-slate-300" aria-hidden="true" />
          <div className="grid grid-cols-3 gap-3">
            <article className={nodeClass(internalActive && example.internalNode.startsWith('内部ノード A'), step > 2 && example.internalNode.startsWith('内部ノード A'), 'sky')}><p className="text-[10px] font-bold tracking-[.1em]">内部ノード A</p><p className="mt-2 font-mono text-sm font-bold">[ 12 | 25 ]</p><p className="mt-1 text-[10px]">キー &lt; 40 の枝</p></article>
            <article className={nodeClass(internalActive && example.internalNode.startsWith('内部ノード B'), step > 2 && example.internalNode.startsWith('内部ノード B'), 'sky')}><p className="text-[10px] font-bold tracking-[.1em]">内部ノード B</p><p className="mt-2 font-mono text-sm font-bold">[ 50 | 60 ]</p><p className="mt-1 text-[10px]">40 ≤ キー &lt; 70 の枝</p></article>
            <article className={nodeClass(internalActive && example.internalNode.startsWith('内部ノード C'), step > 2 && example.internalNode.startsWith('内部ノード C'), 'sky')}><p className="text-[10px] font-bold tracking-[.1em]">内部ノード C</p><p className="mt-2 font-mono text-sm font-bold">[ 80 | 90 ]</p><p className="mt-1 text-[10px]">70 ≤ キー の枝</p></article>
          </div>
          <div className="mx-auto h-5 w-px bg-slate-300" aria-hidden="true" />
          <div className="grid grid-cols-3 gap-3">
            <article className={nodeClass(leafActive && example.leafNode.startsWith('葉ノード A'), resultVisible && example.leafNode.startsWith('葉ノード A'), 'emerald')}><p className="text-[10px] font-bold tracking-[.1em]">葉ノード A1</p><p className="mt-2 font-mono text-sm font-bold">[ 5 | 12 ]</p><p className="mt-1 text-[10px]">行への参照を持つ概念図</p></article>
            <article className={nodeClass(leafActive && example.leafNode.startsWith('葉ノード B'), resultVisible && example.leafNode.startsWith('葉ノード B'), 'emerald')}><p className="text-[10px] font-bold tracking-[.1em]">葉ノード B</p><p className="mt-2 font-mono text-sm font-bold">[ 42 | 47 ] / [ 60 | 65 ]</p><p className="mt-1 text-[10px]">選んだキーを含む葉ノード</p></article>
            <article className={nodeClass(leafActive && example.leafNode.startsWith('葉ノード C'), resultVisible && example.leafNode.startsWith('葉ノード C'), 'emerald')}><p className="text-[10px] font-bold tracking-[.1em]">葉ノード C2</p><p className="mt-2 font-mono text-sm font-bold">[ 88 | 96 ]</p><p className="mt-1 text-[10px]">行への参照を持つ概念図</p></article>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-bold text-slate-900">なぜ木の形にする？</p><p className="mt-2 text-xs leading-6 text-slate-700">ノードごとの比較で候補を大きく絞れるため、データが増えても、少ない段数で目的の範囲へ到達できることがあります。葉ノードを順序づける設計は、範囲検索にも役立つ場合があります。</p></section>
        <section className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm font-bold text-slate-900">テーブルを直接読む場合との違い</p><p className="mt-2 text-xs leading-6 text-slate-700">インデックスは「どこを読めばよいか」を案内します。条件に合う行が非常に多い場合や、必要な情報がインデックスにない場合は、テーブルを広く読む方が合理的なこともあります。</p></section>
      </div>
    </div>

    <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>教材上の簡略化：</b>これはB-tree系インデックスの検索経路を示す概念図です。実際のデータベースではB+tree、ハッシュインデックス（Hash Index）、複合インデックス、カバリングインデックス（Covering Index）などの種類があり、ノードはディスクやメモリのページ単位で管理されます。最適化器（Optimizer）がインデックスを選ぶか、どの順で表を読むかも、データベース製品・統計情報・クエリ・設定で異なります。</p>
  </section>
}

export default DatabaseIndexLesson
