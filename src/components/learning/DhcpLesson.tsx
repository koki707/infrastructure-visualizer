import { useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type DhcpLessonProps = {
  onNavigate: Navigate
}

type DhcpStep = {
  shortTitle: 'Discover' | 'Offer' | 'Request' | 'ACK'
  title: string
  body: string
  detail: string
  source: string
  destination: string
  direction: 'client-to-server' | 'server-to-client'
  active: 'client' | 'server' | 'both'
}

const DHCP_STEPS: DhcpStep[] = [
  {
    shortTitle: 'Discover',
    title: 'まだ設定を持たないPCが、DHCPサーバーを探す',
    body: 'PCは利用できるIPv4設定がない状態で、DHCPDISCOVERをLAN内へ送ります。宛先のDHCPサーバーがまだ分からないため、初回取得の代表例ではブロードキャストを使います。',
    detail: 'DHCPv4では、クライアントは通常UDP 68番、サーバーはUDP 67番を使います。この例のPCは、まだ正式なIPv4アドレスを使える状態ではありません。',
    source: '0.0.0.0:68',
    destination: '255.255.255.255:67',
    direction: 'client-to-server',
    active: 'client',
  },
  {
    shortTitle: 'Offer',
    title: 'DHCPサーバーが、使えそうな設定を提案する',
    body: 'DHCPサーバーはDHCPOFFERで、候補となるIPv4アドレスと、Subnet Mask、Default Gateway、DNS Serverなどの設定を提案します。',
    detail: 'この時点では、まだ最終確定ではありません。複数のDHCPサーバーからDHCPOFFERが届くこともあり、クライアントは候補を選びます。',
    source: '192.168.1.1:67',
    destination: 'PC（UDP 68）',
    direction: 'server-to-client',
    active: 'server',
  },
  {
    shortTitle: 'Request',
    title: 'PCが、利用したい設定を選んで要求する',
    body: 'PCはDHCPREQUESTで、選んだ候補のIPv4アドレスを使いたいことを伝えます。初回取得では、ほかのDHCPサーバーにも選択結果が分かるよう、ブロードキャストになる代表例があります。',
    detail: '同じDHCPREQUESTでも、リースの更新や再取得では送信方法・内容が変わることがあります。ここでは最初にネットワークへ参加する流れを示しています。',
    source: '0.0.0.0:68',
    destination: '255.255.255.255:67',
    direction: 'client-to-server',
    active: 'both',
  },
  {
    shortTitle: 'ACK',
    title: 'DHCPサーバーが、設定とリースを確定する',
    body: 'DHCPACKが届くと、PCは提案されたIPv4アドレスとネットワーク設定を一定期間利用できるようになります。この期間をリースと呼びます。',
    detail: 'PCはリース期限より前に更新を試みます。利用できない場合はDHCPNAKなど別の応答になることもあり、実際の運用はネットワークの設定により異なります。',
    source: '192.168.1.1:67',
    destination: 'PC（UDP 68）',
    direction: 'server-to-client',
    active: 'both',
  },
]

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

/**
 * A self-contained DHCPv4 DORA lesson. The parent lesson registry decides
 * when this component becomes a public learning route.
 */
export function DhcpLesson({ onNavigate }: DhcpLessonProps) {
  const [step, setStep] = useState(0)
  const current = DHCP_STEPS[step]
  const configurationIsFinal = step === DHCP_STEPS.length - 1
  const configurationIsProposed = step > 0
  const directionArrow = current.direction === 'client-to-server' ? '→' : '←'

  return <section aria-label="DHCPv4 DORAのステップ図解" className="rounded-3xl border border-sky-200 bg-sky-50/50 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow">INTERACTIVE DHCPv4</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">PCがネットワーク設定を受け取るまで</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="DHCPは、PCがIPv4アドレス、Default Gateway、DNS Serverなどを手作業で入力せずにネットワークへ参加するための仕組みです。" onNavigate={onNavigate} /></p>
      </div>
      <span className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-800">{step + 1} / {DHCP_STEPS.length}</span>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-4" role="tablist" aria-label="DHCPの4段階">
      {DHCP_STEPS.map((item, index) => <button
        key={item.shortTitle}
        id={`dhcp-step-${index}`}
        type="button"
        role="tab"
        aria-selected={step === index}
        aria-controls="dhcp-step-panel"
        onClick={() => setStep(index)}
        className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${step === index ? 'border-cyan-500 bg-white text-cyan-900 shadow-sm' : 'border-sky-100 bg-sky-50 text-slate-600 hover:border-cyan-300 hover:bg-white'}`}
      >
        <span className="block text-[10px] text-cyan-700">{index + 1}</span>
        <span className="mt-1 block">{item.shortTitle}</span>
      </button>)}
    </div>

    <div id="dhcp-step-panel" role="tabpanel" aria-labelledby={`dhcp-step-${step}`} className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className={`lesson-device ${current.active === 'client' || current.active === 'both' ? 'lesson-device-active' : ''}`}>
          <span className="lesson-device-icon bg-sky-100 text-sky-800">PC</span>
          <b>DHCP Client</b>
          <span>ネットワークへ参加するPC</span>
        </div>
        <div className={`lesson-arrow ${current.direction === 'client-to-server' ? 'lesson-arrow-active' : ''}`} aria-hidden="true">{directionArrow}</div>
        <div className="lesson-device">
          <span className="lesson-device-icon bg-violet-100 text-violet-800">SW</span>
          <b>LAN Switch</b>
          <span>LAN内のbroadcastを転送</span>
        </div>
        <div className={`lesson-arrow ${current.direction === 'server-to-client' ? 'lesson-arrow-active' : ''}`} aria-hidden="true">{directionArrow}</div>
        <div className={`lesson-device ${current.active === 'server' || current.active === 'both' ? 'lesson-device-active' : ''}`}>
          <span className="lesson-device-icon bg-amber-100 text-amber-800">DHCP</span>
          <b>DHCP Server</b>
          <span>この例ではHome Router内</span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite">
          <p className="text-xs font-bold text-cyan-800">DHCP {current.shortTitle}</p>
          <h3 className="mt-1 text-base font-bold text-slate-900">{current.title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={current.body} onNavigate={onNavigate} /></p>
          <p className="mt-3 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><LinkedText text={current.detail} onNavigate={onNavigate} /></p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold text-slate-700">メッセージの宛先（例）</p>
          <dl className="mt-3 space-y-3 text-xs">
            <div><dt className="text-slate-500">送信元</dt><dd className="mt-1 break-all rounded bg-slate-50 px-2 py-1.5 font-mono font-semibold text-slate-800">{current.source}</dd></div>
            <div><dt className="text-slate-500">宛先</dt><dd className="mt-1 break-all rounded bg-slate-50 px-2 py-1.5 font-mono font-semibold text-slate-800">{current.destination}</dd></div>
          </dl>
        </div>
      </div>

      <section className={`mt-5 rounded-xl border p-4 transition ${configurationIsFinal ? 'border-emerald-300 bg-emerald-50' : configurationIsProposed ? 'border-sky-200 bg-sky-50' : 'border-slate-200 bg-slate-50'}`} aria-label="DHCPから受け取る設定の例">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><p className="text-sm font-bold text-slate-900">{configurationIsFinal ? 'PCで利用できる設定' : configurationIsProposed ? 'DHCP Serverが提案した設定' : 'DHCPで受け取る設定'}</p><p className="mt-1 text-xs text-slate-600">{configurationIsFinal ? 'ACK後、PCはこの例の設定を使って次の通信へ進めます。' : configurationIsProposed ? 'Requestで選び、ACKで確定します。' : 'Offer以降で、ネットワークに必要な情報が渡されます。'}</p></div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${configurationIsFinal ? 'bg-emerald-600 text-white' : configurationIsProposed ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{configurationIsFinal ? '確定' : configurationIsProposed ? '候補' : '待機中'}</span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['IPv4 Address', '192.168.1.10 /24'],
            ['Default Gateway', '192.168.1.1'],
            ['DNS Server', '192.168.1.53'],
            ['Lease', '8 hours（例）'],
          ].map(([label, value]) => <div key={label} className={`rounded-lg border px-3 py-2.5 ${configurationIsProposed ? 'border-white bg-white/90' : 'border-slate-200 bg-white'}`}><p className="text-[10px] font-semibold text-slate-500">{label}</p><code className="mt-1 block break-all text-xs font-bold text-slate-800">{value}</code></div>)}
        </div>
      </section>
    </div>

    <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>教材上の簡略化：</b>ここでは同一LANにDHCP Serverがある初回取得の代表例を示しています。実際にはOFFER / ACKがunicastになる場合、別ネットワークのDHCP ServerへDHCP Relayが中継する場合、既存リースを更新する場合などがあります。</p>
  </section>
}

export default DhcpLesson
