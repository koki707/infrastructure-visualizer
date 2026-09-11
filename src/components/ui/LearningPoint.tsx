import type { RequestStage } from '../../types/request'
import { GlossaryText } from './GlossaryText'

export function LearningPoint({ stage, onDismiss, onOpenTerm }: { stage: RequestStage; onDismiss: () => void; onOpenTerm: (termId: string) => void }) {
  const point = stage.learningPoint
  if (!point) return null

  return <div className="pointer-events-auto w-72 rounded-xl border border-cyan-200 bg-white/95 p-3 shadow-sm backdrop-blur">
    <div className="flex items-start justify-between gap-3"><div><p className="eyebrow">現在の学習ポイント</p><h2 className="mt-1 text-sm font-bold text-slate-900">{point.title}</h2></div><button type="button" onClick={onDismiss} aria-label="現在の学習ポイントを閉じる" className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">×</button></div>
    <p className="mt-2 text-xs leading-5 text-slate-700"><GlossaryText text={point.body} onOpenTerm={onOpenTerm} /></p>
    <p className="mt-2 border-l-2 border-amber-400 pl-2 text-xs leading-5 text-slate-600"><span className="font-bold text-amber-800">見るポイント：</span><GlossaryText text={point.focus} onOpenTerm={onOpenTerm} /></p>
  </div>
}
