import { useMemo, useState } from 'react'
import type { ExplorationWorldId } from '../../types/exploration'
import { GlossaryText } from './GlossaryText'

const toBits = (value: number, width: number) => value.toString(2).padStart(width, '0').replace(/(.{8})/g, '$1 ').trim()
const toHex = (value: number, width = 4) => `0x${value.toString(16).toUpperCase().padStart(width, '0')}`
const toByteRows = (message: string) => Array.from(new TextEncoder().encode(message)).slice(0, 10).map(byte => ({ char: byte === 10 ? '↵' : byte >= 32 && byte < 127 ? String.fromCharCode(byte) : '·', hex: byte.toString(16).toUpperCase().padStart(2, '0'), bits: toBits(byte, 8) }))

function Field({ label, value, bits }: { label: string; value: string; bits?: string }) {
  return <div className="rounded-md border border-slate-200 bg-white/80 px-2 py-1.5"><div className="flex flex-wrap items-baseline justify-between gap-x-2"><span className="text-[10px] font-semibold text-slate-600">{label}</span><code className="text-[11px] font-semibold text-slate-800">{value}</code></div>{bits && <code className="mt-1 block break-all text-[10px] leading-4 text-cyan-800">{bits}</code>}</div>
}

interface Props { message: string; url: string; onExplore: (world: ExplorationWorldId) => void; onOpenTerm: (termId: string) => void }

