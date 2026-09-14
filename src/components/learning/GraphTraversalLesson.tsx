import { useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type GraphTraversalLessonProps = {
  onNavigate: Navigate
}

type Algorithm = 'bfs' | 'dfs'
type NodeId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
type TraversalPhase = 'ready' | 'take' | 'expand' | 'found' | 'complete'

type GraphNode = {
  id: NodeId
  left: string
  top: string
}

const GRAPH_NODES: GraphNode[] = [
  { id: 'A', left: '50%', top: '10%' },
  { id: 'B', left: '20%', top: '34%' },
  { id: 'C', left: '80%', top: '34%' },
  { id: 'D', left: '14%', top: '75%' },
  { id: 'E', left: '50%', top: '67%' },
  { id: 'F', left: '86%', top: '75%' },
]

const EDGES: Array<[NodeId, NodeId]> = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'E'], ['C', 'E'], ['D', 'F'], ['E', 'F']]

const ADJACENCY: Record<NodeId, NodeId[]> = {
  A: ['B', 'C'],
  B: ['A', 'D', 'E'],
  C: ['A', 'E'],
  D: ['B', 'F'],
  E: ['B', 'C', 'F'],
  F: ['D', 'E'],
}

const START_NODES: NodeId[] = ['A', 'C']
const TARGET: NodeId = 'F'

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

function edgeCoordinates([from, to]: [NodeId, NodeId]) {
  const start = GRAPH_NODES.find(node => node.id === from)
  const end = GRAPH_NODES.find(node => node.id === to)
  if (!start || !end) return { x1: 0, y1: 0, x2: 0, y2: 0 }
  return {
    x1: Number.parseFloat(start.left),
    y1: Number.parseFloat(start.top),
    x2: Number.parseFloat(end.left),
    y2: Number.parseFloat(end.top),
  }
}

function phaseTitle(phase: TraversalPhase, algorithm: Algorithm) {
  if (phase === 'ready') return '探索を始める'
  if (phase === 'take') return algorithm === 'bfs' ? 'キュー（Queue）の先頭から次のノードを取り出す' : 'スタック（Stack）の上から次のノードを取り出す'
  if (phase === 'expand') return '隣接する未発見ノードを追加する'
  if (phase === 'found') return '目的のノードを見つけた'
  return '探索できるノードをすべて調べた'
}

