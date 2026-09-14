import { useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type BinarySearchLessonProps = {
  onNavigate: Navigate
}

type SearchPhase = 'ready' | 'inspect' | 'found' | 'not-found'

type Comparison = {
  low: number
  high: number
  middle: number
  value: number
  result: 'smaller' | 'larger' | 'equal'
}

const SORTED_VALUES = [3, 8, 14, 18, 27, 31, 42, 56, 63, 71, 79, 84, 91, 96, 103]
const TARGETS = [27, 79, 103, 50]

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

function comparisonSentence(comparison: Comparison, target: number) {
  if (comparison.result === 'equal') return `中央の ${comparison.value} が探している ${target} と一致しました。`
  if (comparison.result === 'smaller') return `中央の ${comparison.value} は ${target} より小さいため、中央の値を含む左側（中央以下）を候補から外せます。`
  return `中央の ${comparison.value} は ${target} より大きいため、中央の値を含む右側（中央以上）を候補から外せます。`
}

/** A manual, pauseable binary search. Each click exposes one comparison before it narrows the range. */
export function BinarySearchLesson({ onNavigate }: BinarySearchLessonProps) {
  const [target, setTarget] = useState(79)
  const [low, setLow] = useState(0)
  const [high, setHigh] = useState(SORTED_VALUES.length - 1)
  const [phase, setPhase] = useState<SearchPhase>('ready')
  const [comparison, setComparison] = useState<Comparison | null>(null)
  const [history, setHistory] = useState<Comparison[]>([])

  const reset = (nextTarget = target) => {
    setTarget(nextTarget)
    setLow(0)
    setHigh(SORTED_VALUES.length - 1)
    setPhase('ready')
    setComparison(null)
    setHistory([])
  }

  const inspectMiddle = () => {
    if (low > high) {
      setPhase('not-found')
      return
    }
    const middle = Math.floor((low + high) / 2)
    const value = SORTED_VALUES[middle]
    setComparison({
      low,
      high,
      middle,
      value,
      result: value === target ? 'equal' : value < target ? 'smaller' : 'larger',
    })
    setPhase('inspect')
  }

  const applyComparison = () => {
    if (!comparison) return
    setHistory(items => [...items, comparison])
    if (comparison.result === 'equal') {
      setPhase('found')
      return
    }
    const nextLow = comparison.result === 'smaller' ? comparison.middle + 1 : comparison.low
    const nextHigh = comparison.result === 'larger' ? comparison.middle - 1 : comparison.high
    setLow(nextLow)
    setHigh(nextHigh)
    setComparison(null)
    setPhase(nextLow > nextHigh ? 'not-found' : 'ready')
  }

  const activeLow = comparison?.low ?? low
  const activeHigh = comparison?.high ?? high
  const activeMiddle = comparison?.middle
  const foundIndex = phase === 'found' ? comparison?.middle ?? history.at(-1)?.middle : undefined
  const currentDescription = phase === 'ready'
    ? '候補範囲の中央を選び、探している値と比べます。'
    : phase === 'inspect' && comparison
      ? comparisonSentence(comparison, target)
      : phase === 'found'
        ? `${target} は添字 ${foundIndex ?? '—'} に見つかりました。`
        : `${target} を含む候補範囲がなくなったため、この整列済み配列には見つかりませんでした。`

  return <section aria-label="二分探索のステップ図解" className="rounded-3xl border border-cyan-200 bg-cyan-50/45 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow text-cyan-700">操作して学ぶアルゴリズム</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">中央を比べ、候補を半分ずつ絞る</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="二分探索は、値が小さい順などに整列された配列から目的の値を探す方法です。中央の値との比較を止めながら、なぜ候補を半分にできるのかを確認します。" onNavigate={onNavigate} /></p>
      </div>
      <span className="rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-bold text-cyan-800">比較 {history.length + (comparison ? 1 : 0)} 回</span>
    </div>

    <div className="mt-6 rounded-2xl border border-cyan-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-bold text-slate-900">探す値を選ぶ</p><p className="mt-1 text-xs leading-6 text-slate-600">50は配列に存在しない例です。見つからないときも、候補が空になるまで同じ規則で進みます。</p></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="探索する値">
          {TARGETS.map(value => <button key={value} type="button" onClick={() => reset(value)} aria-pressed={target === value} className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${target === value ? 'border-cyan-600 bg-cyan-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-800'}`}>{value}{value === 50 ? '（ない例）' : ''}</button>)}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold text-slate-700">整列済みの配列</p><p className="text-xs text-slate-500">候補範囲：{activeLow <= activeHigh ? `${activeLow} 〜 ${activeHigh}` : 'なし'}</p></div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-[repeat(15,minmax(0,1fr))]" aria-label="二分探索の配列">
          {SORTED_VALUES.map((value, index) => {
            const inRange = index >= activeLow && index <= activeHigh
            const isMiddle = activeMiddle === index
            const isFound = foundIndex === index
            return <div key={value} className={`relative rounded-lg border px-2 py-2 text-center transition ${isFound ? 'border-emerald-500 bg-emerald-100 text-emerald-950 shadow-sm' : isMiddle ? 'border-amber-500 bg-amber-100 text-amber-950 shadow-sm' : inRange ? 'border-cyan-300 bg-white text-slate-800' : 'border-slate-200 bg-slate-100 text-slate-400 opacity-70'}`}>
              <span className="block text-[10px] font-medium text-slate-500">{index}</span>
              <b className="mt-0.5 block text-sm">{value}</b>
              {isMiddle && <span className="mt-1 block text-[9px] font-bold text-amber-800">中央</span>}
              {isFound && <span className="mt-1 block text-[9px] font-bold text-emerald-800">発見</span>}
            </div>
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite">
          <p className="text-xs font-bold text-cyan-800">いま行っていること</p>
          <h3 className="mt-1 text-base font-bold text-slate-900">{phase === 'ready' ? '中央の値を見る' : phase === 'inspect' ? '中央の値と比べる' : phase === 'found' ? '目的の値を見つけた' : '候補をすべて調べ終えた'}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={currentDescription} onNavigate={onNavigate} /></p>
          {comparison && <dl className="mt-4 grid gap-2 rounded-lg border border-cyan-100 bg-white p-3 text-xs sm:grid-cols-3"><div><dt className="text-slate-500">候補範囲</dt><dd className="mt-1 font-mono font-bold text-slate-800">{comparison.low} 〜 {comparison.high}</dd></div><div><dt className="text-slate-500">中央の添字</dt><dd className="mt-1 font-mono font-bold text-slate-800">{comparison.middle}</dd></div><div><dt className="text-slate-500">中央の値</dt><dd className="mt-1 font-mono font-bold text-slate-800">{comparison.value}</dd></div></dl>}
        </div>
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
          <p className="text-xs font-bold text-cyan-900">次の操作</p>
          <p className="mt-2 text-xs leading-6 text-slate-700">{phase === 'ready' ? '候補範囲の真ん中を選びます。' : phase === 'inspect' ? '比較結果に応じて、不要な半分を候補から外します。' : '別の値を選ぶか、最初から試せます。'}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {phase === 'ready' && <button type="button" onClick={inspectMiddle} className="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan-800">中央を見る</button>}
            {phase === 'inspect' && <button type="button" onClick={applyComparison} className="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan-800">比較して範囲を絞る</button>}
            <button type="button" onClick={() => reset()} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-800">最初に戻す</button>
          </div>
        </div>
      </div>

      {history.length > 0 && <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-700">これまでに外した範囲</p><ol className="mt-3 grid gap-2 text-xs leading-6">{history.map((item, index) => <li key={`${item.middle}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2"><b className="mr-2 text-cyan-800">{index + 1}</b>{comparisonSentence(item, target)}</li>)}</ol></div>}
    </div>

    <div className="mt-4 grid gap-3 md:grid-cols-2">
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>重要な前提：</b>値が整列されていなければ、中央より片側を安全に捨てる根拠がありません。二分探索を使う前に、順序が保たれている必要があります。</p>
      <p className="rounded-xl border border-cyan-200 bg-white px-4 py-3 text-xs leading-6 text-slate-700"><b>計算量の見方：</b>配列の要素数が増えても、比較ごとに候補をほぼ半分にするため、比較回数は概ね <code className="font-bold text-cyan-900">O(log n)</code> で増えます。ここでは添字から中央へすぐアクセスできる配列の代表例を示しています。</p>
    </div>
  </section>
}

export default BinarySearchLesson