export function EncapsulationPanel({ message, url, onExplore, onOpenTerm }: Props) {
  const [expanded, setExpanded] = useState<ExplorationWorldId | null>('tcp')
  const destinationPort = url.trim().startsWith('http://') ? 80 : 443
  const sourcePort = 51514
  const payloadRows = useMemo(() => toByteRows(message), [message])
  const layers: Array<{ name: string; world: ExplorationWorldId; color: string }> = [
    { name: 'Ethernet Frame', world: 'frame', color: 'border-teal-400/60 bg-teal-50' },
    { name: 'IP Packet', world: 'ip', color: 'border-amber-300/60 bg-amber-50' },
    { name: 'TCP Segment', world: 'tcp', color: 'border-indigo-400/60 bg-indigo-50' },
    { name: 'Application Data', world: 'appdata', color: 'border-sky-400/60 bg-sky-50' },
  ]

  const details = (world: ExplorationWorldId) => {
    if (world === 'frame') return <div className="grid gap-1.5"><Field label="Destination MAC（例）" value="3C:52:82:AB:12:34" bits="00111100 01010010 …（48 bits）" /><Field label="EtherType" value="0x0800（IPv4）" bits="00001000 00000000" /></div>
    if (world === 'ip') return <div className="grid gap-1.5"><Field label="Protocol" value="6（TCP）" bits="00000110" /><Field label="Source IP（例）" value="192.168.1.10" bits="11000000 10101000 00000001 00001010" /><Field label="Destination IP（例）" value="93.184.216.34" bits="01011101 10111000 11011000 00100010" /></div>
    if (world === 'tcp') return <div className="grid gap-1.5"><Field label="Source Port（例）" value={`${sourcePort} / ${toHex(sourcePort)}`} bits={toBits(sourcePort, 16)} /><Field label="Destination Port" value={`${destinationPort} / ${toHex(destinationPort)}`} bits={toBits(destinationPort, 16)} /><Field label="TCP Payload" value="HTTP Request のバイト列" /></div>
    return <div className="rounded-md border border-sky-200 bg-white/80 p-2"><p className="text-[10px] font-semibold text-slate-600">UTF-8 の先頭 {payloadRows.length} byte（文字 / Hex / Binary）</p><div className="mt-1.5 space-y-1">{payloadRows.map((row, index) => <div key={`${row.hex}-${index}`} className="grid grid-cols-[20px_38px_1fr] gap-1 font-mono text-[10px] leading-4 text-slate-700"><span>{row.char}</span><span>0x{row.hex}</span><span className="text-cyan-800">{row.bits}</span></div>)}</div>{message.length > payloadRows.length && <p className="mt-1 text-[10px] text-slate-500">…続きのバイトは省略しています。</p>}</div>
  }

  return <section className="panel p-5">
    <p className="eyebrow">カプセル化（包含関係）</p>
    <p className="mt-2 text-xs leading-5 text-slate-600"><b>送信側</b>では、内側のデータにヘッダ（またはトレーラ）を加えて、外側の単位を作ります。最も外側は <b><GlossaryText text="Ethernet Frame" onOpenTerm={onOpenTerm} /></b> です。</p>

    <figure className="mt-4" aria-label="Application DataをTCP Segment、IP Packet、Ethernet Frameが順に包む図">
      <div className="rounded-xl border-2 border-teal-400 bg-teal-50 p-2.5">
        <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold tracking-wide text-teal-800">最も外側</span><button onClick={() => onExplore('frame')} className="rounded-md bg-teal-600 px-2 py-1 text-xs font-bold text-white transition hover:bg-teal-700">Ethernet Frame を見る</button></div>
        <div className="mt-2 rounded border border-teal-300 bg-white/80 px-2 py-1 text-[10px] font-semibold text-teal-900">Ethernet Header（宛先MAC / 送信元MAC / EtherType）</div>
        <div className="mt-2 rounded-lg border-2 border-amber-300 bg-amber-50 p-2">
          <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold text-amber-900">Ethernet の Payload</span><button onClick={() => onExplore('ip')} className="rounded-md border border-amber-400 bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900 transition hover:bg-amber-200">IPv4 Packet を見る</button></div>
          <div className="mt-2 rounded border border-amber-300 bg-white/80 px-2 py-1 text-[10px] font-semibold text-amber-900">IP Header（送信元IP / 宛先IP / Protocol）</div>
          <div className="mt-2 rounded-lg border-2 border-indigo-300 bg-indigo-50 p-2">
            <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold text-indigo-900">IP の Payload</span><button onClick={() => onExplore('tcp')} className="rounded-md border border-indigo-400 bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-900 transition hover:bg-indigo-200">TCP Segment を見る</button></div>
            <div className="mt-2 rounded border border-indigo-300 bg-white/80 px-2 py-1 text-[10px] font-semibold text-indigo-900">TCP Header（送信元Port / 宛先Port / Flags）</div>
            <div className="mt-2 rounded-lg border-2 border-sky-300 bg-sky-50 p-2"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold text-sky-900">TCP の Payload</span><button onClick={() => onExplore('appdata')} className="rounded-md border border-sky-400 bg-sky-100 px-2 py-1 text-xs font-bold text-sky-900 transition hover:bg-sky-200">Application Data を見る</button></div><code className="mt-1 block break-all text-[10px] leading-4 text-cyan-800">{message || '（空）'}</code></div>
          </div>
        </div>
        <div className="mt-2 rounded border border-teal-300 bg-white/80 px-2 py-1 text-[10px] font-semibold text-teal-900">FCS（フレームの誤り検出用トレーラ）</div>
      </div>
      <figcaption className="mt-2 text-[10px] leading-4 text-slate-500"><GlossaryText text="Application Data + TCP Header = TCP Segment → + IP Header = IP Packet → + Ethernet Header / FCS = Ethernet Frame" onOpenTerm={onOpenTerm} /></figcaption>
    </figure>

    <div className="mt-4 border-t border-slate-200 pt-3"><p className="text-xs font-bold text-slate-700">例のフィールドとビット列</p><p className="mt-1 text-[10px] leading-4 text-slate-500">各レイヤの値を展開して確認できます。</p><div className="mt-2 space-y-2">{layers.map(layer => <div key={layer.name}>
      <button aria-expanded={expanded === layer.world} onClick={() => setExpanded(current => current === layer.world ? null : layer.world)} className={`flex w-full items-center justify-between rounded border px-2 py-1.5 text-left text-xs font-semibold text-slate-800 transition hover:brightness-95 ${layer.color}`}><span>{layer.name}</span><span className="text-[10px]">{expanded === layer.world ? '閉じる' : '値とビットを見る'}</span></button>
      {expanded === layer.world && <div className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2">{details(layer.world)}</div>}
    </div>)}</div></div>
    <p className="mt-3 text-[10px] leading-4 text-slate-500"><GlossaryText text="ポート番号は16ビットの例で、上位バイトから表示しています。HTTPSでは実際のHTTP本文・ヘッダはTLSで暗号化されるため、ここでは暗号化前の教材用ペイロードを表示しています。Ethernet Frameはリンクごとの単位なので、ルーターを越えると新しいFrameに包み直されます。" onOpenTerm={onOpenTerm} /></p>
  </section>
}
