import { useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type Ipv6LessonProps = {
  onNavigate: Navigate
}

const FULL_ADDRESS = ['2001', '0db8', '0000', '0000', '0000', 'ff00', '0042', '8329'] as const
const COMPRESSED_ADDRESS = '2001:db8::ff00:42:8329'

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

function binaryForGroup(group: string) {
  return Number.parseInt(group, 16).toString(2).padStart(16, '0')
}

export function Ipv6Lesson({ onNavigate }: Ipv6LessonProps) {
  const [selectedGroup, setSelectedGroup] = useState(1)
  const [view, setView] = useState<'groups' | 'shorten' | 'lan'>('groups')
  const group = FULL_ADDRESS[selectedGroup]

  return <section aria-label="IPv6アドレスの図解" className="rounded-3xl border border-indigo-200 bg-indigo-50/45 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow text-indigo-700">操作して学ぶIPv6</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">128ビットの住所を、まとまりで読む</h2>
      </div>
      <span className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-800">IPv4とは別のアドレス方式</span>
    </div>

    <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="IPv6の見方を選択">
      {([
        ['groups', '16ビットごとに見る'],
        ['shorten', '省略表記を読む'],
        ['lan', 'LANでの使われ方'],
      ] as const).map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={view === id} onClick={() => setView(id)} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${view === id ? 'border-indigo-500 bg-white text-indigo-950 shadow-sm' : 'border-indigo-100 bg-indigo-50 text-slate-600 hover:border-indigo-300 hover:bg-white'}`}>{label}</button>)}
    </div>

    {view === 'groups' && <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm leading-7 text-slate-700"><LinkedText text="IPv6アドレスは128ビットです。通常は16ビットずつ8つのグループに分け、16進数をコロンで区切って表します。各グループを選ぶと、16進数とビット列の関係を確認できます。" onNavigate={onNavigate} /></p>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8" role="radiogroup" aria-label="IPv6アドレスのグループを選択">
        {FULL_ADDRESS.map((item, index) => <button key={`${item}-${index}`} type="button" role="radio" aria-checked={selectedGroup === index} onClick={() => setSelectedGroup(index)} className={`rounded-xl border px-2 py-3 font-mono text-sm font-bold transition ${selectedGroup === index ? 'border-indigo-500 bg-indigo-50 text-indigo-950 shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-white'}`}>
          <span className="block text-[10px] font-sans font-semibold text-slate-500">{index + 1}番目の16ビット</span>
          <span className="mt-1 block">{item}</span>
        </button>)}
      </div>
      <div className="mt-5 grid gap-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 sm:grid-cols-2">
        <div><p className="text-xs font-bold text-indigo-900">選択中のグループ</p><code className="mt-2 block text-xl font-bold text-slate-900">0x{group.toUpperCase()}</code><p className="mt-2 text-xs leading-6 text-slate-600">16進数4桁で、ちょうど16ビットを表せます。</p></div>
        <div><p className="text-xs font-bold text-indigo-900">2進数（Binary・16ビット）</p><code className="mt-2 block break-all text-sm font-bold tracking-wide text-indigo-950">{binaryForGroup(group).slice(0, 8)} {binaryForGroup(group).slice(8)}</code><p className="mt-2 text-xs leading-6 text-slate-600">サイトでは構造を確かめるための表現です。実際の通信ではアドレス全体がヘッダーのフィールドとして扱われます。</p></div>
      </div>
      <p className="mt-4 font-mono text-xs leading-6 text-slate-500">{FULL_ADDRESS.join(':')}</p>
    </div>}

    {view === 'shorten' && <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm leading-7 text-slate-700">IPv6では、各グループの先頭の0を省けます。また、連続する0だけのグループは <code>::</code> で一度だけまとめて省略できます。</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold text-slate-700">省略前</p><code className="mt-2 block break-all text-sm font-bold leading-7 text-slate-900">{FULL_ADDRESS.join(':')}</code></div>
        <div className="text-center text-2xl font-bold text-indigo-600" aria-hidden="true">→</div>
        <div className="rounded-xl border border-indigo-300 bg-indigo-50 p-4"><p className="text-xs font-bold text-indigo-900">省略後</p><code className="mt-2 block break-all text-sm font-bold leading-7 text-indigo-950">{COMPRESSED_ADDRESS}</code></div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="font-semibold text-slate-900">先頭の0を省く</p><p className="mt-2 text-sm leading-6 text-slate-600"><code>0db8</code> は <code>db8</code>、<code>0042</code> は <code>42</code> と書けます。グループの途中にある0は省きません。</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="font-semibold text-slate-900"><code>::</code> は一度だけ</p><p className="mt-2 text-sm leading-6 text-slate-600">どの数の0グループを省いたか復元できるよう、1つのアドレス内で <code>::</code> を2回使うことはできません。</p></div></div>
      <p className="mt-4 rounded-xl border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><code>2001:db8::/32</code> は文書・教材で使用するために予約されたPrefixです。ここでは実在する公開アドレスを表していません。</p>
    </div>}

    {view === 'lan' && <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center"><div className="lesson-device"><span className="lesson-device-icon bg-sky-100 text-sky-800">PC</span><b>IPv6対応の端末</b><span>自分の設定を得る</span></div><div className="lesson-arrow" aria-hidden="true">→</div><div className="lesson-device lesson-device-active"><span className="lesson-device-icon bg-indigo-100 text-indigo-800">LAN</span><b>同一リンク</b><span>ルーター広告 / NDP</span></div><div className="lesson-arrow" aria-hidden="true">→</div><div className="lesson-device"><span className="lesson-device-icon bg-amber-100 text-amber-800">GW</span><b>デフォルトルーター</b><span>次のネットワークへ</span></div></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><article className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="font-semibold text-slate-900">アドレス設定</p><p className="mt-2 text-sm leading-6 text-slate-600">IPv6ではSLAAC、DHCPv6、手動設定など、環境に応じた方法があります。DHCPv4の流れがそのまま必須になるわけではありません。</p></article><article className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="font-semibold text-slate-900">次の相手を知る</p><p className="mt-2 text-sm leading-6 text-slate-600"><LinkedText text="IPv6の同一LANではARPではなく、ICMPv6の近隣探索プロトコル（Neighbor Discovery Protocol: NDP）が近隣機器やルーターを見つける役割を担います。" onNavigate={onNavigate} /></p></article><article className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="font-semibold text-slate-900">IPv4との併用</p><p className="mt-2 text-sm leading-6 text-slate-600">実際の環境ではIPv4とIPv6を同時に使うデュアルスタックもあります。どちらが使われるかは端末・ネットワーク・接続先の対応状況で変わります。</p></article></div>
    </div>}

    <p className="mt-4 text-xs leading-6 text-slate-600">この教材はIPv6の表記と基本的な関係を理解するためのモデルです。実際のアドレス割り当て、ルーター広告、DNS、経路制御には環境ごとの設定があります。</p>
  </section>
}
