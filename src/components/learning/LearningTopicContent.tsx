import { useMemo, useState } from 'react'
import { GLOSSARY_TERMS } from '../../data/glossary'
import { LEARNING_TOPIC_BY_ID } from '../../data/learningTopics'
import type { LearningTopic } from '../../types/learning'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type LessonProps = {
  topic: LearningTopic
  onNavigate: Navigate
}

const visualizationLabel = {
  'interactive-2d': '手を動かす2D図解',
  'step-animation': 'ステップで追う図解',
  '3d': '3D探索',
  'text-diagram': '図と文章',
} as const

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

function TopicLinks({ ids, title, onNavigate }: { ids: string[] | undefined; title: string; onNavigate: Navigate }) {
  const topics = (ids ?? []).map(id => LEARNING_TOPIC_BY_ID.get(id)).filter((topic): topic is LearningTopic => Boolean(topic))
  if (topics.length === 0) return null
  return <section className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="eyebrow">LEARNING CONNECTION</p>
    <h2 className="mt-2 text-lg font-bold text-slate-900">{title}</h2>
    <div className="mt-4 flex flex-wrap gap-2">
      {topics.map(topic => <button key={topic.id} type="button" onClick={() => onNavigate(`/learn/${topic.id}`)} className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-left text-sm font-semibold text-cyan-900 transition hover:border-cyan-400 hover:bg-cyan-100">
        {topic.shortTitle}<span className="ml-2 text-cyan-700">→</span>
      </button>)}
    </div>
  </section>
}

