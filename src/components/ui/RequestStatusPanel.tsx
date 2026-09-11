import type { RequestStage } from '../../types/request'
import { GlossaryText } from './GlossaryText'

export function RequestStatusPanel({ stage, url, onOpenTerm }: { stage: RequestStage | null; url: string; onOpenTerm: (termId: string) => void }) {
  return <section className="panel p-5"><p className="eyebrow">URLアクセスの現在地</p>{stage ? <><div className="mt-2 flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-slate-900">{stage.shortTitle}</h2><span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">{stage.protocol}</span></div><p className="mt-3 text-sm leading-6 text-slate-700"><GlossaryText text={stage.description} onOpenTerm={onOpenTerm} /></p></> : <><h2 className="mt-2 text-lg font-bold text-slate-900">URLを選択して開始</h2><p className="mt-3 text-sm leading-6 text-slate-700"><span className="font-mono text-cyan-700">{url}</span> へアクセスする流れを、ブラウザ内で簡略化して表示します。</p></>}<p className="mt-4 text-xs leading-5 text-slate-500"><GlossaryText text="実際はDNSキャッシュや既存の接続が再利用される場合もあります。このシミュレーションでは、HTTPSをTCP + TLS + HTTPで利用する代表例を扱います。HTTP/3ではQUICとUDPが使われるなど、実際の通信方式は環境によって異なります。" onOpenTerm={onOpenTerm} /></p></section>
}
