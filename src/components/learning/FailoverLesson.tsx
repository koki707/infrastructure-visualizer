import { useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type FailoverLessonProps = {
  onNavigate: Navigate
}

type FailoverStep = {
  id: 'normal' | 'detect' | 'switch' | 'confirm'
  label: string
  title: string
  body: string
  detail: string
}

const FAILOVER_STEPS: FailoverStep[] = [
  {
    id: 'normal',
    label: 'NORMAL',
    title: '平常時は、Active Nodeがサービスを提供する',
    body: 'この例ではNode AがActiveとしてRequestを処理し、Node BはStandbyとして引継ぎに備えます。必要な状態をどこまで複製するかは、サービスごとに設計します。',
    detail: '冗長構成は、同じ役割をすぐに代われる候補を用意して、1台の障害でサービス全体が止まるリスクを下げる考え方です。2台あれば必ず無停止になるわけではありません。',
  },
  {
    id: 'detect',
    label: 'DETECT',
    title: '監視が障害を検出し、切替の条件を確かめる',
    body: 'Health Checkや監視が、Node Aからの応答が続けて得られないことを検出します。短い一時的な遅延だけで切り替えると、かえって不安定になるため、判定条件を設計します。',
    detail: '障害検出は「Nodeが本当に停止した」のか、「監視側との通信だけが一時的に失われた」のかを区別しにくい場合があります。誤検知を抑える設定も重要です。',
  },
  {
    id: 'switch',
    label: 'SWITCH',
    title: 'Standby Nodeへ、Activeの役割を引き継ぐ',
    body: '切替条件を満たすと、Node BをActiveへ昇格させ、Clientの送り先をNode Bへ向けます。Node Aが同時に書き込みを続けないよう、旧Activeを隔離・停止する考え方も必要です。',
    detail: 'ここで扱うのは役割の引継ぎです。Load Balancerの通常時の負荷分散とは目的が異なりますが、実際には両方の仕組みを組み合わせる構成もあります。',
  },
  {
    id: 'confirm',
    label: 'CONFIRM',
    title: '新しいActiveで、サービスが提供できるか確認する',
    body: 'Node BがRequestを受けられること、必要なデータや依存先へ到達できることを確認します。Node Aの修復後は、再びStandbyへ戻すか、計画的に役割を戻すかを判断します。',
    detail: '切替の成功だけでなく、監視・ログ・データ整合性・利用者への影響を確認します。復旧直後の自動的な再切替は、状況によっては避ける設計もあります。',
  },
]

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

function nodeStyle(state: 'active' | 'standby' | 'failed' | 'repairing') {
  if (state === 'active') return 'border-emerald-400 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-100'
  if (state === 'failed') return 'border-rose-300 bg-rose-50 text-rose-950 opacity-80'
  if (state === 'repairing') return 'border-amber-300 bg-amber-50 text-amber-950'
  return 'border-slate-300 bg-slate-50 text-slate-800'
}

/**
 * A deterministic Active/Standby failover model. It focuses on the role
 * transition after a detected failure instead of ordinary request balancing.
 */
export function FailoverLesson({ onNavigate }: FailoverLessonProps) {
  const [step, setStep] = useState(0)
  const current = FAILOVER_STEPS[step]
  const failureDetected = step >= 1
  const switched = step >= 2
  const confirmed = step === FAILOVER_STEPS.length - 1
  const activeNode = switched ? 'Node B' : 'Node A'
  const originalNodeState = step === 0 ? 'active' : confirmed ? 'repairing' : 'failed'
  const standbyNodeState = switched ? 'active' : 'standby'

  const selectStep = (index: number) => setStep(index)
  const reset = () => setStep(0)

  return <section aria-label="Failoverの段階図解" className="rounded-3xl border border-teal-200 bg-teal-50/45 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow text-teal-700">INTERACTIVE SYSTEM DESIGN</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">障害を検知して、待機Nodeへ役割を引き継ぐ</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="Failoverは、Activeとして動いていたNodeに障害が起きたとき、待機していたNodeへサービスの役割を引き継ぐ仕組みです。検出から切替、確認までを一つずつ止めて追えます。" onNavigate={onNavigate} /></p>
      </div>
      <span className="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold text-teal-800">{step === 0 ? '平常時' : `障害対応 · ${step + 1} / ${FAILOVER_STEPS.length}`}</span>
    </div>

    <div className="mt-6 grid gap-2 sm:grid-cols-4" role="tablist" aria-label="Failoverの段階">
      {FAILOVER_STEPS.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={step === index} onClick={() => selectStep(index)} className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${step === index ? 'border-teal-500 bg-white text-teal-950 shadow-sm' : 'border-teal-100 bg-teal-50 text-slate-600 hover:border-teal-300 hover:bg-white'}`}><span className="block text-[10px] text-teal-700">{index + 1}</span><span className="mt-1 block">{item.label}</span></button>)}
    </div>

    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2"><button type="button" onClick={() => selectStep(1)} disabled={failureDetected} className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-45">Node Aの障害を発生させる</button><span className="self-center text-xs text-slate-600">{failureDetected ? '障害対応の流れを停止中です' : '平常時の構成を確認できます'}</span></div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={() => selectStep(Math.max(0, step - 1))} disabled={step === 0} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-teal-300 disabled:cursor-not-allowed disabled:opacity-45">← 前の状態</button><button type="button" onClick={() => selectStep(Math.min(FAILOVER_STEPS.length - 1, step + 1))} disabled={step === FAILOVER_STEPS.length - 1} className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-45">次の状態 →</button><button type="button" onClick={reset} className="rounded-lg px-2 py-2 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-slate-900">最初に戻す</button></div>
    </div>

    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div aria-live="polite"><p className="text-xs font-bold text-teal-800">{current.label}</p><h3 className="mt-1 text-lg font-bold text-slate-900">{current.title}</h3><p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={current.body} onNavigate={onNavigate} /></p><p className="mt-3 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><LinkedText text={current.detail} onNavigate={onNavigate} /></p></div>
        <aside className="rounded-xl border border-teal-200 bg-teal-50 p-4"><p className="text-xs font-bold text-teal-950">現在のサービス担当</p><p className="mt-1 text-lg font-bold text-slate-900">{activeNode}</p><dl className="mt-4 space-y-2 text-xs"><div className="grid grid-cols-[7.5rem_1fr] gap-2"><dt className="text-slate-500">障害検出</dt><dd className={failureDetected ? 'font-bold text-rose-800' : 'font-semibold text-slate-700'}>{failureDetected ? 'Node Aの応答なし' : '異常なし'}</dd></div><div className="grid grid-cols-[7.5rem_1fr] gap-2"><dt className="text-slate-500">役割の切替</dt><dd className={switched ? 'font-bold text-emerald-800' : 'font-semibold text-slate-700'}>{switched ? 'Node BをActiveへ昇格' : 'まだ切り替えない'}</dd></div><div className="grid grid-cols-[7.5rem_1fr] gap-2"><dt className="text-slate-500">利用確認</dt><dd className={confirmed ? 'font-bold text-emerald-800' : 'font-semibold text-slate-700'}>{confirmed ? 'Node Bで確認済み' : '次の段階で確認'}</dd></div></dl></aside>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-[.75fr_auto_1fr_auto_1fr] xl:items-center" aria-label="Active Standby構成の概念図">
        <article className={`lesson-device ${step === 0 || switched ? 'lesson-device-active' : ''}`}><span className="lesson-device-icon bg-sky-100 text-sky-800">CLIENT</span><b>Client</b><span>{switched ? 'Node Bへ接続' : 'Node Aへ接続'}</span></article>
        <div className={`lesson-arrow ${step === 0 || switched ? 'lesson-arrow-active' : ''}`} aria-hidden="true">→</div>
        <article className={`rounded-2xl border p-4 transition ${nodeStyle(originalNodeState)}`}><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold tracking-[.12em]">NODE A</span><span className={`h-2.5 w-2.5 rounded-full ${originalNodeState === 'active' ? 'bg-emerald-500' : originalNodeState === 'failed' ? 'bg-rose-500' : 'bg-amber-500'}`} /></div><p className="mt-3 text-sm font-bold">{originalNodeState === 'active' ? 'Active' : originalNodeState === 'failed' ? '障害を検出' : '修復・再参加を確認中'}</p><p className="mt-1 text-[11px] leading-5">{originalNodeState === 'active' ? '通常のRequestを処理する' : originalNodeState === 'failed' ? '新しいRequestの送り先から外す' : 'すぐにActiveへ戻すとは限らない'}</p></article>
        <div className={`lesson-arrow ${switched ? 'lesson-arrow-active' : ''}`} aria-hidden="true">⇄</div>
        <article className={`rounded-2xl border p-4 transition ${nodeStyle(standbyNodeState)}`}><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold tracking-[.12em]">NODE B</span><span className={`h-2.5 w-2.5 rounded-full ${standbyNodeState === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} /></div><p className="mt-3 text-sm font-bold">{standbyNodeState === 'active' ? '新しいActive' : 'Standby'}</p><p className="mt-1 text-[11px] leading-5">{standbyNodeState === 'active' ? '役割を引き継いでRequestを処理する' : '同期・起動条件を満たして待機する概念図'}</p></article>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-bold text-slate-900">Load Balancerとの違い</p><p className="mt-2 text-xs leading-6 text-slate-700">Load Balancerは平常時のRequestを複数のServerへ分ける仕組みです。Failoverは、障害時に担当する役割そのものを別のNodeへ引き継いで、サービスを継続しやすくすることに焦点を置きます。</p></section>
        <section className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm font-bold text-slate-900">なぜ旧Activeを止める考え方が必要？</p><p className="mt-2 text-xs leading-6 text-slate-700">ネットワーク分断などで、Node AとBが同時に自分をActiveだと思うと、同じデータへ別々に書き込む危険があります。これをSplit-Brainと呼び、隔離や合意形成などで避ける設計を検討します。</p></section>
      </div>
    </div>

    <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>教材上の簡略化：</b>この図はActive/Standbyの基本的な役割切替だけを表しています。実際にはデータ同期、監視のしきい値、fencing、Split-Brain対策、名前やIPの引継ぎ、依存サービスの確認、復旧手順が必要です。RTO（復旧目標時間）とRPO（目標復旧時点）はサービスの要件ごとに決められ、ここでは数値として扱っていません。</p>
  </section>
}

export default FailoverLesson
