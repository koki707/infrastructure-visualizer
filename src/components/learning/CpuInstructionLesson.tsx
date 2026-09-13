import { useState, type ReactNode } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type CpuInstructionLessonProps = {
  onNavigate: Navigate
}

type InstructionStep = {
  shortTitle: 'Fetch' | 'Decode' | 'Execute' | 'Writeback'
  title: string
  body: string
  detail: string
  activeParts: Array<'memory' | 'pc' | 'ir' | 'control' | 'registers' | 'alu'>
  pc: string
  ir: string
  r1: string
  r2: string
  r3: string
  alu: string
  signal: string
}

const INSTRUCTION_STEPS: InstructionStep[] = [
  {
    shortTitle: 'Fetch',
    title: '次に実行する命令をMemoryから取り出す',
    body: 'Program Counter（PC）が指す番地を使ってMemoryを読み、命令をInstruction Register（IR）へ入れます。この例では、番地 0x0040 にある ADD R1, R2, R3 を取り出します。',
    detail: 'PCは「次に読む命令の位置」を表すためのレジスタです。この例では説明のため4 byte固定長命令のモデルとして、PCを 0x0040 から 0x0044 へ進めています。実際にどのように次の位置を決めるかは、命令セットや実装によって異なります。',
    activeParts: ['memory', 'pc', 'ir'],
    pc: '0x0040 → 0x0044',
    ir: 'ADD R1, R2, R3',
    r1: '—',
    r2: '7',
    r3: '5',
    alu: '待機中',
    signal: 'Memory → IR',
  },
  {
    shortTitle: 'Decode',
    title: '命令の意味と必要な入力を読み解く',
    body: 'Control UnitはIRのビット列を解釈し、この命令が加算であること、結果をR1へ書くこと、R2とR3の値が必要であることを決めます。',
    detail: 'Decodeは人が文字列を読む処理ではありません。CPUは命令セットで定められたビットの並びを回路で判別し、制御信号を作ります。',
    activeParts: ['ir', 'control', 'registers'],
    pc: '0x0044',
    ir: 'ADD R1, R2, R3',
    r1: '書き込み先',
    r2: '7（入力）',
    r3: '5（入力）',
    alu: '加算を選択',
    signal: 'IR → Control Unit → Registers',
  },
  {
    shortTitle: 'Execute',
    title: 'ALUが指定された演算を行う',
    body: 'Registerから渡された R2=7 と R3=5 をALUが加算します。演算の結果は 12 です。この段階では、結果がまだR1へ確定していないモデルとして示しています。',
    detail: 'ALUは加算だけでなく、減算、比較、AND、ORなどを担当します。実際のCPUでは命令により別の演算器やデータ経路が使われることがあります。',
    activeParts: ['control', 'registers', 'alu'],
    pc: '0x0044',
    ir: 'ADD R1, R2, R3',
    r1: '書き込み待ち',
    r2: '7 → ALU',
    r3: '5 → ALU',
    alu: '7 + 5 = 12',
    signal: 'R2 / R3 → ALU',
  },
  {
    shortTitle: 'Writeback',
    title: '演算結果を行き先のRegisterへ書き戻す',
    body: 'ALUの結果 12 をR1へ書き戻します。これで、このADD命令の結果を後続の命令が利用できる状態になります。',
    detail: '「Writeback」という名前の段階を明確に持つか、どの時点で結果を見えるようにするかはCPUの設計で変わります。ここではデータの流れを分けて理解するために表示しています。',
    activeParts: ['registers', 'alu'],
    pc: '0x0044',
    ir: 'ADD R1, R2, R3',
    r1: '12（結果）',
    r2: '7',
    r3: '5',
    alu: '結果 12 → R1',
    signal: 'ALU → R1',
  },
]

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

function PartCard({ title, subtitle, active, children }: { title: string; subtitle: string; active: boolean; children: ReactNode }) {
  return <article className={`rounded-xl border p-3 transition duration-200 ${active ? 'border-cyan-400 bg-cyan-50 shadow-sm shadow-cyan-100' : 'border-slate-200 bg-slate-50'}`}>
    <div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-bold tracking-wide text-slate-500">{subtitle}</p><h4 className="mt-1 text-sm font-bold text-slate-900">{title}</h4></div><span className={`mt-0.5 h-2.5 w-2.5 rounded-full ${active ? 'bg-cyan-500' : 'bg-slate-300'}`} aria-label={active ? 'この段階で使用中' : '待機中'} /></div>
    <div className="mt-3">{children}</div>
  </article>
}

/**
 * A small, manual step-through instruction-cycle model. It deliberately uses
 * a single ADD instruction so learners can pause at each transfer of values.
 */
