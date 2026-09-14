import { useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type ProcessSchedulingLessonProps = {
  onNavigate: Navigate
}

type ProcessState = 'ready' | 'running' | 'waiting'

type SchedulingStep = {
  shortTitle: string
  title: string
  body: string
  detail: string
  processA: ProcessState
  processB: ProcessState
  cpuOwner: 'A' | 'B' | 'none'
  event: string
  savedContext: string
}

const SCHEDULING_STEPS: SchedulingStep[] = [
  {
    shortTitle: '実行待ち',
    title: '実行したい仕事が、実行待ちキュー（Ready Queue）で待っている',
    body: 'プロセスAとプロセスBは、CPUを使える状態ですが、同時には実行できません。スケジューラ（Scheduler）は実行待ち（Ready）状態の候補から、次にCPUを使う実行単位を選びます。',
    detail: 'ここでは状態を見やすくするため、プロセスA/Bを実行単位として表示します。多くのOSではスケジューラが直接選ぶのはスレッド（Thread）です。複数コアがあれば複数の実行単位が同時に実行中（Running）になれますが、それぞれのコアごとに選択が必要です。',
    processA: 'ready',
    processB: 'ready',
    cpuOwner: 'none',
    event: 'スケジューラが候補を選ぶ',
    savedContext: 'まだ切り替え前',
  },
  {
    shortTitle: 'Aを実行',
    title: 'スケジューラがプロセスAを選び、CPUで実行する',
    body: 'スケジューラがプロセスAを選ぶと、Aの実行に必要な状態をCPUへ戻し、Aが実行中（Running）になります。プロセスBは実行待ちキューで待ち続けます。',
    detail: '実行に必要な状態には、次に実行する位置を表すプログラムカウンタ（Program Counter）、レジスタ（Register）の値、スタックポインタ（Stack Pointer）などが含まれます。何を保存するかはCPUの仕様やOSの実装で異なります。',
    processA: 'running',
    processB: 'ready',
    cpuOwner: 'A',
    event: 'Aの実行状態（コンテキスト）を復元 → CPUで実行',
    savedContext: 'A: PC=0x1204 / R1=7',
  },
  {
    shortTitle: '切り替え',
    title: '時間経過などをきっかけに、Aの状態を保存する',
    body: 'タイムスライスの終了や割り込みなどをきっかけに、OSはAの実行をいったん止めます。Aの実行状態（コンテキスト）を保存して実行待ち（Ready）状態へ戻し、別の候補を実行できるようにします。',
    detail: 'コンテキストスイッチ（Context Switch）には時間がかかります。切り替え中はアプリケーションの仕事が進まないため、OSは応答性と切り替えコストのバランスを考えます。',
    processA: 'ready',
    processB: 'ready',
    cpuOwner: 'none',
    event: 'Aの実行状態を保存 → 実行待ちキューへ',
    savedContext: 'A: PC=0x1204 / R1=7 を保存',
  },
  {
    shortTitle: 'Bを実行',
    title: 'プロセスBの状態を復元して、CPUを渡す',
    body: 'スケジューラは次の候補としてプロセスBを選びます。Bの実行状態を復元すると、CPUはBが前回止まった位置から処理を続けられます。',
    detail: '見かけ上は複数のプログラムが同時に動いているように見えても、1コアでは短い時間ごとに実行対象を切り替えている場合があります。',
    processA: 'ready',
    processB: 'running',
    cpuOwner: 'B',
    event: 'Bの実行状態を復元 → CPUで実行',
    savedContext: 'B: PC=0x0810 / R1=42 を復元',
  },
  {
    shortTitle: 'I/O待ち',
    title: 'BがI/Oを待つ間、CPUは別の仕事へ回せる',
    body: 'Bがディスクやネットワークなどの入出力（I/O）完了を待つ必要があると、Bは待機中（Waiting）状態になります。スケジューラはCPUを空けず、実行待ち（Ready）状態のAを選んで実行できます。',
    detail: '入出力（I/O）完了の通知は割り込みなどを通じてOSへ届くことがあります。待機中（Waiting）から実行待ち（Ready）へ戻る時点と、すぐにCPUを得られるかは、ほかの候補やスケジューリング方針によって変わります。',
    processA: 'running',
    processB: 'waiting',
    cpuOwner: 'A',
    event: 'Bが待機中へ → Aを再び実行',
    savedContext: 'B: I/O完了待ち / A: PC=0x1204 を復元',
  },
]

const STATE_LABEL: Record<ProcessState, string> = {
  ready: '実行待ち（Ready）',
  running: '実行中（Running）',
  waiting: '待機中（Waiting）',
}

const STATE_STYLE: Record<ProcessState, string> = {
  ready: 'border-sky-200 bg-sky-50 text-sky-900',
  running: 'border-emerald-300 bg-emerald-50 text-emerald-950',
  waiting: 'border-amber-300 bg-amber-50 text-amber-950',
}

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

function ProcessCard({ name, state, active, context }: { name: string; state: ProcessState; active: boolean; context: string }) {
  return <article className={`rounded-xl border p-4 transition duration-200 ${active ? 'border-emerald-400 bg-emerald-50 shadow-sm shadow-emerald-100' : 'border-slate-200 bg-white'}`}>
    <div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-bold tracking-wide text-slate-500">実行単位</p><h4 className="mt-1 text-base font-bold text-slate-900">プロセス {name}</h4></div><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${STATE_STYLE[state]}`}>{STATE_LABEL[state]}</span></div>
    <div className="mt-4 rounded-lg bg-slate-900 px-3 py-2 font-mono text-[11px] text-slate-100"><span className="text-slate-400">実行状態（コンテキスト）</span><br />{context}</div>
  </article>
}

/**
 * A pauseable single-core scheduler model. It uses processes as the visible
 * unit, while explaining that many real schedulers choose threads instead.
 */
export function ProcessSchedulingLesson({ onNavigate }: ProcessSchedulingLessonProps) {
  const [step, setStep] = useState(0)
  const current = SCHEDULING_STEPS[step]

  return <section aria-label="OSのスケジューリングとコンテキストスイッチのステップ図解" className="rounded-3xl border border-indigo-200 bg-indigo-50/45 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow text-indigo-700">操作して学ぶOS</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">CPUを、複数の仕事へどう割り当てるか</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="この教材では説明のためプロセスAとプロセスBを実行単位として表示し、1つのCPUコアで動かします。多くのOSではスケジューラ（Scheduler）はスレッド（Thread）を選びます。実行待ち・実行中・待機中の状態、スケジューラ、コンテキストスイッチを止めながら確認します。" onNavigate={onNavigate} /></p>
      </div>
      <span className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-800">{step + 1} / {SCHEDULING_STEPS.length}</span>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" role="tablist" aria-label="スケジューリングの段階">
      {SCHEDULING_STEPS.map((item, index) => <button key={item.shortTitle} id={`schedule-step-${index}`} type="button" role="tab" aria-selected={step === index} aria-controls="schedule-step-panel" onClick={() => setStep(index)} className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${step === index ? 'border-indigo-500 bg-white text-indigo-900 shadow-sm' : 'border-indigo-100 bg-indigo-50 text-slate-600 hover:border-indigo-300 hover:bg-white'}`}><span className="block text-[10px] text-indigo-700">{index + 1}</span><span className="mt-1 block">{item.shortTitle}</span></button>)}
    </div>

    <div id="schedule-step-panel" role="tabpanel" aria-labelledby={`schedule-step-${step}`} className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><div><p className="text-xs font-bold text-indigo-800">スケジューラの判断</p><p className="mt-1 text-sm font-bold text-slate-900">{current.event}</p></div><div className="flex gap-2"><button type="button" disabled={step === 0} onClick={() => setStep(value => Math.max(0, value - 1))} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition enabled:hover:border-indigo-400 enabled:hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-40">← 前の段階</button><button type="button" disabled={step === SCHEDULING_STEPS.length - 1} onClick={() => setStep(value => Math.min(SCHEDULING_STEPS.length - 1, value + 1))} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">次の段階 →</button></div></div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_.8fr_1fr] lg:items-stretch">
        <ProcessCard name="A" state={current.processA} active={current.cpuOwner === 'A'} context={current.processA === 'waiting' ? 'I/O完了待ち' : 'PC=0x1204 / R1=7'} />
        <div className={`rounded-2xl border p-4 text-center transition ${current.cpuOwner === 'none' ? 'border-slate-200 bg-slate-50' : 'border-indigo-300 bg-indigo-50 shadow-sm shadow-indigo-100'}`}><span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 font-mono text-xs font-bold text-white">CPU</span><p className="mt-3 text-xs font-bold text-indigo-900">1つのCPUコア</p><p className="mt-2 text-sm font-bold text-slate-900">{current.cpuOwner === 'none' ? '切り替え中' : `プロセス ${current.cpuOwner} を実行中`}</p><p className="mt-3 text-xs leading-5 text-slate-600">同時に実行できるのは、この例では1つです。</p></div>
        <ProcessCard name="B" state={current.processB} active={current.cpuOwner === 'B'} context={current.processB === 'waiting' ? 'I/O完了待ち' : 'PC=0x0810 / R1=42'} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite"><p className="text-xs font-bold text-indigo-800">{current.shortTitle}</p><h3 className="mt-1 text-base font-bold text-slate-900">{current.title}</h3><p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={current.body} onNavigate={onNavigate} /></p><p className="mt-3 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><LinkedText text={current.detail} onNavigate={onNavigate} /></p></article>
        <aside className="rounded-xl border border-indigo-200 bg-indigo-50 p-4"><p className="text-xs font-bold text-indigo-900">保存・復元する状態（例）</p><code className="mt-3 block rounded-lg bg-white px-3 py-2 font-mono text-xs font-bold leading-6 text-slate-800">{current.savedContext}</code><p className="mt-3 text-xs leading-6 text-slate-600">このような実行途中の情報を保存して別の実行単位へ切り替えることを、コンテキストスイッチ（Context Switch）と呼びます。</p></aside>
      </div>

      <section className="mt-5 grid gap-3 md:grid-cols-3" aria-label="プロセス状態の意味"><article className="rounded-xl border border-sky-200 bg-sky-50 p-3"><p className="text-xs font-bold text-sky-900">実行待ち（Ready）</p><p className="mt-1 text-xs leading-5 text-slate-700">CPUを使えるが、順番を待っている状態。</p></article><article className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"><p className="text-xs font-bold text-emerald-900">実行中（Running）</p><p className="mt-1 text-xs leading-5 text-slate-700">選ばれてCPU上で命令を実行している状態。</p></article><article className="rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="text-xs font-bold text-amber-900">待機中（Waiting）</p><p className="mt-1 text-xs leading-5 text-slate-700">入出力（I/O）など、外部の完了を待ってCPUを譲っている状態。</p></article></section>
    </div>

    <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-bold text-slate-900">プロセスとスレッドを分けて考える</p><p className="mt-2 text-sm leading-7 text-slate-700">プロセス（Process）は、独立した仮想アドレス空間や資源を持つプログラムの実行単位です。スレッド（Thread）は、そのプロセス内で実際に命令を実行する流れです。多くのOSではスケジューラが直接選ぶ対象はスレッドですが、この教材では状態の変化を見やすくするためプロセスを表にしています。</p></section>
    <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>教材上の簡略化：</b>スケジューリング方針はラウンドロビン（Round Robin）だけではなく、優先度、対話性、CPUコア数、OSの設計などで変わります。ここでは「実行中の状態を保存し、次の仕事を復元する」という中心的な役割を示しています。</p>
  </section>
}

export default ProcessSchedulingLesson
