import { useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type TcpConnectionLessonProps = {
  onNavigate: Navigate
}

type TcpStep = {
  shortTitle: 'SYN' | 'SYN + ACK' | 'ACK' | 'データを運ぶ'
  title: string
  body: string
  detail: string
  direction: 'client-to-server' | 'server-to-client'
  source: string
  destination: string
  sequence: string
  acknowledgment: string
  flags: string
}

const TCP_STEPS: TcpStep[] = [
  {
    shortTitle: 'SYN',
    title: 'PCが接続開始を申し込む',
    body: 'PCはWeb ServerのPort 443へ、SYNフラグを立てたTCP Segmentを送ります。ここではPCが自分の初期Sequence Numberとして1000を選んだ代表例を示します。',
    detail: 'SYNはTCPのバイトストリーム上で1つの番号を消費します。ACKフラグが立っていない最初のSYNでは、Acknowledgment Numberは有効な確認情報としては使われません。',
    direction: 'client-to-server',
    source: '192.168.1.10:51514',
    destination: '203.0.113.10:443',
    sequence: '1000',
    acknowledgment: '—',
    flags: 'SYN = 1 · ACK = 0',
  },
  {
    shortTitle: 'SYN + ACK',
    title: 'Web Serverが接続開始を受け取り、自分の番号も知らせる',
    body: 'Web ServerはSYNとACKを立てて返します。ACK=1001は、PCのSYNを受け取り、次に1001から始まるデータを期待していることを示します。',
    detail: 'Serverも初期Sequence Numberを選びます。この例では5000です。SYNが1つ番号を消費するため、PCは次に5001を期待します。',
    direction: 'server-to-client',
    source: '203.0.113.10:443',
    destination: '192.168.1.10:51514',
    sequence: '5000',
    acknowledgment: '1001',
    flags: 'SYN = 1 · ACK = 1',
  },
  {
    shortTitle: 'ACK',
    title: 'PCがServerのSYNを確認し、接続を確立する',
    body: 'PCはACKを返します。ACK=5001は、ServerのSYNを受け取り、次に5001から始まるデータを期待していることを表します。',
    detail: 'この3つのSegmentで、双方が相手の初期番号を確認する代表的な3-way handshakeが完了します。接続確立後も、確認・順序管理・再送などのためTCP Headerは使われ続けます。',
    direction: 'client-to-server',
    source: '192.168.1.10:51514',
    destination: '203.0.113.10:443',
    sequence: '1001',
    acknowledgment: '5001',
    flags: 'SYN = 0 · ACK = 1',
  },
  {
    shortTitle: 'データを運ぶ',
    title: '確立した接続の上で、TLSやHTTPのデータを運ぶ',
    body: 'TCPはアプリケーションのデータを順番に並べたバイトストリームとして扱います。HTTPSの代表例では、この後にTLSの処理とHTTP Request / Responseが続きます。',
    detail: 'TCP接続が必要なすべてのWeb通信を表すわけではありません。HTTP/3では、QUICとUDPを使う構成があります。ここではTCP + TLS + HTTPの代表例を扱います。',
    direction: 'client-to-server',
    source: '192.168.1.10:51514',
    destination: '203.0.113.10:443',
    sequence: '1001 + data length',
    acknowledgment: '5001 + received length',
    flags: 'ACK = 1 · Payloadあり',
  },
]

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

export function TcpConnectionLesson({ onNavigate }: TcpConnectionLessonProps) {
  const [step, setStep] = useState(0)
  const current = TCP_STEPS[step]
  const directionArrow = current.direction === 'client-to-server' ? '→' : '←'

  return <section aria-label="TCP接続確立のステップ図解" className="rounded-3xl border border-emerald-200 bg-emerald-50/45 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow text-emerald-700">INTERACTIVE TCP</p><h2 className="mt-2 text-xl font-bold text-slate-900">3-way handshakeを、Headerの値と一緒に追う</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="TCPでは、接続を始める前に双方が初期状態を確認します。時間の順番とSequence / Acknowledgment Numberは、3Dよりも表と矢印で比べるほうが読みやすいため、この教材では2Dで示します。" onNavigate={onNavigate} /></p></div><span className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800">{step + 1} / {TCP_STEPS.length}</span></div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="tablist" aria-label="TCP接続確立の段階">{TCP_STEPS.map((item, index) => <button key={item.shortTitle} type="button" role="tab" aria-selected={step === index} onClick={() => setStep(index)} className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${step === index ? 'border-emerald-500 bg-white text-emerald-900 shadow-sm' : 'border-emerald-100 bg-emerald-50 text-slate-600 hover:border-emerald-300 hover:bg-white'}`}><span className="block text-[10px] text-emerald-700">{index + 1}</span><span className="mt-1 block">{item.shortTitle}</span></button>)}</div>

    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className={`lesson-device ${current.direction === 'client-to-server' ? 'lesson-device-active' : ''}`}><span className="lesson-device-icon bg-sky-100 text-sky-800">PC</span><b>Client PC</b><span>192.168.1.10:51514</span></div>
        <div className={`lesson-arrow ${current.direction === 'client-to-server' ? 'lesson-arrow-active' : 'text-emerald-600'}`} aria-hidden="true">{directionArrow}</div>
        <div className="lesson-device"><span className="lesson-device-icon bg-slate-100 text-slate-700">IP</span><b>Internet</b><span>IPで相手へ配送</span></div>
        <div className={`lesson-arrow ${current.direction === 'server-to-client' ? 'lesson-arrow-active' : 'text-emerald-600'}`} aria-hidden="true">{directionArrow}</div>
        <div className={`lesson-device ${current.direction === 'server-to-client' ? 'lesson-device-active' : ''}`}><span className="lesson-device-icon bg-emerald-100 text-emerald-800">WEB</span><b>Web Server</b><span>203.0.113.10:443</span></div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite"><p className="text-xs font-bold text-emerald-800">TCP {current.shortTitle}</p><h3 className="mt-1 text-base font-bold text-slate-900">{current.title}</h3><p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={current.body} onNavigate={onNavigate} /></p><p className="mt-3 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><LinkedText text={current.detail} onNavigate={onNavigate} /></p></div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-bold text-emerald-900">TCP Header（教育用の値）</p><dl className="mt-3 grid gap-2 text-xs"><div className="grid grid-cols-[5.5rem_1fr] gap-2"><dt className="text-slate-500">送信元</dt><dd className="break-all rounded bg-white px-2 py-1.5 font-mono font-semibold text-slate-800">{current.source}</dd></div><div className="grid grid-cols-[5.5rem_1fr] gap-2"><dt className="text-slate-500">宛先</dt><dd className="break-all rounded bg-white px-2 py-1.5 font-mono font-semibold text-slate-800">{current.destination}</dd></div><div className="grid grid-cols-[5.5rem_1fr] gap-2"><dt className="text-slate-500">Sequence</dt><dd className="rounded bg-white px-2 py-1.5 font-mono font-semibold text-slate-800">{current.sequence}</dd></div><div className="grid grid-cols-[5.5rem_1fr] gap-2"><dt className="text-slate-500">Acknowledgment</dt><dd className="rounded bg-white px-2 py-1.5 font-mono font-semibold text-slate-800">{current.acknowledgment}</dd></div><div className="grid grid-cols-[5.5rem_1fr] gap-2"><dt className="text-slate-500">Flags</dt><dd className="rounded bg-white px-2 py-1.5 font-mono font-semibold text-emerald-900">{current.flags}</dd></div></dl></div>
      </div>
    </div>
    <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>教材上の簡略化：</b>ここでは初期Sequence Numberを固定した代表例で示しています。実際の番号は実装ごとに選ばれ、Segmentごとに単純な連番ではなく、TCPのバイトストリーム上の位置に関係します。</p>
  </section>
}

export default TcpConnectionLesson