export function CpuInstructionLesson({ onNavigate }: CpuInstructionLessonProps) {
  const [step, setStep] = useState(0)
  const current = INSTRUCTION_STEPS[step]
  const isActive = (part: InstructionStep['activeParts'][number]) => current.activeParts.includes(part)

  return <section aria-label="CPU命令実行のステップ図解" className="rounded-3xl border border-cyan-200 bg-cyan-50/45 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow">INTERACTIVE CPU</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">1つの命令を、止めながらCPUの中で追う</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="ADD R1, R2, R3 という1つの命令を例に、Memory、Register、Control Unit、ALUの間で値がどう動くかを段階ごとに確認します。" onNavigate={onNavigate} /></p>
      </div>
      <span className="rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-bold text-cyan-800">{step + 1} / {INSTRUCTION_STEPS.length}</span>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="tablist" aria-label="CPU命令実行の段階">
      {INSTRUCTION_STEPS.map((item, index) => <button key={item.shortTitle} id={`cpu-step-${index}`} type="button" role="tab" aria-selected={step === index} aria-controls="cpu-step-panel" onClick={() => setStep(index)} className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${step === index ? 'border-cyan-500 bg-white text-cyan-900 shadow-sm' : 'border-cyan-100 bg-cyan-50 text-slate-600 hover:border-cyan-300 hover:bg-white'}`}>
        <span className="block text-[10px] text-cyan-700">{index + 1}</span><span className="mt-1 block">{item.shortTitle}</span>
      </button>)}
    </div>

    <div id="cpu-step-panel" role="tabpanel" aria-labelledby={`cpu-step-${step}`} className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div><p className="text-xs font-bold text-cyan-800">現在の信号の流れ</p><p className="mt-1 font-mono text-sm font-bold text-slate-900">{current.signal}</p></div>
        <div className="flex gap-2"><button type="button" disabled={step === 0} onClick={() => setStep(value => Math.max(0, value - 1))} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition enabled:hover:border-cyan-400 enabled:hover:text-cyan-800 disabled:cursor-not-allowed disabled:opacity-40">← 前の段階</button><button type="button" disabled={step === INSTRUCTION_STEPS.length - 1} onClick={() => setStep(value => Math.min(INSTRUCTION_STEPS.length - 1, value + 1))} className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-bold text-white transition enabled:hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40">次の段階 →</button></div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1.15fr_1fr]">
        <PartCard title="Instruction Memory" subtitle="プログラムを読む" active={isActive('memory')}><div className="rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs text-slate-100"><span className="text-cyan-300">0x0040</span>  ADD R1, R2, R3</div><p className="mt-2 text-xs leading-5 text-slate-600">この例では、命令がここにあると考えます。</p></PartCard>
        <PartCard title="Control Unit" subtitle="命令を解釈して制御する" active={isActive('control')}><div className="grid gap-2 sm:grid-cols-2"><div className={`rounded-lg px-3 py-2 text-xs font-semibold ${isActive('pc') ? 'bg-cyan-100 text-cyan-950' : 'bg-slate-100 text-slate-700'}`}>PC<br /><code className="font-mono">{current.pc}</code></div><div className={`rounded-lg px-3 py-2 text-xs font-semibold ${isActive('ir') ? 'bg-cyan-100 text-cyan-950' : 'bg-slate-100 text-slate-700'}`}>IR<br /><code className="font-mono text-[10px]">{current.ir}</code></div></div><p className="mt-2 text-xs leading-5 text-slate-600">命令に応じて、どのデータ経路を使うかを制御します。</p></PartCard>
        <PartCard title="ALU" subtitle="演算を行う" active={isActive('alu')}><div className={`rounded-lg px-3 py-2 font-mono text-sm font-bold ${isActive('alu') ? 'bg-violet-100 text-violet-950' : 'bg-slate-100 text-slate-600'}`}>{current.alu}</div><p className="mt-2 text-xs leading-5 text-slate-600"><LinkedText text="ALUは加算・比較・論理演算などを担当します。" onNavigate={onNavigate} /></p></PartCard>
      </div>

      <PartCard title="Registers" subtitle="すぐに使う値を保持する小さな記憶領域" active={isActive('registers')}><div className="grid gap-2 sm:grid-cols-3"><div className={`rounded-lg border px-3 py-2 ${current.r1.includes('12') ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}><p className="text-[10px] font-bold text-slate-500">R1（書き込み先）</p><code className="mt-1 block font-mono text-sm font-bold text-slate-900">{current.r1}</code></div><div className="rounded-lg border border-slate-200 bg-white px-3 py-2"><p className="text-[10px] font-bold text-slate-500">R2</p><code className="mt-1 block font-mono text-sm font-bold text-slate-900">{current.r2}</code></div><div className="rounded-lg border border-slate-200 bg-white px-3 py-2"><p className="text-[10px] font-bold text-slate-500">R3</p><code className="mt-1 block font-mono text-sm font-bold text-slate-900">{current.r3}</code></div></div></PartCard>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite"><p className="text-xs font-bold text-cyan-800">{current.shortTitle}</p><h3 className="mt-1 text-base font-bold text-slate-900">{current.title}</h3><p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={current.body} onNavigate={onNavigate} /></p><p className="mt-3 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><LinkedText text={current.detail} onNavigate={onNavigate} /></p></article>
        <aside className="rounded-xl border border-violet-200 bg-violet-50 p-4"><p className="text-xs font-bold text-violet-900">この段階で見るポイント</p><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700"><li><span className="font-bold text-violet-800">1.</span> 命令はMemoryから取り出す</li><li><span className="font-bold text-violet-800">2.</span> Control Unitがデータ経路を選ぶ</li><li><span className="font-bold text-violet-800">3.</span> 結果はRegisterへ戻る</li></ul></aside>
      </div>
    </div>

    <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>教材上の簡略化：</b>ここでは理解のため、1命令を Fetch → Decode → Execute → Writeback と順番に止めています。実際のCPUでは命令セット、Cache、Pipeline、分岐予測、複数の演算器などによって、複数命令の処理が重なったり順序が変わったりします。</p>
  </section>
}

export default CpuInstructionLesson
