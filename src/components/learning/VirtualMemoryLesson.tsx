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
    description: '必要なVirtual PageがすでにPhysical Memoryに載っている例です。',
    steps: [
      {
        shortTitle: 'Virtual address',
        title: 'CPUはVirtual Addressで値を読みたい',
        body: `CPUが ${VIRTUAL_ADDRESS} を読みます。この例では4 KiB Pageを使うため、Virtual Pageは ${VIRTUAL_PAGE}、Page内のOffsetは ${OFFSET} として分けて考えます。`,
        detail: '各Processは通常、自分専用に見えるVirtual Address Spaceを使います。Virtual AddressをそのままPhysical Memoryの番地として扱うのではなく、OSが用意した対応表を通して変換します。',
        signal: `CPU → address translation: ${VIRTUAL_ADDRESS}`,
        activeParts: ['cpu', 'page-table'],
        pageTable: `VPN ${VIRTUAL_PAGE}  |  確認中`,
        physicalMemory: 'Physical Frameを確認前',
        storage: '待機中',
      },
      {
        shortTitle: 'Page table lookup',
        title: 'Page Tableから、Virtual Pageに対応するFrameを探す',
        body: `Page TableのEntryは、Virtual Page ${VIRTUAL_PAGE} がPhysical Frame ${PHYSICAL_FRAME} に存在することを示しています。Presentのため、Page Faultは起きません。`,
        detail: '実際にはCPUのMMUがアドレス変換を支援し、TLBという小さな高速Cacheが変換結果を保持することがあります。この教材ではPage Tableを直接確認する流れとして示します。',
        signal: `Page Table: ${VIRTUAL_PAGE} → frame ${PHYSICAL_FRAME} (present)`,
        activeParts: ['page-table'],
        pageTable: `VPN ${VIRTUAL_PAGE}  →  PFN ${PHYSICAL_FRAME}  |  Present=1`,
        physicalMemory: `Frame ${PHYSICAL_FRAME} を選択`,
        storage: '待機中',
      },
      {
        shortTitle: 'Physical memory read',
        title: 'FrameとOffsetをつないで、Physical Memoryを読む',
        body: `Physical Frame ${PHYSICAL_FRAME} とOffset ${OFFSET} を組み合わせ、代表的なPhysical Address ${PHYSICAL_FRAME}_${OFFSET} を得ます。必要なPageはすでにRAMにあるため、そのまま値を読めます。`,
        detail: 'Page内のOffsetは変換の前後で変わりません。Pageの大きさが2のべき乗であるため、Addressの下位ビットをOffsetとして扱える、というのが基本的な考え方です。',
        signal: `Physical Memory: frame ${PHYSICAL_FRAME} + offset ${OFFSET}`,
        activeParts: ['memory'],
        pageTable: `VPN ${VIRTUAL_PAGE}  →  PFN ${PHYSICAL_FRAME}  |  Present=1`,
        physicalMemory: `Frame ${PHYSICAL_FRAME}  |  value = 42`,
        storage: 'アクセスしない',
      },
      {
        shortTitle: 'Return value',
        title: 'CPUが、変換された番地の値を受け取る',
        body: 'CPUはPhysical Memoryから値 42 を受け取り、命令の実行を続けます。Virtual Memoryによって、プログラムはPhysical Memoryの配置を直接意識せずに動けます。',
        detail: '同じVirtual Addressでも、別のProcessでは別のPhysical Frameへ対応付けられることがあります。これによりProcess間の保護やMemoryの柔軟な利用を助けます。',
        signal: 'Physical Memory → CPU: value 42',
        activeParts: ['cpu', 'memory'],
        pageTable: `VPN ${VIRTUAL_PAGE}  →  PFN ${PHYSICAL_FRAME}  |  Present=1`,
        physicalMemory: `Frame ${PHYSICAL_FRAME}  |  42 を返す`,
        storage: '待機中',
      },
    ],
  },
  {
    id: 'fault',
    label: 'Page Fault の例',
    description: '必要なVirtual PageがRAMにないため、OSが読み込みを調整する例です。',
    steps: [
      {
        shortTitle: 'Virtual address',
        title: 'CPUが、まだRAMにないVirtual Pageを参照する',
        body: `CPUは ${VIRTUAL_ADDRESS} を読みますが、この例ではVirtual Page ${VIRTUAL_PAGE} が現在Physical Memoryにありません。まず通常と同じようにAddress Translationを試みます。`,
        detail: 'Page Faultは、プログラムがVirtual Addressを使ったこと自体が誤りだという意味ではありません。適切なPageが一時的にRAMにない場合にも、正当なアクセスとして発生します。',
        signal: `CPU → address translation: ${VIRTUAL_ADDRESS}`,
        activeParts: ['cpu', 'page-table'],
        pageTable: `VPN ${VIRTUAL_PAGE}  |  確認中`,
        physicalMemory: '該当Pageは未配置',
        storage: 'Backing Storageに保存済み（例）',
      },
      {
        shortTitle: 'Not present',
        title: 'Page Tableが「現在RAMにない」と示す',
        body: `Page Table EntryのPresent bitが0のため、MMUは通常のMemory Readを続けられません。CPUはPage Faultという例外でOSに処理を渡します。`,
        detail: 'アクセス権がないPageを参照した場合も例外が起きますが、それは単に「Page Faultを解決して続ける」ケースとは異なります。この教材では、正当なPageをRAMへ読み込める代表例に絞ります。',
        signal: `Page Table: ${VIRTUAL_PAGE} → Present=0 → Page Fault`,
        activeParts: ['page-table', 'os'],
        pageTable: `VPN ${VIRTUAL_PAGE}  →  Present=0  |  Page Fault`,
        physicalMemory: '空きFrameまたは置換先を探す',
        storage: 'Pageを読み込む準備',
      },
      {
        shortTitle: 'OS handles fault',
        title: 'OSが、Pageをどこから読み込むか調整する',
        body: 'OSは、必要なPageが実行ファイル、メモリマップしたファイル、またはSwap領域などのどこにあるかを確認し、Physical Memory内のFrameを確保します。',
        detail: '空きFrameがない場合、OSはPage Replacementの方針で別のPageを追い出すことがあります。追い出すPageが変更済みなら、先に書き戻しが必要な場合もあります。ここではその選択を省きます。',
        signal: 'OS: source を決め、Frameを確保する',
        activeParts: ['os', 'memory', 'storage'],
        pageTable: `VPN ${VIRTUAL_PAGE}  →  Present=0（更新待ち）`,
        physicalMemory: `Frame ${PHYSICAL_FRAME} を確保（教育用の例）`,
        storage: 'Backing Storage → RAM へ読み込み中',
      },
      {
        shortTitle: 'Page in',
        title: 'Backing StorageからPageをRAMへ取り込む',
        body: `必要なPageをPhysical Frame ${PHYSICAL_FRAME} へ読み込み、Page Tableを更新します。この読み込みはRAM内の通常アクセスより時間がかかるため、Page Faultが多いと性能に影響します。`,
        detail: '「Backing Storage」はPageの出所をまとめて表した用語です。常にディスク上のSwapだけを意味するわけではなく、ファイルやゼロ初期化Pageなど、Pageの種類で扱いが異なります。',
        signal: `Backing Storage → frame ${PHYSICAL_FRAME}; Page Tableを更新`,
        activeParts: ['page-table', 'memory', 'storage'],
        pageTable: `VPN ${VIRTUAL_PAGE}  →  PFN ${PHYSICAL_FRAME}  |  Present=1`,
        physicalMemory: `Frame ${PHYSICAL_FRAME} へPageを配置`,
        storage: '読み込み完了',
      },
      {
        shortTitle: 'Retry access',
        title: '元の命令をやり直し、RAMから値を読む',
        body: 'Page Tableが更新されたため、OSは元の命令を再開できます。今度はVirtual PageがRAMに存在し、Physical Memoryから値を取得できます。',
        detail: 'Page Faultの処理後に命令を再試行できるよう、CPUとOSは例外発生時の状態を管理します。詳細な保存・復元の方式はアーキテクチャとOSにより異なります。',
        signal: `retry: frame ${PHYSICAL_FRAME} + offset ${OFFSET} → value 42`,
        activeParts: ['cpu', 'memory'],
        pageTable: `VPN ${VIRTUAL_PAGE}  →  PFN ${PHYSICAL_FRAME}  |  Present=1`,
        physicalMemory: `Frame ${PHYSICAL_FRAME}  |  value = 42`,
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

  return <section aria-label="Virtual MemoryとPagingのステップ図解" className="rounded-3xl border border-indigo-200 bg-indigo-50/45 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow text-indigo-700">INTERACTIVE VIRTUAL MEMORY</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">Virtual AddressがRAMへ届くまでを、止めて追う</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="Virtual Memoryでは、プログラムが使うVirtual AddressをPage TableでPhysical MemoryのFrameへ対応付けます。通常の変換とPage Faultを、同じAddressの例で見比べます。" onNavigate={onNavigate} /></p>
      </div>
      <span className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-800">{step + 1} / {scenario.steps.length}</span>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2" role="tablist" aria-label="Virtual Memoryの例を選ぶ">
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
        <MemoryPart title="CPU" subtitle="Virtual Addressを出す" content={`${VIRTUAL_ADDRESS}\nVPN ${VIRTUAL_PAGE} / offset ${OFFSET}`} active={active('cpu')} tone="sky" />
        <MemoryPart title="Page Table / MMU" subtitle="対応表で変換する" content={current.pageTable} active={active('page-table')} tone="indigo" />
        <MemoryPart title="Physical Memory" subtitle="RAMのFrame" content={current.physicalMemory} active={active('memory')} tone="emerald" />
        <MemoryPart title="OS" subtitle="Fault時に調整する" content={active('os') ? 'Page Fault handler が動作中' : '通常は変換を準備する'} active={active('os')} tone="violet" />
        <MemoryPart title="Backing Storage" subtitle="Pageの出所（例）" content={current.storage} active={active('storage')} tone="amber" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite">
          <p className="text-xs font-bold text-indigo-800">{current.shortTitle}</p>
          <h3 className="mt-1 text-base font-bold text-slate-900">{current.title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={current.body} onNavigate={onNavigate} /></p>
          <p className="mt-3 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><LinkedText text={current.detail} onNavigate={onNavigate} /></p>
        </article>
        <aside className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-xs font-bold text-indigo-900">Addressを分けて考える</p>
          <dl className="mt-3 space-y-2 text-xs leading-6 text-slate-700">
            <div className="rounded-lg border border-white bg-white/80 px-3 py-2"><dt className="font-bold text-indigo-900">Virtual Page Number</dt><dd className="font-mono">{VIRTUAL_PAGE}</dd></div>
            <div className="rounded-lg border border-white bg-white/80 px-3 py-2"><dt className="font-bold text-indigo-900">Page Offset</dt><dd className="font-mono">{OFFSET}（変換後も同じ）</dd></div>
            <div className="rounded-lg border border-white bg-white/80 px-3 py-2"><dt className="font-bold text-indigo-900">Physical Frame Number</dt><dd className="font-mono">{PHYSICAL_FRAME}（Presentなら取得）</dd></div>
          </dl>
        </aside>
      </div>
    </div>

    <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>教材上の簡略化：</b>この例は4 KiB Page、単純なPage Table、1つのBacking Storage経路を使う概念モデルです。実際にはTLB、多段Page Table、Page Replacement、Copy-on-Write、Memory-mapped file、アクセス権、複数Process・複数CPUなどが関係します。Page Faultが常にディスク読み込みを意味するわけでもありません。</p>
  </section>
}

export default VirtualMemoryLesson
