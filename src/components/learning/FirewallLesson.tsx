import { useMemo, useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type PacketDirection = 'outbound' | 'inbound'
type ConnectionState = 'NEW' | 'ESTABLISHED'

type ExamplePacket = {
  id: string
  label: string
  title: string
  direction: PacketDirection
  state: ConnectionState
  protocol: 'TCP'
  source: string
  destination: string
  destinationPort: number
  description: string
  learningNote: string
}

type FirewallRule = {
  id: string
  name: string
  condition: string
  action: '許可' | '拒否'
  description: string
  matches: (packet: ExamplePacket) => boolean
}

const EXAMPLE_PACKETS: ExamplePacket[] = [
  {
    id: 'https-request',
    label: 'HTTPSを開く',
    title: 'PCからWebサーバーへ HTTPS を始める',
    direction: 'outbound',
    state: 'NEW',
    protocol: 'TCP',
    source: '192.168.1.10:51514',
    destination: '198.51.100.30:443',
    destinationPort: 443,
    description: 'PCが外部のWebサーバーへ、新しいHTTPS通信を開始しようとしています。',
    learningNote: '外向きのTCP 443番ポートを許可するルールに一致するため、この例では通信を通します。',
  },
  {
    id: 'ssh-inbound',
    label: '外部からSSH',
    title: 'インターネット側から PC の SSH へ接続する',
    direction: 'inbound',
    state: 'NEW',
    protocol: 'TCP',
    source: '203.0.113.50:53000',
    destination: '192.168.1.10:22',
    destinationPort: 22,
    description: '外部の端末が、家庭内PCのSSH用ポートへ新しい接続を始めようとしています。',
    learningNote: '管理ネットワークからの接続だけを許可するルールには一致せず、最後の既定拒否で止まります。',
  },
  {
    id: 'https-response',
    label: 'HTTPSの返信',
    title: 'Webサーバーから既存 HTTPS 接続へ返信する',
    direction: 'inbound',
    state: 'ESTABLISHED',
    protocol: 'TCP',
    source: '198.51.100.30:443',
    destination: '192.168.1.10:51514',
    destinationPort: 51514,
    description: '先ほどPCが始めたHTTPS通信に対して、Webサーバーが応答を返しています。',
    learningNote: '状態を追跡するファイアウォールでは、既に確立した通信の返信を許可するルールで通せます。',
  },
]

const FIREWALL_RULES: FirewallRule[] = [
  {
    id: 'established-return',
    name: '既存通信の返信を許可',
    condition: '受信 / TCP / ESTABLISHED',
    action: '許可',
    description: '内部から始めた通信に対する返信を受け取るためのルールです。',
    matches: packet => packet.direction === 'inbound' && packet.protocol === 'TCP' && packet.state === 'ESTABLISHED',
  },
  {
    id: 'outbound-https',
    name: '外向き HTTPS を許可',
    condition: '送信 / TCP / 宛先 443 / NEW',
    action: '許可',
    description: 'PCがWebサイトへ新しいHTTPS接続を始めることを許可します。',
    matches: packet => packet.direction === 'outbound' && packet.protocol === 'TCP' && packet.state === 'NEW' && packet.destinationPort === 443,
  },
  {
    id: 'admin-ssh',
    name: '管理ネットワークからの SSH だけ許可',
    condition: '受信 / TCP / 10.0.0.0/8 / 宛先 22',
    action: '許可',
    description: '決められた管理ネットワークからだけ、SSHの新規接続を許可する例です。',
    matches: packet => packet.direction === 'inbound' && packet.protocol === 'TCP' && packet.state === 'NEW' && packet.destinationPort === 22 && packet.source.startsWith('10.'),
  },
  {
    id: 'default-deny',
    name: '既定の拒否',
    condition: '上のルールに一致しない通信',
    action: '拒否',
    description: '許可する理由が見つからない通信は通さない、という安全側の既定動作です。',
    matches: () => true,
  },
]

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

function actionClass(action: FirewallRule['action']) {
  return action === '許可'
    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
    : 'border-rose-300 bg-rose-50 text-rose-900'
}

/**
 * A small, intentionally simplified rule-evaluation model. It is isolated so
 * it can be registered as a LearningTopic without changing the existing
 * visualizer or shared learning UI.
 */
export function FirewallLesson({ onNavigate }: { onNavigate: Navigate }) {
  const [packetId, setPacketId] = useState<ExamplePacket['id']>('https-request')
  const packet = EXAMPLE_PACKETS.find(item => item.id === packetId) ?? EXAMPLE_PACKETS[0]
  const matchedRuleIndex = useMemo(() => FIREWALL_RULES.findIndex(rule => rule.matches(packet)), [packet])
  const matchedRule = FIREWALL_RULES[matchedRuleIndex]
  const directionLabel = packet.direction === 'outbound' ? '送信（LAN → Internet）' : '受信（Internet → LAN）'

  return <section aria-label="Firewallのルール判定を追う図解" className="rounded-3xl border border-slate-300 bg-slate-50 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow">INTERACTIVE FIREWALL</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">通信を上から順に照合して、通すか決める</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="Firewallは、通信の送受信方向、IPアドレス、TCPのPort、通信状態などを条件として、通すか止めるかを決める仕組みです。" onNavigate={onNavigate} /></p>
      </div>
      <span className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700">上から順に最初の一致を採用</span>
    </div>

    <div className="mt-6 grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="確認する通信を選択">
      {EXAMPLE_PACKETS.map(item => <button key={item.id} type="button" role="radio" aria-checked={packet.id === item.id} onClick={() => setPacketId(item.id)} className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${packet.id === item.id ? 'border-slate-500 bg-white text-slate-950 shadow-sm' : 'border-slate-200 bg-slate-100/70 text-slate-600 hover:border-slate-400 hover:bg-white'}`}>
        <span className="block text-[10px] font-bold tracking-[.12em] text-cyan-700">EXAMPLE</span>
        <span className="mt-1 block">{item.label}</span>
      </button>)}
    </div>

    <div className="mt-6 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-5" aria-live="polite">
        <p className="eyebrow">PACKET TO CHECK</p>
        <h3 className="mt-2 text-lg font-bold text-slate-900">{packet.title}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600"><LinkedText text={packet.description} onNavigate={onNavigate} /></p>
        <dl className="mt-5 grid gap-2 text-xs">
          {[
            ['方向', directionLabel],
            ['状態', packet.state],
            ['Protocol', packet.protocol],
            ['送信元', packet.source],
            ['宛先', packet.destination],
          ].map(([label, value]) => <div key={label} className="grid grid-cols-[5rem_1fr] gap-2 rounded-lg bg-slate-50 px-3 py-2"><dt className="font-semibold text-slate-500">{label}</dt><dd className="break-all font-mono text-slate-800">{value}</dd></div>)}
        </dl>
        <div className={`mt-5 rounded-xl border p-4 ${actionClass(matchedRule.action)}`}>
          <p className="text-xs font-bold">判定結果</p>
          <p className="mt-1 text-xl font-bold">{matchedRule.action}</p>
          <p className="mt-2 text-xs leading-6">一致したルール: {matchedRule.name}</p>
        </div>
      </aside>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-sm font-bold text-slate-900">ルールの評価順序（教育用の例）</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">各ルールを上から確認し、最初に一致したルールで判定を終えます。</p>
        </div>
        <ol className="divide-y divide-slate-100">
          {FIREWALL_RULES.map((rule, index) => {
            const isMatched = index === matchedRuleIndex
            const isChecked = index <= matchedRuleIndex
            return <li key={rule.id} className={`grid gap-3 px-5 py-4 sm:grid-cols-[2.25rem_1fr_auto] sm:items-center ${isMatched ? actionClass(rule.action) : isChecked ? 'bg-slate-50' : 'bg-white'}`}>
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${isMatched ? rule.action === '許可' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white' : isChecked ? 'bg-slate-300 text-slate-700' : 'bg-slate-100 text-slate-400'}`}>{index + 1}</span>
              <div>
                <p className="text-sm font-bold text-slate-900">{rule.name}{isMatched && <span className="ml-2 text-xs text-cyan-800">← 一致</span>}</p>
                <p className="mt-1 font-mono text-[11px] leading-5 text-slate-600">{rule.condition}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600"><LinkedText text={rule.description} onNavigate={onNavigate} /></p>
              </div>
              <span className={`w-fit rounded-full border px-2.5 py-1 text-xs font-bold ${rule.action === '許可' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'}`}>{rule.action}</span>
            </li>
          })}
        </ol>
      </div>
    </div>

    <div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
      <p className="text-sm font-bold text-cyan-950">この通信では何が起きる？</p>
      <p className="mt-2 text-sm leading-7 text-cyan-950/85"><LinkedText text={packet.learningNote} onNavigate={onNavigate} /></p>
    </div>

    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-950">
      <p className="font-bold">教材上の簡略化</p>
      <p className="mt-1"><LinkedText text="この図は状態を追跡する（stateful）Firewallの代表例です。実際にはstateful / statelessの違い、NAT、Interface、ログ、製品の仕様やルールの順番によって判定が変わります。Firewallは重要な防御の一つですが、認証、更新、暗号化、監視などを置き換える完全なセキュリティ対策ではありません。" onNavigate={onNavigate} /></p>
    </div>
  </section>
}

export default FirewallLesson
