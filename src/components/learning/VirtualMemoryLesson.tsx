import { useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type VirtualMemoryLessonProps = {
  onNavigate: Navigate
}

type LessonPart = 'cpu' | 'page-table' | 'memory' | 'storage' | 'os'

type VirtualMemoryStep = {
  shortTitle: string
  title: string
  body: string
  detail: string
  signal: string
  activeParts: LessonPart[]
  pageTable: string
  physicalMemory: string
  storage: string
}

type VirtualMemoryScenario = {
  id: 'present' | 'fault'
  label: string
  description: string
  steps: VirtualMemoryStep[]
}

const VIRTUAL_ADDRESS = '0x0040_1234'
const VIRTUAL_PAGE = '0x00401'
const OFFSET = '0x234'
const PHYSICAL_FRAME = '0x01A7'

const MEMORY_SCENARIOS: VirtualMemoryScenario[] = [
  {
    id: 'present',
    label: '通常アクセス',
    description: '必要な仮想ページ（Virtual Page）がすでに物理メモリに載っている例です。',
    steps: [
      {
        shortTitle: '仮想アドレス',
        title: 'CPUは仮想アドレス（Virtual Address）で値を読みたい',
        body: `CPUが ${VIRTUAL_ADDRESS} を読みます。この例では4 KiBのページを使うため、仮想ページは ${VIRTUAL_PAGE}、ページ内のオフセット（Offset）は ${OFFSET} として分けて考えます。`,
        detail: '各プロセス（Process）は通常、自分専用に見える仮想アドレス空間（Virtual Address Space）を使います。仮想アドレスをそのまま物理メモリの番地として扱うのではなく、OSが用意した対応表を通して変換します。',
        signal: `CPU → アドレス変換: ${VIRTUAL_ADDRESS}`,
        activeParts: ['cpu', 'page-table'],
        pageTable: `VPN ${VIRTUAL_PAGE}  |  確認中`,
        physicalMemory: '物理フレームを確認前',
        storage: '待機中',
      },
      {
        shortTitle: 'ページテーブルを引く',
        title: 'ページテーブル（Page Table）から、仮想ページに対応するフレームを探す',
        body: `ページテーブルのエントリ（Entry）は、仮想ページ ${VIRTUAL_PAGE} が物理フレーム（Physical Frame）${PHYSICAL_FRAME} に存在することを示しています。配置済み（Present）のため、ページフォールト（Page Fault）は起きません。`,
        detail: '実際にはCPUのMMUがアドレス変換を支援し、TLBという小さな高速キャッシュが変換結果を保持することがあります。この教材ではページテーブルを直接確認する流れとして示します。',
        signal: `ページテーブル: ${VIRTUAL_PAGE} → フレーム ${PHYSICAL_FRAME}（配置済み）`,
        activeParts: ['page-table'],
        pageTable: `VPN ${VIRTUAL_PAGE}  →  PFN ${PHYSICAL_FRAME}  |  Present=1`,
        physicalMemory: `フレーム ${PHYSICAL_FRAME} を選択`,
        storage: '待機中',
      },
      {
        shortTitle: '物理メモリを読む',
        title: 'フレームとオフセットをつないで、物理メモリを読む',
        body: `物理フレーム ${PHYSICAL_FRAME} とオフセット ${OFFSET} を組み合わせ、代表的な物理アドレス（Physical Address）${PHYSICAL_FRAME}_${OFFSET} を得ます。必要なページはすでにRAMにあるため、そのまま値を読めます。`,
        detail: 'ページ内のオフセットは変換の前後で変わりません。ページの大きさが2のべき乗であるため、アドレス（Address）の下位ビットをオフセットとして扱える、というのが基本的な考え方です。',
        signal: `物理メモリ: フレーム ${PHYSICAL_FRAME} + オフセット ${OFFSET}`,
        activeParts: ['memory'],
        pageTable: `VPN ${VIRTUAL_PAGE}  →  PFN ${PHYSICAL_FRAME}  |  Present=1`,
        physicalMemory: `フレーム ${PHYSICAL_FRAME}  |  値 = 42`,
        storage: 'アクセスしない',
      },
      {
        shortTitle: '値を返す',
        title: 'CPUが、変換された番地の値を受け取る',
        body: 'CPUは物理メモリから値 42 を受け取り、命令の実行を続けます。仮想メモリ（Virtual Memory）によって、プログラムは物理メモリの配置を直接意識せずに動けます。',
        detail: '同じ仮想アドレスでも、別のプロセスでは別の物理フレームへ対応付けられることがあります。これによりプロセス間の保護やメモリの柔軟な利用を助けます。',
        signal: '物理メモリ → CPU: 値 42',
        activeParts: ['cpu', 'memory'],
        pageTable: `VPN ${VIRTUAL_PAGE}  →  PFN ${PHYSICAL_FRAME}  |  Present=1`,
        physicalMemory: `フレーム ${PHYSICAL_FRAME}  |  42 を返す`,
        storage: '待機中',
      },
    ],
  },
  {
    id: 'fault',
    label: 'ページフォールト（Page Fault）の例',
    description: '必要な仮想ページがRAMにないため、OSが読み込みを調整する例です。',
    steps: [
      {
        shortTitle: '仮想アドレス',
        title: 'CPUが、まだRAMにない仮想ページを参照する',
        body: `CPUは ${VIRTUAL_ADDRESS} を読みますが、この例では仮想ページ ${VIRTUAL_PAGE} が現在物理メモリにありません。まず通常と同じようにアドレス変換を試みます。`,
        detail: 'ページフォールトは、プログラムが仮想アドレスを使ったこと自体が誤りだという意味ではありません。適切なページが一時的にRAMにない場合にも、正当なアクセスとして発生します。',
        signal: `CPU → アドレス変換: ${VIRTUAL_ADDRESS}`,
        activeParts: ['cpu', 'page-table'],
        pageTable: `VPN ${VIRTUAL_PAGE}  |  確認中`,
        physicalMemory: '該当ページは未配置',
        storage: 'バックイングストレージに保存済み（例）',
      },
      {
        shortTitle: '未配置を検出する',
        title: 'ページテーブルが「現在RAMにない」と示す',
        body: `ページテーブルのエントリにある配置済みビット（Present bit）が0のため、MMUは通常のメモリ読み取りを続けられません。CPUはページフォールトという例外でOSに処理を渡します。`,
        detail: 'アクセス権がないページを参照した場合も例外が起きますが、それは単に「ページフォールトを解決して続ける」ケースとは異なります。この教材では、正当なページをRAMへ読み込める代表例に絞ります。',
        signal: `ページテーブル: ${VIRTUAL_PAGE} → 配置済み=0 → ページフォールト`,
        activeParts: ['page-table', 'os'],
        pageTable: `VPN ${VIRTUAL_PAGE}  →  Present=0  |  Page Fault`,
        physicalMemory: '空きフレームまたは置換先を探す',
        storage: 'ページを読み込む準備',
      },
      {
        shortTitle: 'OSが例外を処理する',
        title: 'OSが、ページをどこから読み込むか調整する',
        body: 'OSは、必要なページが実行ファイル、メモリマップしたファイル、またはスワップ（Swap）領域などのどこにあるかを確認し、物理メモリ内のフレームを確保します。',
        detail: '空きフレームがない場合、OSはページ置換（Page Replacement）の方針で別のページを追い出すことがあります。追い出すページが変更済みなら、先に書き戻しが必要な場合もあります。ここではその選択を省きます。',
        signal: 'OS: 読み込み元を決め、フレームを確保する',
        activeParts: ['os', 'memory', 'storage'],
        pageTable: `VPN ${VIRTUAL_PAGE}  →  Present=0（更新待ち）`,
        physicalMemory: `フレーム ${PHYSICAL_FRAME} を確保（教育用の例）`,
        storage: 'バックイングストレージ → RAM へ読み込み中',
      },
      {
        shortTitle: 'ページを取り込む',
        title: 'バックイングストレージ（Backing Storage）からページをRAMへ取り込む',
        body: `必要なページを物理フレーム ${PHYSICAL_FRAME} へ読み込み、ページテーブルを更新します。この読み込みはRAM内の通常アクセスより時間がかかるため、ページフォールトが多いと性能に影響します。`,
        detail: '「バックイングストレージ」はページの出所をまとめて表した用語です。常にディスク上のスワップだけを意味するわけではなく、ファイルやゼロ初期化ページなど、ページの種類で扱いが異なります。',
        signal: `バックイングストレージ → フレーム ${PHYSICAL_FRAME}; ページテーブルを更新`,
        activeParts: ['page-table', 'memory', 'storage'],
        pageTable: `VPN ${VIRTUAL_PAGE}  →  PFN ${PHYSICAL_FRAME}  |  Present=1`,
        physicalMemory: `フレーム ${PHYSICAL_FRAME} へページを配置`,
        storage: '読み込み完了',
      },
      {
        shortTitle: 'アクセスをやり直す',
        title: '元の命令をやり直し、RAMから値を読む',
        body: 'ページテーブルが更新されたため、OSは元の命令を再開できます。今度は仮想ページがRAMに存在し、物理メモリから値を取得できます。',
        detail: 'ページフォールトの処理後に命令を再試行できるよう、CPUとOSは例外発生時の状態を管理します。詳細な保存・復元の方式はアーキテクチャとOSにより異なります。',
        signal: `再試行: フレーム ${PHYSICAL_FRAME} + オフセット ${OFFSET} → 値 42`,
        activeParts: ['cpu', 'memory'],
        pageTable: `VPN ${VIRTUAL_PAGE}  →  PFN ${PHYSICAL_FRAME}  |  Present=1`,
        physicalMemory: `フレーム ${PHYSICAL_FRAME}  |  値 = 42`,
        storage: '待機中',
      },
    ],
  },
]

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

function MemoryPart({
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
  tone: 'sky' | 'indigo' | 'emerald' | 'amber' | 'violet'
}) {
  const tones = {
    sky: active ? 'border-sky-400 bg-sky-50 shadow-sky-100' : 'border-slate-200 bg-slate-50',
    indigo: active ? 'border-indigo-400 bg-indigo-50 shadow-indigo-100' : 'border-slate-200 bg-slate-50',
    emerald: active ? 'border-emerald-400 bg-emerald-50 shadow-emerald-100' : 'border-slate-200 bg-slate-50',
    amber: active ? 'border-amber-400 bg-amber-50 shadow-amber-100' : 'border-slate-200 bg-slate-50',
    violet: active ? 'border-violet-400 bg-violet-50 shadow-violet-100' : 'border-slate-200 bg-slate-50',
  }
  const dots = { sky: 'bg-sky-500', indigo: 'bg-indigo-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', violet: 'bg-violet-500' }

  return <article className={`rounded-xl border p-3 transition duration-200 ${tones[tone]} ${active ? 'shadow-sm' : ''}`}>
    <div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-bold tracking-[.14em] text-slate-500">{subtitle}</p><h4 className="mt-1 text-sm font-bold text-slate-900">{title}</h4></div><span className={`mt-1 h-2.5 w-2.5 rounded-full ${active ? dots[tone] : 'bg-slate-300'}`} aria-label={active ? 'この段階で使用中' : '待機中'} /></div>
    <code className="mt-3 block min-h-12 rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-mono text-[10px] font-semibold leading-5 text-slate-800">{content}</code>
  </article>
}

/**
 * A step-through virtual-memory model. It uses a fixed page size and one
 * representative backing-store path so the translation and fault boundary
 * remain legible without imitating a real OS implementation.
 */
export function VirtualMemoryLesson({ onNavigate }: VirtualMemoryLessonProps) {
  const [scenarioId, setScenarioId] = useState<VirtualMemoryScenario['id']>('present')
  const [step, setStep] = useState(0)
  const scenario = MEMORY_SCENARIOS.find(item => item.id === scenarioId) ?? MEMORY_SCENARIOS[0]
  const current = scenario.steps[step]
  const active = (part: LessonPart) => current.activeParts.includes(part)

  const chooseScenario = (id: VirtualMemoryScenario['id']) => {
    setScenarioId(id)
    setStep(0)
  }

  const reset = () => setStep(0)

  return <section aria-label="仮想メモリとページングのステップ図解" className="rounded-3xl border border-indigo-200 bg-indigo-50/45 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow text-indigo-700">仮想メモリを操作して学ぶ</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">仮想アドレスがRAMへ届くまでを、止めて追う</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="仮想メモリでは、プログラムが使う仮想アドレスをページテーブルで物理メモリのフレームへ対応付けます。通常の変換とページフォールトを、同じアドレスの例で見比べます。" onNavigate={onNavigate} /></p>
      </div>
      <span className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-800">{step + 1} / {scenario.steps.length}</span>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2" role="tablist" aria-label="仮想メモリの例を選ぶ">
      {MEMORY_SCENARIOS.map(item => <button
        key={item.id}
        id={`vm-scenario-${item.id}`}
        type="button"
        role="tab"
        aria-selected={scenarioId === item.id}
        aria-controls="vm-step-panel"
        onClick={() => chooseScenario(item.id)}
        className={`rounded-xl border px-4 py-3 text-left transition ${scenarioId === item.id ? 'border-indigo-500 bg-white text-indigo-950 shadow-sm' : 'border-indigo-100 bg-indigo-50 text-slate-600 hover:border-indigo-300 hover:bg-white'}`}
      >
        <span className="text-sm font-bold">{item.label}</span>
        <span className="mt-1 block text-xs leading-5">{item.description}</span>
      </button>)}
    </div>

    <div id="vm-step-panel" role="tabpanel" aria-labelledby={`vm-scenario-${scenarioId}`} className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div><p className="text-xs font-bold text-indigo-800">現在の変換・読み込みの流れ</p><p className="mt-1 font-mono text-sm font-bold text-slate-900">{current.signal}</p></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setStep(value => Math.max(0, value - 1))} disabled={step === 0} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition enabled:hover:border-indigo-400 enabled:hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-40">← 前の段階</button>
          <button type="button" onClick={() => setStep(value => Math.min(scenario.steps.length - 1, value + 1))} disabled={step === scenario.steps.length - 1} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">次の段階 →</button>
          <button type="button" onClick={reset} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-slate-900">最初に戻す</button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MemoryPart title="CPU" subtitle="仮想アドレスを出す" content={`${VIRTUAL_ADDRESS}\nVPN ${VIRTUAL_PAGE} / オフセット ${OFFSET}`} active={active('cpu')} tone="sky" />
        <MemoryPart title="ページテーブル / MMU" subtitle="対応表で変換する" content={current.pageTable} active={active('page-table')} tone="indigo" />
        <MemoryPart title="物理メモリ" subtitle="RAMのフレーム" content={current.physicalMemory} active={active('memory')} tone="emerald" />
        <MemoryPart title="OS" subtitle="例外時に調整する" content={active('os') ? 'ページフォールトの処理中' : '通常は変換を準備する'} active={active('os')} tone="violet" />
        <MemoryPart title="バックイングストレージ" subtitle="ページの出所（例）" content={current.storage} active={active('storage')} tone="amber" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite">
          <p className="text-xs font-bold text-indigo-800">{current.shortTitle}</p>
          <h3 className="mt-1 text-base font-bold text-slate-900">{current.title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={current.body} onNavigate={onNavigate} /></p>
          <p className="mt-3 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><LinkedText text={current.detail} onNavigate={onNavigate} /></p>
        </article>
        <aside className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-xs font-bold text-indigo-900">アドレスを分けて考える</p>
          <dl className="mt-3 space-y-2 text-xs leading-6 text-slate-700">
            <div className="rounded-lg border border-white bg-white/80 px-3 py-2"><dt className="font-bold text-indigo-900">仮想ページ番号（Virtual Page Number）</dt><dd className="font-mono">{VIRTUAL_PAGE}</dd></div>
            <div className="rounded-lg border border-white bg-white/80 px-3 py-2"><dt className="font-bold text-indigo-900">ページオフセット（Page Offset）</dt><dd className="font-mono">{OFFSET}（変換後も同じ）</dd></div>
            <div className="rounded-lg border border-white bg-white/80 px-3 py-2"><dt className="font-bold text-indigo-900">物理フレーム番号（Physical Frame Number）</dt><dd className="font-mono">{PHYSICAL_FRAME}（配置済みなら取得）</dd></div>
          </dl>
        </aside>
      </div>
    </div>

    <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>教材上の簡略化：</b>この例は4 KiBのページ、単純なページテーブル、1つのバックイングストレージ経路を使う概念モデルです。実際にはTLB、多段ページテーブル、ページ置換、コピーオンライト（Copy-on-Write）、メモリマップトファイル（Memory-mapped file）、アクセス権、複数プロセス・複数CPUなどが関係します。ページフォールトが常にディスク読み込みを意味するわけでもありません。</p>
  </section>
}

export default VirtualMemoryLesson