function ArpLesson({ onNavigate }: Pick<LessonProps, 'onNavigate'>) {
  const [step, setStep] = useState(0)
  const steps = [
    {
      label: '最初の疑問',
      title: 'Webサーバーは別のネットワークにある',
      body: 'PCは宛先IPアドレスを知っています。しかしEthernet FrameをLANへ出すには、次に受け取る機器のMACアドレスが必要です。',
      detail: 'この例で次に受け取るのは、インターネット側のWebサーバーではなく、PCの出口であるデフォルトゲートウェイです。',
      active: 'pc',
    },
    {
      label: 'ARP Request',
      title: '「192.168.1.1を持っているのは誰？」と尋ねる',
      body: 'PCはARP RequestをLAN内へブロードキャストします。Switchは同じブロードキャストドメイン内のポートへ転送します。',
      detail: 'ARP RequestはIPネットワークを越えて送られません。ルーターの外側へWebサーバーを探しに行くものではありません。',
      active: 'switch',
    },
    {
      label: 'ARP Reply',
      title: 'Home Routerが自分のMACアドレスを返す',
      body: '192.168.1.1を持つHome Routerは、自分のMACアドレスを通常unicastでPCへ返します。',
      detail: 'PCは返答をARP cacheに一時的に記録します。期限や更新の扱いはOS・機器の実装によって異なります。',
      active: 'router',
    },
    {
      label: 'Frame送信',
      title: '次の相手のMACアドレスを使ってFrameを送る',
      body: 'PCは宛先MACをHome RouterのMACにしてEthernet Frameを送ります。内側のIP Packetの宛先はWebサーバーのままです。',
      detail: 'ルーターは次のリンクへ転送するとき、リンクごとに新しいEthernet Frameを作ります。',
      active: 'frame',
    },
  ] as const
  const current = steps[step]

  return <section aria-label="ARPのステップ図解" className="rounded-3xl border border-sky-200 bg-sky-50/50 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">INTERACTIVE ARP</p><h2 className="mt-2 text-xl font-bold text-slate-900">IPアドレスから、次のリンクの宛先を見つける</h2></div><span className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-bold text-sky-800">{step + 1} / {steps.length}</span></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-4" role="tablist" aria-label="ARPのステップ">
      {steps.map((item, index) => <button key={item.label} type="button" role="tab" aria-selected={step === index} onClick={() => setStep(index)} className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${step === index ? 'border-cyan-500 bg-white text-cyan-900 shadow-sm' : 'border-sky-100 bg-sky-50 text-slate-600 hover:border-cyan-300 hover:bg-white'}`}><span className="block text-[10px] text-cyan-700">{index + 1}</span><span className="mt-1 block">{item.label}</span></button>)}
    </div>
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className={`lesson-device ${current.active === 'pc' || current.active === 'frame' ? 'lesson-device-active' : ''}`}><span className="lesson-device-icon bg-sky-100 text-sky-800">PC</span><b>PC</b><span>192.168.1.10</span></div>
        <div className={`lesson-arrow ${step === 1 ? 'lesson-arrow-active' : ''}`} aria-hidden="true">{step === 1 ? '⇢' : '→'}</div>
        <div className={`lesson-device ${current.active === 'switch' ? 'lesson-device-active' : ''}`}><span className="lesson-device-icon bg-violet-100 text-violet-800">SW</span><b>LAN Switch</b><span>同一LAN内で転送</span></div>
        <div className={`lesson-arrow ${step >= 1 ? 'lesson-arrow-active' : ''}`} aria-hidden="true">{step >= 1 ? '⇢' : '→'}</div>
        <div className={`lesson-device ${current.active === 'router' || current.active === 'frame' ? 'lesson-device-active' : ''}`}><span className="lesson-device-icon bg-amber-100 text-amber-800">GW</span><b>Home Router</b><span>192.168.1.1</span></div>
      </div>
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite"><p className="text-xs font-bold text-cyan-800">{current.label}</p><h3 className="mt-1 text-base font-bold text-slate-900">{current.title}</h3><p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={current.body} onNavigate={onNavigate} /></p><p className="mt-2 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><LinkedText text={current.detail} onNavigate={onNavigate} /></p></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className={`rounded-xl border p-3 ${step === 1 ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200 bg-white'}`}><p className="text-xs font-bold text-slate-700">ARP Request（例）</p><code className="mt-2 block break-words text-xs leading-6 text-cyan-900">Who has 192.168.1.1?<br />Tell 192.168.1.10</code></div><div className={`rounded-xl border p-3 ${step >= 2 ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}><p className="text-xs font-bold text-slate-700">ARP cache（例）</p><code className="mt-2 block break-words text-xs leading-6 text-emerald-900">192.168.1.1 → 02:00:5E:10:00:01</code></div></div>
    </div>
    <p className="mt-4 text-xs leading-6 text-slate-600">IPv4 LANの代表例を示しています。IPv6では、同じ目的にNeighbor Discovery Protocol（NDP）が使われ、ARPは使われません。</p>
  </section>
}

type Route = { prefix: string; nextHop: string; interfaceName: string; purpose: string }

const ROUTES: Route[] = [
  { prefix: '192.168.1.0/24', nextHop: '直結', interfaceName: 'lan0', purpose: '家庭内LAN' },
  { prefix: '10.0.0.0/8', nextHop: '10.20.0.1', interfaceName: 'wan1', purpose: '社内ネットワーク' },
  { prefix: '10.20.0.0/16', nextHop: '10.20.5.1', interfaceName: 'wan2', purpose: '社内のより具体的な経路' },
  { prefix: '0.0.0.0/0', nextHop: 'ISP Router', interfaceName: 'wan0', purpose: 'default route' },
]

const DESTINATIONS = ['192.168.1.42', '10.50.1.9', '10.20.3.18', '203.0.113.72'] as const

function bitsForIPv4(address: string) {
  return address.split('.').map(value => Number(value).toString(2).padStart(8, '0')).join('')
}

function routeMatches(address: string, prefix: string) {
  const [network, lengthText] = prefix.split('/')
  const length = Number(lengthText)
  return bitsForIPv4(address).slice(0, length) === bitsForIPv4(network).slice(0, length)
}

function prefixLength(prefix: string) {
  return Number(prefix.split('/')[1])
}

function RoutingLesson({ onNavigate }: Pick<LessonProps, 'onNavigate'>) {
  const [destination, setDestination] = useState<(typeof DESTINATIONS)[number]>('10.20.3.18')
  const matches = useMemo(() => ROUTES.filter(route => routeMatches(destination, route.prefix)), [destination])
  const selected = useMemo(() => [...matches].sort((a, b) => prefixLength(b.prefix) - prefixLength(a.prefix))[0], [matches])

  return <section aria-label="CIDRとLongest Prefix Matchの図解" className="rounded-3xl border border-violet-200 bg-violet-50/45 p-5 sm:p-7">
    <p className="eyebrow">INTERACTIVE ROUTING</p><h2 className="mt-2 text-xl font-bold text-slate-900">宛先を選び、最も具体的な経路を確かめる</h2>
    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="ルーターは宛先IPv4アドレスとRouting Tableを照合します。複数の経路が一致するときは、通常、Prefixが最も長い（より多くの先頭ビットが一致する）経路を選びます。" onNavigate={onNavigate} /></p>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="radiogroup" aria-label="宛先IPアドレスを選択">
      {DESTINATIONS.map(address => <button key={address} type="button" role="radio" aria-checked={destination === address} onClick={() => setDestination(address)} className={`rounded-xl border px-4 py-3 text-left font-mono text-sm font-bold transition ${destination === address ? 'border-violet-500 bg-white text-violet-950 shadow-sm' : 'border-violet-100 bg-violet-50 text-slate-700 hover:border-violet-300 hover:bg-white'}`}>{address}</button>)}
    </div>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_.85fr]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-200 bg-slate-50 px-4 py-3"><p className="text-sm font-bold text-slate-900">Routing Table（教育用の例）</p></div><div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3 font-semibold">Destination</th><th className="px-4 py-3 font-semibold">Next Hop</th><th className="px-4 py-3 font-semibold">Interface</th></tr></thead><tbody>{ROUTES.map(route => { const matchesDestination = routeMatches(destination, route.prefix); const isSelected = selected?.prefix === route.prefix; return <tr key={route.prefix} className={`border-t border-slate-100 ${isSelected ? 'bg-emerald-50' : matchesDestination ? 'bg-amber-50' : 'bg-white'}`}><td className="px-4 py-3"><code className="font-semibold text-slate-900">{route.prefix}</code><span className="mt-1 block text-[10px] text-slate-500">{route.purpose}</span></td><td className="px-4 py-3 text-slate-700">{route.nextHop}</td><td className="px-4 py-3 font-mono text-slate-700">{route.interfaceName}</td></tr> })}</tbody></table></div></div>
      <aside className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="eyebrow text-emerald-700">ROUTE DECISION</p><p className="mt-3 text-sm text-slate-700">宛先</p><code className="mt-1 block text-lg font-bold text-slate-900">{destination}</code><div className="mt-4 border-t border-emerald-200 pt-4"><p className="text-xs font-semibold text-emerald-900">一致した経路</p><p className="mt-1 text-sm leading-6 text-slate-700">{matches.map(route => route.prefix).join(' / ')}</p></div><div className="mt-4 rounded-xl border border-emerald-300 bg-white p-3"><p className="text-xs font-semibold text-emerald-900">選ばれる経路</p><code className="mt-1 block text-base font-bold text-emerald-900">{selected?.prefix}</code><p className="mt-1 text-xs leading-5 text-slate-600">{selected?.nextHop} / {selected?.interfaceName}</p></div></aside>
    </div>
    <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950">たとえば <code>10.20.3.18</code> は <code>10.0.0.0/8</code> と <code>10.20.0.0/16</code> の両方に一致します。<code>/16</code> のほうが長く、より具体的なので選ばれます。どの経路にも具体的に一致しない場合は、<code>0.0.0.0/0</code> のdefault routeが候補になります。</p>
  </section>
}

function NatLesson({ onNavigate }: Pick<LessonProps, 'onNavigate'>) {
  const [step, setStep] = useState(0)
  const steps = [
    { title: '家庭内のPCが通信を始める', body: 'PCはPrivate IPアドレスと一時的な送信元Portを使って、Webサーバーへ向けたパケットをHome Routerへ送ります。', active: 'pc' },
    { title: 'Home Routerが対応表を作り、外向きに変換する', body: 'この例では、Home Routerが送信元を 192.168.1.10:51514 から 203.0.113.20:40001 へ変換します。Portも変える代表例はNAPTです。', active: 'router' },
    { title: 'Webサーバーは外側のアドレスへ返信する', body: '外部側から見ると返信先は 203.0.113.20:40001 です。ルーターは自分が保存した対応表を参照できます。', active: 'server' },
    { title: 'Home Routerが返信をPCへ戻す', body: '対応表にもとづき、宛先を 192.168.1.10:51514 へ戻して、家庭内のPCへ転送します。', active: 'return' },
  ] as const
  const current = steps[step]
  return <section aria-label="NATとNAPTのステップ図解" className="rounded-3xl border border-amber-200 bg-amber-50/45 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow text-amber-700">STEP BY STEP NAT / NAPT</p><h2 className="mt-2 text-xl font-bold text-slate-900">送信時の変換と、返信時の逆変換を追う</h2></div><span className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-amber-900">{step + 1} / {steps.length}</span></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-4">{steps.map((item, index) => <button key={item.title} type="button" aria-pressed={step === index} onClick={() => setStep(index)} className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${step === index ? 'border-amber-500 bg-white text-amber-950 shadow-sm' : 'border-amber-100 bg-amber-50 text-slate-600 hover:border-amber-300 hover:bg-white'}`}><span className="block text-[10px] text-amber-700">{index + 1}</span><span className="mt-1 block leading-5">{item.title}</span></button>)}</div>
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5"><div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1.2fr_auto_1fr]"><div className={`lesson-device ${current.active === 'pc' || current.active === 'return' ? 'lesson-device-active lesson-device-amber' : ''}`}><span className="lesson-device-icon bg-sky-100 text-sky-800">PC</span><b>Home PC</b><span>192.168.1.10:51514</span></div><div className={`lesson-arrow ${step === 1 || step === 3 ? 'lesson-arrow-active lesson-arrow-amber' : ''}`} aria-hidden="true">{step === 3 ? '←' : '→'}</div><div className={`lesson-device ${current.active === 'router' || current.active === 'return' ? 'lesson-device-active lesson-device-amber' : ''}`}><span className="lesson-device-icon bg-amber-100 text-amber-800">NAT</span><b>Home Router</b><span>対応表を保持</span></div><div className={`lesson-arrow ${step >= 1 && step <= 2 ? 'lesson-arrow-active lesson-arrow-amber' : ''}`} aria-hidden="true">{step === 2 ? '←' : '→'}</div><div className={`lesson-device ${current.active === 'server' ? 'lesson-device-active lesson-device-amber' : ''}`}><span className="lesson-device-icon bg-emerald-100 text-emerald-800">WEB</span><b>Web Server</b><span>198.51.100.30:443</span></div></div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_.95fr]"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite"><h3 className="font-bold text-slate-900">{current.title}</h3><p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={current.body} onNavigate={onNavigate} /></p></div><div className={`rounded-xl border p-4 ${step >= 1 ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}><p className="text-xs font-bold text-slate-800">NAPT対応表（例）</p><div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]"><span className="rounded bg-white px-2 py-2 text-slate-500">Inside</span><span className="rounded bg-white px-2 py-2 text-slate-500">Outside</span><code className="rounded bg-white px-2 py-2 text-slate-800">192.168.1.10:51514</code><code className="rounded bg-white px-2 py-2 text-amber-900">203.0.113.20:40001</code></div></div></div>
    </div>
    <p className="mt-4 text-xs leading-6 text-slate-600">NATは広い意味のアドレス変換です。家庭用ルーターでPortまで変換して複数端末を区別する代表例を、この教材ではNAPTとして示しています。<code>203.0.113.0/24</code> と <code>198.51.100.0/24</code> は説明用に予約されたアドレスです。</p>
  </section>
}

function LessonBody({ topic, onNavigate }: LessonProps) {
  if (topic.id === 'arp') return <ArpLesson onNavigate={onNavigate} />
  if (topic.id === 'routing') return <RoutingLesson onNavigate={onNavigate} />
  return <NatLesson onNavigate={onNavigate} />
}

export function LearningTopicContent({ topic, onNavigate }: LessonProps) {
  const glossaryTerms = topic.glossaryTerms.map(termId => GLOSSARY_TERMS.find(term => term.id === termId)).filter((term): term is (typeof GLOSSARY_TERMS)[number] => Boolean(term))
  return <>
    <section className="grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
      <div><p className="eyebrow">NETWORK LEARNING · {visualizationLabel[topic.visualization]}</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{topic.title}</h1><p className="mt-5 max-w-3xl text-base leading-8 text-slate-600"><LinkedText text={topic.summary} onNavigate={onNavigate} /></p></div>
      <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-sm font-bold text-amber-950">なぜ必要？</p><p className="mt-2 text-sm leading-7 text-amber-950/85"><LinkedText text={topic.why} onNavigate={onNavigate} /></p></aside>
    </section>
    <section className="mt-9 rounded-2xl border border-slate-200 bg-white p-5"><p className="eyebrow">LEARNING GOALS</p><ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700 sm:grid-cols-3">{topic.learningGoals.map(goal => <li key={goal} className="rounded-xl bg-slate-50 px-3 py-3"><span className="mr-2 font-bold text-cyan-700">✓</span>{goal}</li>)}</ul></section>
    <div className="mt-9"><LessonBody topic={topic} onNavigate={onNavigate} /></div>
    <section className="mt-9 rounded-2xl border border-cyan-200 bg-cyan-50 p-6"><p className="eyebrow">CONNECTION TO THE SIMULATOR</p><h2 className="mt-2 text-lg font-bold text-slate-900">既存のWebアクセスシミュレーションで確かめる</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700">この教材は、URLアクセスの流れに登場する仕組みを一つだけ取り出して見ています。全体の位置に戻ると、PC・Switch・Router・Ethernet・IPがどの順で関わるかを確認できます。</p>{topic.simulatorPath && <button type="button" onClick={() => onNavigate(topic.simulatorPath!)} className="mt-4 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-700">シミュレーションを開く</button>}</section>
    <div className="mt-8 grid gap-4 md:grid-cols-2"><TopicLinks title="関連する教材" ids={topic.relatedTopics} onNavigate={onNavigate} /><TopicLinks title="次に学ぶ内容" ids={topic.nextTopics} onNavigate={onNavigate} /></div>
    <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-sm font-bold text-slate-900">教材上の簡略化</p><p className="mt-2 text-sm leading-7 text-slate-600">このページは、仕組みの関係を理解しやすくするための教育用モデルです。実際の機器構成、OSの実装、設定、通信のタイミングは環境によって異なります。</p><div className="mt-4 flex flex-wrap gap-2">{glossaryTerms.map(term => <button key={term.id} type="button" onClick={() => onNavigate(`/glossary/${term.id}`)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-50">{term.term} を調べる</button>)}</div></section>
  </>
}
