import type { SimulationDestination } from '../../types/network'
import type { RequestPlaybackMode } from '../../types/request'

interface StepPlaybackState {
  currentIndex: number
  total: number
  stageLabel: string
  nodeName: string
  isMoving: boolean
  isComplete: boolean
}

interface Props {
  destinationId: string
  destinations: SimulationDestination[]
  sending: boolean
  paused: boolean
  playbackMode: RequestPlaybackMode
  stepPlayback: StepPlaybackState | null
  onDestinationChange: (id: string) => void
  onPlaybackModeChange: (mode: RequestPlaybackMode) => void
  onSend: () => void
  onPause: () => void
  onResume: () => void
  onNextStop: () => void
  onPreviousStop: () => void
  onResetStep: () => void
}

export function ControlPanel({
  destinationId,
  destinations,
  sending,
  paused,
  playbackMode,
  stepPlayback,
  onDestinationChange,
  onPlaybackModeChange,
  onSend,
  onPause,
  onResume,
  onNextStop,
  onPreviousStop,
  onResetStep,
}: Props) {
  const destination = destinations.find(item => item.id === destinationId) ?? destinations[0]
  const isStepMode = playbackMode === 'step'
  const canMoveStep = Boolean(stepPlayback && !stepPlayback.isComplete && !stepPlayback.isMoving)
  const canRewindStep = Boolean(stepPlayback && stepPlayback.currentIndex > 0 && !stepPlayback.isMoving)

  return <section className="panel p-5">
    <p className="eyebrow">接続先を選ぶ</p>
    <label className="mt-3 block text-sm text-slate-700" htmlFor="destination">シミュレーションするウェブサイト</label>
    <select id="destination" value={destination.id} disabled={sending} onChange={(event) => onDestinationChange(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-50 disabled:text-slate-500">
      {destinations.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
    </select>
    <code className="mt-2 block break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-cyan-800">{destination.url}</code>
    <p className="mt-2 text-xs leading-5 text-slate-500">接続先の代表例：{destination.description}</p>

    <div className="mt-5 border-t border-slate-100 pt-4">
      <p className="eyebrow">再生方法</p>
      <div role="group" aria-label="シミュレーションの再生方法" className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" aria-pressed={playbackMode === 'continuous'} disabled={sending} onClick={() => onPlaybackModeChange('continuous')} className={`rounded-lg border px-3 py-2 text-left text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${playbackMode === 'continuous' ? 'border-cyan-500 bg-cyan-50 text-cyan-900' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50/50'}`}>
          通して再生
          <span className="mt-1 block text-[10px] font-medium leading-4 opacity-80">流れを続けて確認</span>
        </button>
        <button type="button" aria-pressed={isStepMode} disabled={sending} onClick={() => onPlaybackModeChange('step')} className={`rounded-lg border px-3 py-2 text-left text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${isStepMode ? 'border-cyan-500 bg-cyan-50 text-cyan-900' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50/50'}`}>
          止めて追う
          <span className="mt-1 block text-[10px] font-medium leading-4 opacity-80">機器への到着ごとに確認</span>
        </button>
      </div>
    </div>

    {!sending && <button type="button" onClick={onSend} className="mt-4 w-full rounded-lg bg-cyan-600 px-4 py-3 font-bold text-white transition hover:bg-cyan-700">{isStepMode ? 'PCからステップを始める' : 'シミュレーションを開始'}</button>}

    {sending && !isStepMode && <button type="button" onClick={paused ? onResume : onPause} className={`mt-4 w-full rounded-lg border px-4 py-2.5 text-sm font-bold transition ${paused ? 'border-cyan-600 bg-cyan-50 text-cyan-700 hover:bg-cyan-100' : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'}`}>{paused ? '▶ 再開する' : 'Ⅱ 一時停止する'}</button>}

    {sending && isStepMode && stepPlayback && <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
      <p className="text-xs font-bold text-cyan-900">{stepPlayback.stageLabel} · {stepPlayback.nodeName}</p>
      <p className="mt-1 text-[11px] leading-4 text-cyan-800" aria-live="polite">{stepPlayback.isComplete ? 'Webサーバーでの処理まで確認しました。' : stepPlayback.isMoving ? (paused ? '次の機器への移動を止めています。' : '次の機器へデータを運んでいます。') : '到着した機器での処理を確認してから、次へ進めます。'}</p>
      <button type="button" disabled={!canMoveStep} onClick={onNextStop} className="mt-3 w-full rounded-lg bg-cyan-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300">
        {stepPlayback.isComplete ? 'サーバー処理を確認済み' : '次の機器へ進む →'}
      </button>
      {stepPlayback.isMoving && <button type="button" onClick={paused ? onResume : onPause} className={`mt-2 w-full rounded-lg border px-3 py-2 text-xs font-bold transition ${paused ? 'border-cyan-500 bg-white text-cyan-800 hover:bg-cyan-50' : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'}`}>{paused ? '▶ 移動を再開する' : 'Ⅱ 移動を止める'}</button>}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" disabled={!canRewindStep} onClick={onPreviousStop} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-800 disabled:cursor-not-allowed disabled:opacity-45">← 前の地点</button>
        <button type="button" onClick={onResetStep} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-800">{stepPlayback.isComplete ? '終了する' : '最初に戻す'}</button>
      </div>
      <p className="mt-2 text-right text-[10px] text-cyan-700">{stepPlayback.currentIndex + 1} / {stepPlayback.total} 地点</p>
    </div>}

    <p className="mt-3 text-xs leading-relaxed text-slate-500">{sending && paused && !isStepMode ? 'シミュレーションを停止中です。再開すると同じ位置から続きます。' : isStepMode ? '「止めて追う」では、データが機器へ届くたびに止まり、処理の意味を確認できます。' : '選択したURLへ実際にアクセスしたり、DNS問い合わせ・パケット送信を行ったりしません。'}</p>
  </section>
}