/** A small manual graph-search model. It uses one graph so Queue and Stack behavior stay comparable. */
export function GraphTraversalLesson({ onNavigate }: GraphTraversalLessonProps) {
  const [algorithm, setAlgorithm] = useState<Algorithm>('bfs')
  const [start, setStart] = useState<NodeId>('A')
  const [phase, setPhase] = useState<TraversalPhase>('ready')
  const [frontier, setFrontier] = useState<NodeId[]>([])
  const [discovered, setDiscovered] = useState<NodeId[]>([])
  const [expanded, setExpanded] = useState<NodeId[]>([])
  const [current, setCurrent] = useState<NodeId | null>(null)
  const [log, setLog] = useState<string[]>([])

  const reset = (nextAlgorithm = algorithm, nextStart = start) => {
    setAlgorithm(nextAlgorithm)
    setStart(nextStart)
    setPhase('ready')
    setFrontier([])
    setDiscovered([])
    setExpanded([])
    setCurrent(null)
    setLog([])
  }

  const selectAlgorithm = (nextAlgorithm: Algorithm) => reset(nextAlgorithm, start)
  const selectStart = (nextStart: NodeId) => reset(algorithm, nextStart)

  const advance = () => {
    if (phase === 'ready') {
      setFrontier([start])
      setDiscovered([start])
      setPhase('take')
      setLog([`${start} を開始点として、${algorithm === 'bfs' ? 'キュー（Queue）' : 'スタック（Stack）'}へ追加しました。`])
      return
    }

    if (phase === 'take') {
      if (frontier.length === 0) {
        setPhase('complete')
        setLog(items => [...items, '探索できるノードがなくなりました。'])
        return
      }
      const nextCurrent = algorithm === 'bfs' ? frontier[0] : frontier[frontier.length - 1]
      const remaining = algorithm === 'bfs' ? frontier.slice(1) : frontier.slice(0, -1)
      setFrontier(remaining)
      setCurrent(nextCurrent)
      if (nextCurrent === TARGET) {
        setPhase('found')
        setLog(items => [...items, `${TARGET} を取り出しました。検索の目的を達成しました。`])
      } else {
        setPhase('expand')
        setLog(items => [...items, `${nextCurrent} を取り出し、隣接するノードを調べます。`])
      }
      return
    }

    if (phase === 'expand' && current) {
      const newNodes = ADJACENCY[current].filter(node => !discovered.includes(node))
      setFrontier(items => [...items, ...newNodes])
      setDiscovered(items => [...items, ...newNodes])
      setExpanded(items => [...items, current])
      setCurrent(null)
      setPhase('take')
      setLog(items => [...items, newNodes.length > 0 ? `${current} の未発見の隣接ノード ${newNodes.join('・')} を${algorithm === 'bfs' ? 'キュー（Queue）の末尾' : 'スタック（Stack）の上'}へ追加しました。` : `${current} から追加する未発見ノードはありません。`])
    }
  }

  const frontierName = algorithm === 'bfs' ? 'キュー（Queue・先入れ先出し）' : 'スタック（Stack・後入れ先出し）'
  const canAdvance = phase !== 'found' && phase !== 'complete'
  const statusBody = phase === 'ready'
    ? `${start} から ${TARGET} を探します。${algorithm === 'bfs' ? '近いノードから順に広げる' : '1つの枝を深くたどる'}動きを、1手ずつ止めて確認できます。`
    : phase === 'take'
        ? `${frontierName}には、次に調べる候補が並んでいます。`
      : phase === 'expand' && current
          ? `${current} とつながる未発見ノードを候補へ追加します。同じノードを二重に入れないため、発見済みとして記録します。`
        : phase === 'found'
          ? `${TARGET} に到達したため、この検索例では停止します。`
          : '開始点から到達できるノードをすべて調べ終えました。'

  return <section aria-label="BFSとDFSのグラフ探索図解" className="rounded-3xl border border-cyan-200 bg-cyan-50/45 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow text-cyan-700">操作して学ぶアルゴリズム</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">ノードをたどり、目的地を探す</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="グラフ探索（Graph Traversal）は、ノード（Node）と辺（Edge）で表したつながりを順にたどる探索です。BFSとDFSを切り替え、キュー（Queue）またはスタック（Stack）が探索順をどう変えるかを止めながら確かめます。" onNavigate={onNavigate} /></p>
      </div>
      <span className="rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-bold text-cyan-800">目標ノード: {TARGET}</span>
    </div>

    <div className="mt-6 grid gap-3 lg:grid-cols-2">
      <div className="rounded-2xl border border-cyan-200 bg-white p-4"><p className="text-sm font-bold text-slate-900">探索方法を選ぶ</p><div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="グラフ探索の方法">{(['bfs', 'dfs'] as Algorithm[]).map(item => <button key={item} type="button" aria-pressed={algorithm === item} onClick={() => selectAlgorithm(item)} className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${algorithm === item ? 'border-cyan-600 bg-cyan-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-800'}`}>{item === 'bfs' ? 'BFS：幅を広げる' : 'DFS：深くたどる'}</button>)}</div><p className="mt-3 text-xs leading-6 text-slate-600"><LinkedText text={algorithm === 'bfs' ? 'BFSはキュー（Queue）を使い、開始点から近いノードを先に調べます。' : 'DFSはスタック（Stack）を使い、見つけた枝を深くたどってから戻ります。'} onNavigate={onNavigate} /></p></div>
      <div className="rounded-2xl border border-cyan-200 bg-white p-4"><p className="text-sm font-bold text-slate-900">開始するノードを選ぶ</p><div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="グラフ探索の開始ノード">{START_NODES.map(node => <button key={node} type="button" aria-pressed={start === node} onClick={() => selectStart(node)} className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${start === node ? 'border-cyan-600 bg-cyan-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-800'}`}>{node} から始める</button>)}</div><p className="mt-3 text-xs leading-6 text-slate-600">開始点を変えると、候補の並びと目的地へたどり着く順序が変わります。</p></div>
    </div>

    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div>
          <div className="relative min-h-[318px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50" aria-label="グラフのノードと辺">
            <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              {EDGES.map(edge => {
                const coords = edgeCoordinates(edge)
                const connectedToCurrent = current !== null && edge.includes(current)
                return <line key={edge.join('-')} x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2} stroke={connectedToCurrent ? '#06b6d4' : '#cbd5e1'} strokeWidth={connectedToCurrent ? '1.2' : '.7'} />
              })}
            </svg>
            {GRAPH_NODES.map(node => {
              const isCurrent = current === node.id
              const isGoal = node.id === TARGET
              const isDiscovered = discovered.includes(node.id)
              const isExpanded = expanded.includes(node.id)
              const className = isCurrent
                ? 'border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-200'
                : isGoal && phase === 'found'
                  ? 'border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : isGoal
                    ? 'border-amber-400 bg-amber-50 text-amber-950'
                    : isExpanded
                      ? 'border-emerald-400 bg-emerald-100 text-emerald-950'
                      : isDiscovered
                        ? 'border-cyan-400 bg-cyan-100 text-cyan-950'
                        : 'border-slate-300 bg-white text-slate-700'
              return <div key={node.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: node.left, top: node.top }}><span className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-base font-black transition ${className}`}>{node.id}</span><span className="mt-1 block whitespace-nowrap text-center text-[10px] font-semibold text-slate-600">{isCurrent ? '確認中' : isGoal ? '目標' : isExpanded ? '展開済み' : isDiscovered ? '発見済み' : '未確認'}</span></div>
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-600"><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full border border-slate-300 bg-white" />未確認</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full border border-cyan-400 bg-cyan-100" />発見済み</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full border border-emerald-400 bg-emerald-100" />展開済み</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full border border-violet-500 bg-violet-600" />確認中</span></div>
        </div>
        <aside className="space-y-3">
          <section className="rounded-xl border border-cyan-200 bg-cyan-50 p-4"><p className="text-xs font-bold text-cyan-900">{frontierName}</p><div className="mt-3 flex min-h-10 flex-wrap items-center gap-2 rounded-lg border border-white bg-white/80 p-2">{frontier.length === 0 ? <span className="text-xs text-slate-500">まだ候補はありません</span> : frontier.map((node, index) => <span key={`${node}-${index}`} className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 font-mono text-xs font-bold text-cyan-950">{node}{algorithm === 'bfs' && index === 0 ? ' ← 次' : algorithm === 'dfs' && index === frontier.length - 1 ? ' ← 次' : ''}</span>)}</div><p className="mt-2 text-[11px] leading-5 text-slate-600">{algorithm === 'bfs' ? '左端から取り出し、右端へ追加します。' : '右端から取り出し、右端へ追加します。'}</p></section>
          <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4"><p className="text-xs font-bold text-emerald-900">発見済みノード</p><p className="mt-2 min-h-6 font-mono text-sm font-bold text-emerald-950">{discovered.length ? discovered.join(' → ') : '—'}</p><p className="mt-2 text-[11px] leading-5 text-slate-600">同じノードを候補へ重ねて入れないために使います。</p></section>
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold text-slate-700">展開済みノード</p><p className="mt-2 min-h-6 font-mono text-sm font-bold text-slate-800">{expanded.length ? expanded.join(' → ') : '—'}</p><p className="mt-2 text-[11px] leading-5 text-slate-600">隣接ノードを調べ終えたノードです。</p></section>
        </aside>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite"><p className="text-xs font-bold text-cyan-800">いま行っていること</p><h3 className="mt-1 text-base font-bold text-slate-900">{phaseTitle(phase, algorithm)}</h3><p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={statusBody} onNavigate={onNavigate} /></p></article>
        <aside className="rounded-xl border border-cyan-200 bg-cyan-50 p-4"><p className="text-xs font-bold text-cyan-900">次の操作</p><p className="mt-2 text-xs leading-6 text-slate-700">{canAdvance ? '1手だけ進め、候補の入れ替わりを確認します。' : '探索の結果を確認してから、最初に戻すか条件を変えられます。'}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={advance} disabled={!canAdvance} className="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-40">{phase === 'ready' ? '探索を始める' : phase === 'expand' ? '隣接ノードを追加する' : '次のノードを取り出す'}</button><button type="button" onClick={() => reset()} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-800">最初に戻す</button></div></aside>
      </div>

      {log.length > 0 && <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-700">探索の記録</p><ol className="mt-3 grid gap-2 text-xs leading-6">{log.map((item, index) => <li key={`${item}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2"><b className="mr-2 text-cyan-800">{index + 1}</b>{item}</li>)}</ol></section>}
    </div>

    <div className="mt-4 grid gap-3 md:grid-cols-2"><p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>最短経路との関係：</b>BFSは、すべての辺（Edge）を同じ重みとして扱う無重みグラフ（Graph）で、開始点からの最短の「辺の数」を求めるときに使えます。重みが異なる場合は、別のアルゴリズムが必要になることがあります。</p><p className="rounded-xl border border-cyan-200 bg-white px-4 py-3 text-xs leading-6 text-slate-700"><b>DFSとの違い：</b>DFSは1つの枝を深くたどるため、探索順がBFSと異なり、最短経路を保証する探索ではありません。どちらが適切かは、探索の目的とグラフの性質で変わります。</p></div>
  </section>
}

export default GraphTraversalLesson
