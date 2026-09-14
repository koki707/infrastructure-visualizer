import { useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type CacheMemoryLessonProps = {
  onNavigate: Navigate
}

type LessonPart = 'cpu' | 'cache' | 'memory'

type CacheStep = {
  shortTitle: string
  title: string
  body: string
  detail: string
  signal: string
  activeParts: LessonPart[]
  cacheStatus: string
  cacheLine: string
  memoryStatus: string
}

type CacheScenario = {
  id: 'hit' | 'miss'
  label: string
  description: string
  steps: CacheStep[]
}

const CACHE_SCENARIOS: CacheScenario[] = [
  {
    id: 'hit',
    label: 'キャッシュヒット（Cache Hit）の例',
    description: 'CPUが必要とする番地を、すでにキャッシュ（Cache）が持っている場合です。',
    steps: [
      {
        shortTitle: '読み取り要求',
        title: 'CPUが番地 0x1040 の値を読みたい',
        body: 'CPUは命令を実行するために、メモリ上の番地 0x1040 にある値を読みます。まず近くにあるキャッシュ（Cache）へ要求を出します。',
        detail: 'キャッシュ（Cache）はCPUと主記憶の間に置かれる、小さく高速な記憶領域です。すべてのデータを入れるのではなく、最近または近くで使われそうなデータの一部を保持します。',
        signal: 'CPU → キャッシュ: 読み取り 0x1040',
        activeParts: ['cpu', 'cache'],
        cacheStatus: '番地を照合中',
        cacheLine: 'Line 12  |  tag=0x10  |  [0x1040…0x107F]',
        memoryStatus: '待機中',
      },
      {
        shortTitle: 'タグの照合',
        title: 'キャッシュが、目的のデータを持つか照合する',
        body: 'キャッシュは、要求された番地に対応するキャッシュライン（Cache Line）のタグ（Tag）などを照合します。この例では、番地 0x1040 を含むラインがすでにキャッシュにあります。',
        detail: '実際のキャッシュは、直接マップ、セット連想、完全連想などの構成を持つことがあります。ここでは「番地に対応するラインを見つける」という役割だけを示します。',
        signal: 'キャッシュ: タグ一致 → ヒット',
        activeParts: ['cache'],
        cacheStatus: 'ヒット: ライン 12 が一致',
        cacheLine: 'Line 12  |  tag=0x10  |  0x1040 の値を含む',
        memoryStatus: '主記憶へは読みに行かない',
      },
      {
        shortTitle: '値を返す',
        title: 'キャッシュが値をCPUへ返し、主記憶への待ちを避ける',
        body: '必要な値がキャッシュ内にあるため、主記憶まで読みに行かずにCPUへ返せます。これがキャッシュヒットです。',
        detail: 'ヒット時でもキャッシュの速度は一定ではなく、階層や設計により遅延が異なります。それでも一般に、主記憶へアクセスするより短い待ち時間で済むことが多い、というのがキャッシュを置く理由です。',
        signal: 'キャッシュ → CPU: 値 42',
        activeParts: ['cpu', 'cache'],
        cacheStatus: 'ヒット: 値 42 を返す',
        cacheLine: 'Line 12  |  0x1040 → 42',
        memoryStatus: '待機中',
      },
    ],
  },
  {
    id: 'miss',
    label: 'キャッシュミス（Cache Miss）の例',
    description: 'CPUが必要とする番地がキャッシュになく、主記憶からラインを取り込む場合です。',
    steps: [
      {
        shortTitle: '読み取り要求',
        title: 'CPUが番地 0x2088 の値を読みたい',
        body: 'CPUは番地 0x2088 の値を必要としています。最初にキャッシュへ要求しますが、この番地を含むラインはまだキャッシュにありません。',
        detail: 'キャッシュミスは異常ではなく、キャッシュ容量より多くのデータを使うときや、初めて読むデータなどで自然に起きます。',
        signal: 'CPU → キャッシュ: 読み取り 0x2088',
        activeParts: ['cpu', 'cache'],
        cacheStatus: '番地を照合中',
        cacheLine: 'Line 12  |  tag=0x10  |  [0x1040…0x107F]',
        memoryStatus: '待機中',
      },
      {
        shortTitle: 'ミスを検出する',
        title: 'キャッシュに一致するラインがなく、ミスになる',
        body: 'キャッシュは番地 0x2088 に対応する内容を見つけられません。そこで、主記憶から必要なデータを含むキャッシュラインを取得する処理へ進みます。',
        detail: 'どのラインを入れ替えるかはキャッシュの構成や置換方針によって決まります。この例では、空きまたは置換先がすぐ選べるものとして扱います。',
        signal: 'キャッシュ: タグ不一致 → ミス',
        activeParts: ['cache'],
        cacheStatus: 'ミス: 主記憶へ要求',
        cacheLine: 'Line 12  |  置換候補（教育用の例）',
        memoryStatus: '[0x2080…0x20BF] の読み取り要求を受け取る',
      },
      {
        shortTitle: 'ラインを取り込む',
        title: '主記憶から、必要な値を含むラインを読む',
        body: '主記憶は、要求された1つの値だけでなく、近くの番地を含むまとまりをキャッシュラインとして返す代表例です。この例では 0x2080 から 0x20BF の範囲を読みます。',
        detail: '近くの番地も続けて使われやすいという局所性を利用するためです。ラインの大きさや、どこまで一度に取り込むかはCPUの実装で異なります。',
        signal: '主記憶 → キャッシュ: ライン [0x2080…0x20BF]',
        activeParts: ['cache', 'memory'],
        cacheStatus: 'ラインの取り込み中',
        cacheLine: 'Line 12  |  [0x2080…0x20BF] を受信中',
        memoryStatus: '主記憶からキャッシュへ転送中',
      },
      {
        shortTitle: '値を返す',
        title: 'ラインをキャッシュへ置き、目的の値をCPUへ返す',
        body: 'キャッシュは受け取ったラインを保持し、その中の番地 0x2088 の値をCPUへ返します。次に近い番地を読むときは、キャッシュヒットになる可能性があります。',
        detail: '読み込みだけを扱うため、この教材では書き込み時のライトスルー（Write Through）・ライトバック（Write Back）などを省いています。キャッシュは高速化の仕組みであり、正しい結果を保つためにはメモリとの整合も必要です。',
        signal: 'キャッシュ → CPU: 値 99',
        activeParts: ['cpu', 'cache'],
        cacheStatus: 'ラインの取り込み完了: 値 99 を返す',
        cacheLine: 'Line 12  |  0x2088 → 99',
        memoryStatus: '待機中',
      },
    ],
  },
]

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

function HardwareCard({
  title,
  subtitle,
  content,
  active,
  tone,
}: {
  title: string
  subtitle: string
  content: string
  active: boolean
  tone: 'cyan' | 'violet' | 'amber'
}) {
  const tones = {
    cyan: active ? 'border-cyan-400 bg-cyan-50 shadow-cyan-100' : 'border-slate-200 bg-slate-50',
    violet: active ? 'border-violet-400 bg-violet-50 shadow-violet-100' : 'border-slate-200 bg-slate-50',
    amber: active ? 'border-amber-400 bg-amber-50 shadow-amber-100' : 'border-slate-200 bg-slate-50',
  }
  const dot = { cyan: 'bg-cyan-500', violet: 'bg-violet-500', amber: 'bg-amber-500' }

  return <article className={`rounded-2xl border p-4 transition duration-200 ${tones[tone]} ${active ? 'shadow-sm' : ''}`}>
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-[10px] font-bold tracking-[.14em] text-slate-500">{subtitle}</p><h4 className="mt-1 text-base font-bold text-slate-900">{title}</h4></div>
      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${active ? dot[tone] : 'bg-slate-300'}`} aria-label={active ? 'この段階で使用中' : '待機中'} />
    </div>
    <code className="mt-4 block min-h-14 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-[11px] font-semibold leading-5 text-slate-800">{content}</code>
  </article>
}

/**
 * A pauseable read-path model for cache hit and miss. It deliberately focuses
 * on a single read and a representative cache-line fill, not cache policy.
 */
export function CacheMemoryLesson({ onNavigate }: CacheMemoryLessonProps) {
  const [scenarioId, setScenarioId] = useState<CacheScenario['id']>('hit')
  const [step, setStep] = useState(0)
  const scenario = CACHE_SCENARIOS.find(item => item.id === scenarioId) ?? CACHE_SCENARIOS[0]
  const current = scenario.steps[step]
  const active = (part: LessonPart) => current.activeParts.includes(part)

  const chooseScenario = (id: CacheScenario['id']) => {
    setScenarioId(id)
    setStep(0)
  }

  const reset = () => setStep(0)

  return <section aria-label="CPUキャッシュと主記憶のステップ図解" className="rounded-3xl border border-cyan-200 bg-cyan-50/45 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow">メモリを操作して学ぶ</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">CPUが値を読むとき、キャッシュは何を短くするのか</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="CPUは主記憶（メインメモリ）のすべてを同じ速さで読めるわけではありません。近くのキャッシュに必要な値がある場合と、主記憶まで読みに行く場合を、1つの読み取り要求で比べます。" onNavigate={onNavigate} /></p>
      </div>
      <span className="rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-bold text-cyan-800">{step + 1} / {scenario.steps.length}</span>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2" role="tablist" aria-label="キャッシュの例を選ぶ">
      {CACHE_SCENARIOS.map(item => <button
        key={item.id}
        id={`cache-scenario-${item.id}`}
        type="button"
        role="tab"
        aria-selected={scenarioId === item.id}
        aria-controls="cache-step-panel"
        onClick={() => chooseScenario(item.id)}
        className={`rounded-xl border px-4 py-3 text-left transition ${scenarioId === item.id ? 'border-cyan-500 bg-white text-cyan-950 shadow-sm' : 'border-cyan-100 bg-cyan-50 text-slate-600 hover:border-cyan-300 hover:bg-white'}`}
      >
        <span className="text-sm font-bold">{item.label}</span>
        <span className="mt-1 block text-xs leading-5">{item.description}</span>
      </button>)}
    </div>

    <div id="cache-step-panel" role="tabpanel" aria-labelledby={`cache-scenario-${scenarioId}`} className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div><p className="text-xs font-bold text-cyan-800">現在のデータの流れ</p><p className="mt-1 font-mono text-sm font-bold text-slate-900">{current.signal}</p></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setStep(value => Math.max(0, value - 1))} disabled={step === 0} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition enabled:hover:border-cyan-400 enabled:hover:text-cyan-800 disabled:cursor-not-allowed disabled:opacity-40">← 前の段階</button>
          <button type="button" onClick={() => setStep(value => Math.min(scenario.steps.length - 1, value + 1))} disabled={step === scenario.steps.length - 1} className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-bold text-white transition enabled:hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40">次の段階 →</button>
          <button type="button" onClick={reset} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-slate-900">最初に戻す</button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_1.2fr_auto_1fr] lg:items-center">
        <HardwareCard title="CPU" subtitle="命令を実行する" content={scenarioId === 'hit' ? '読み取り 0x1040' : '読み取り 0x2088'} active={active('cpu')} tone="cyan" />
        <span className={`hidden text-xl font-bold lg:block ${active('cpu') && active('cache') ? 'text-cyan-600' : 'text-slate-300'}`} aria-hidden="true">→</span>
        <HardwareCard title="キャッシュ（Cache）" subtitle="小さく高速な記憶領域" content={`${current.cacheStatus}\n${current.cacheLine}`} active={active('cache')} tone="violet" />
        <span className={`hidden text-xl font-bold lg:block ${active('memory') ? 'text-amber-600' : 'text-slate-300'}`} aria-hidden="true">→</span>
        <HardwareCard title="主記憶（メインメモリ）" subtitle="大きな主記憶" content={current.memoryStatus} active={active('memory')} tone="amber" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite">
          <p className="text-xs font-bold text-cyan-800">{current.shortTitle}</p>
          <h3 className="mt-1 text-base font-bold text-slate-900">{current.title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={current.body} onNavigate={onNavigate} /></p>
          <p className="mt-3 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><LinkedText text={current.detail} onNavigate={onNavigate} /></p>
        </article>
        <aside className="rounded-xl border border-violet-200 bg-violet-50 p-4">
          <p className="text-xs font-bold text-violet-900">この例で見るポイント</p>
          <ol className="mt-3 space-y-2 text-xs leading-6 text-slate-700">
            <li><span className="font-bold text-violet-800">1.</span> CPUはまずキャッシュを確認する</li>
            <li><span className="font-bold text-violet-800">2.</span> ヒットなら主記憶への待ちを避けられる</li>
            <li><span className="font-bold text-violet-800">3.</span> ミスなら近くのデータを含むラインを取り込む</li>
          </ol>
        </aside>
      </div>
    </div>

    <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>教材上の簡略化：</b>ここでは読み取りだけを扱い、1つのキャッシュと主記憶の代表的な経路を示しています。実際のCPUにはL1/L2/L3など複数階層のキャッシュ、セット連想、置換方針、プリフェッチ（prefetch）、書き込み方針、複数コア間のキャッシュコヒーレンス（Cache Coherence）などがあり、キャッシュラインの大きさも実装ごとに異なります。</p>
  </section>
}

export default CacheMemoryLesson
