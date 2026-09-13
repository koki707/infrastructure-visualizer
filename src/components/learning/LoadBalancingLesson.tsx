import { useMemo, useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type LoadBalancingLessonProps = {
  onNavigate: Navigate
}

type BalancingAlgorithm = 'round-robin' | 'least-connections'

type Server = {
  id: 'web-1' | 'web-2' | 'web-3'
  name: string
  endpoint: string
  tone: 'sky' | 'violet' | 'amber'
}

type ServerId = Server['id']

type FlowStep = {
  id: 'request' | 'health' | 'route' | 'response'
  label: string
  title: string
  body: string
  detail: string
}

const SERVERS: Server[] = [
  { id: 'web-1', name: 'Web Server 1', endpoint: 'app-01', tone: 'sky' },
  { id: 'web-2', name: 'Web Server 2', endpoint: 'app-02', tone: 'violet' },
  { id: 'web-3', name: 'Web Server 3', endpoint: 'app-03', tone: 'amber' },
]

const INITIAL_CONNECTIONS: Record<ServerId, number> = { 'web-1': 2, 'web-2': 0, 'web-3': 1 }

const FLOW_STEPS: FlowStep[] = [
  {
    id: 'request',
    label: 'REQUEST',
    title: 'ClientのリクエストがLoad Balancerへ届く',
    body: 'Clientはサービスの入口となるLoad BalancerへHTTPS Requestを送ります。Clientは、後ろに複数のWeb Serverがあることを意識しない代表的な構成です。',
    detail: '実際にはDNS、TLS、HTTP、Network経路などがこの前後に関係します。この教材では、Load Balancerが受け取った後の振り分けに焦点を絞ります。',
  },
  {
    id: 'health',
    label: 'HEALTH',
    title: '利用できるServerを確認する',
    body: 'Load Balancerは、Health Checkの結果を使って、応答できないServerを新しい振り分け候補から外せます。この例ではWeb Server 3が障害状態なら候補に入りません。',
    detail: 'Health Checkは単にPortが開いているか、HTTPの応答、アプリケーション固有の状態などを確認する場合があります。「生きている」の定義はサービスごとに設計します。',
  },
  {
    id: 'route',
    label: 'ROUTE',
    title: '選んだルールで、1台のServerへ振り分ける',
    body: '利用可能なServerの中から、設定された方式で送り先を選びます。Round Robinは順番に回し、Least Connectionsは接続数が少ないServerを優先する代表例です。',
    detail: '最適な方式は、Serverの性能差、セッションの扱い、リクエストの重さ、地域、キャッシュなどで変わります。Load Balancerが常に均等なCPU使用率を保証するわけではありません。',
  },
  {
    id: 'response',
    label: 'RESPONSE',
    title: '選ばれたServerが処理し、応答がClientへ戻る',
    body: 'Web Serverはリクエストを処理し、ResponseをLoad Balancerを経由してClientへ返します。利用者からは1つのサービスに見えても、裏側では複数のServerが協力できます。',
    detail: '実際の構成では、Sessionの維持、Cookieによる固定、Retry、Timeout、DatabaseやCacheへの接続など、追加の設計が必要になることがあります。',
  },
]

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

function statusClass(isHealthy: boolean) {
  return isHealthy
    ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
    : 'border-rose-200 bg-rose-50 text-rose-950'
}

function serverTone(tone: Server['tone']) {
  if (tone === 'sky') return 'border-sky-200 bg-sky-50 text-sky-950'
  if (tone === 'violet') return 'border-violet-200 bg-violet-50 text-violet-950'
  return 'border-amber-200 bg-amber-50 text-amber-950'
}

/**
 * A pauseable, deterministic request-routing lesson. It deliberately models
 * health-aware server selection rather than a production load balancer.
 */
export function LoadBalancingLesson({ onNavigate }: LoadBalancingLessonProps) {
  const [step, setStep] = useState(0)
  const [algorithm, setAlgorithm] = useState<BalancingAlgorithm>('round-robin')
  const [requestNumber, setRequestNumber] = useState(1)
  const [web3Healthy, setWeb3Healthy] = useState(false)
  const [connections, setConnections] = useState<Record<ServerId, number>>(() => ({ ...INITIAL_CONNECTIONS }))
  const current = FLOW_STEPS[step]
  const healthByServer = { 'web-1': true, 'web-2': true, 'web-3': web3Healthy } as const
  const healthyServers = SERVERS.filter(server => healthByServer[server.id])
  const selectedServer = useMemo(() => {
    if (algorithm === 'least-connections') {
      return healthyServers.reduce((selected, server) => connections[server.id] < connections[selected.id] ? server : selected)
    }
    return healthyServers[(requestNumber - 1) % healthyServers.length]
  }, [algorithm, healthyServers, requestNumber, connections])

  const algorithmLabel = algorithm === 'round-robin' ? 'Round Robin' : 'Least Connections'
  const eligibleNames = healthyServers.map(server => server.name).join(' / ')
  const pathIsVisible = step >= 2
  const responseIsVisible = step === FLOW_STEPS.length - 1

  const reset = () => {
    setStep(0)
    setRequestNumber(1)
    setAlgorithm('round-robin')
    setWeb3Healthy(false)
    setConnections({ ...INITIAL_CONNECTIONS })
  }

  const nextRequest = () => {
    setConnections(currentConnections => ({
      ...currentConnections,
      [selectedServer.id]: currentConnections[selectedServer.id] + 1,
    }))
    setRequestNumber(value => value + 1)
    setStep(0)
  }

  return <section aria-label="Load Balancerのリクエスト振り分け図解" className="rounded-3xl border border-cyan-200 bg-cyan-50/45 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow text-cyan-700">INTERACTIVE SYSTEM DESIGN</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">1つの入口から、利用可能なServerへリクエストを送る</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="Load Balancerは、Clientから来たRequestを複数のWeb Serverへ振り分ける役割を持つ仕組みです。ここでは「何を確認して、どのServerを選ぶか」を段階ごとに止めて確認できます。" onNavigate={onNavigate} /></p>
      </div>
      <span className="rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-bold text-cyan-800">REQUEST #{requestNumber} · {step + 1} / {FLOW_STEPS.length}</span>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="tablist" aria-label="Load Balancerの処理段階">
      {FLOW_STEPS.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={step === index} onClick={() => setStep(index)} className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${step === index ? 'border-cyan-500 bg-white text-cyan-950 shadow-sm' : 'border-cyan-100 bg-cyan-50 text-slate-600 hover:border-cyan-300 hover:bg-white'}`}><span className="block text-[10px] text-cyan-700">{index + 1}</span><span className="mt-1 block">{item.label}</span></button>)}
    </div>

    <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
      <div className="flex flex-wrap gap-2" aria-label="振り分け条件の操作">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          <button type="button" onClick={() => setAlgorithm('round-robin')} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${algorithm === 'round-robin' ? 'bg-cyan-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Round Robin</button>
          <button type="button" onClick={() => setAlgorithm('least-connections')} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${algorithm === 'least-connections' ? 'bg-cyan-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Least Connections</button>
        </div>
        <button type="button" onClick={() => setWeb3Healthy(value => !value)} className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${web3Healthy ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100' : 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100'}`}>Web Server 3を{web3Healthy ? '障害状態にする' : '復帰させる'}</button>
      </div>
      <div className="flex flex-wrap justify-start gap-2 lg:justify-end"><button type="button" onClick={() => setStep(value => Math.max(0, value - 1))} disabled={step === 0} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-45">← 前の状態</button><button type="button" onClick={() => setStep(value => Math.min(FLOW_STEPS.length - 1, value + 1))} disabled={step === FLOW_STEPS.length - 1} className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-45">次の状態 →</button><button type="button" onClick={nextRequest} className="rounded-lg border border-cyan-300 bg-white px-3 py-2 text-xs font-bold text-cyan-800 transition hover:bg-cyan-50">次のRequest</button><button type="button" onClick={reset} className="rounded-lg px-2 py-2 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-slate-900">リセット</button></div>
    </div>

    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div aria-live="polite"><p className="text-xs font-bold text-cyan-800">{current.label}</p><h3 className="mt-1 text-lg font-bold text-slate-900">{current.title}</h3><p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={current.body} onNavigate={onNavigate} /></p><p className="mt-3 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><LinkedText text={current.detail} onNavigate={onNavigate} /></p></div>
        <aside className="rounded-xl border border-cyan-200 bg-cyan-50 p-4"><p className="text-xs font-bold text-cyan-950">今回の選択</p><dl className="mt-3 space-y-2 text-xs"><div className="grid grid-cols-[7rem_1fr] gap-2"><dt className="text-slate-500">方式</dt><dd className="font-bold text-slate-800">{algorithmLabel}</dd></div><div className="grid grid-cols-[7rem_1fr] gap-2"><dt className="text-slate-500">候補</dt><dd className="font-semibold text-slate-800">{eligibleNames}</dd></div><div className="grid grid-cols-[7rem_1fr] gap-2"><dt className="text-slate-500">選択結果</dt><dd className={`font-bold ${pathIsVisible ? 'text-cyan-900' : 'text-slate-400'}`}>{pathIsVisible ? selectedServer.name : '次の段階で決定'}</dd></div></dl><p className="mt-4 rounded-lg bg-white px-3 py-2 text-xs leading-6 text-slate-600">{algorithm === 'round-robin' ? 'Round Robinでは、利用可能なServerを順番に選びます。Request番号を進めると送り先が入れ替わります。' : `Least Connectionsでは、この時点で接続数が最も少ない ${selectedServer.name} を選びます。`}</p></aside>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-[.75fr_auto_.95fr_auto_1.6fr] xl:items-center">
        <article className={`lesson-device ${step === 0 || responseIsVisible ? 'lesson-device-active' : ''}`}><span className="lesson-device-icon bg-sky-100 text-sky-800">CLIENT</span><b>Client</b><span>HTTPS Request</span></article>
        <div className={`lesson-arrow ${step === 0 || responseIsVisible ? 'lesson-arrow-active' : ''}`} aria-hidden="true">{responseIsVisible ? '↔' : '→'}</div>
        <article className={`lesson-device ${step >= 1 ? 'lesson-device-active' : ''}`}><span className="lesson-device-icon bg-cyan-100 text-cyan-800">LB</span><b>Load Balancer</b><span>{step >= 1 ? 'Health / Routeを判断' : '入口で待機'}</span></article>
        <div className={`lesson-arrow ${pathIsVisible ? 'lesson-arrow-active' : ''}`} aria-hidden="true">→</div>
        <section className="grid gap-2 sm:grid-cols-3" aria-label="Web Server群">
          {SERVERS.map(server => {
            const isHealthy = healthByServer[server.id]
            const isSelected = pathIsVisible && selectedServer.id === server.id
            return <article key={server.id} className={`rounded-xl border p-3 transition ${isSelected ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100' : serverTone(server.tone)} ${!isHealthy ? 'opacity-65' : ''}`}>
              <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold tracking-[.1em]">WEB</span><span className={`h-2.5 w-2.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} title={isHealthy ? 'healthy' : 'unhealthy'} /></div>
              <p className="mt-2 text-xs font-bold text-slate-900">{server.name}</p><p className="mt-1 font-mono text-[10px] text-slate-600">{server.endpoint}</p><p className="mt-2 text-[10px] font-semibold text-slate-600">{isHealthy ? `接続数: ${connections[server.id]}` : '新規振り分けから除外'}</p>{isSelected && <p className="mt-2 rounded bg-cyan-600 px-1.5 py-1 text-center text-[10px] font-bold text-white">このRequestの送り先</p>}</article>
          })}
        </section>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <section className={`rounded-xl border p-4 ${statusClass(web3Healthy)}`}><p className="text-sm font-bold">Health Checkの見方</p><p className="mt-2 text-xs leading-6">{web3Healthy ? 'Web Server 3は応答できるため、次のRequestから候補に含まれます。Round Robinを選んで「次のRequest」を押すと、候補が3台で回ることを確認できます。' : 'Web Server 3はこの例ではHealth Checkに失敗しています。障害中のServerへ新しいRequestを送らないよう、候補から外します。'}</p></section>
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-bold text-slate-900">なぜ複数台にする？</p><p className="mt-2 text-xs leading-6 text-slate-700">複数のServerへ処理を分けると、1台あたりの負荷を下げたり、障害時に利用可能なServerへ寄せたりできます。ただしDatabase、Session、デプロイ、監視などの設計も必要になります。</p></section>
      </div>
    </div>

    <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>教材上の簡略化：</b>ここではL7のHTTP/HTTPS Requestを振り分ける代表例を示しています。「次のRequest」は選ばれたServerの接続数を+1として扱いますが、実際には接続の終了、重み付け、接続数の測り方も選択結果に影響します。Load BalancerにはL4/L7の違い、TLS終端、Session Affinity、Retry、Timeout、Auto Scaling、複数リージョンなど、設計上の選択肢があります。</p>
  </section>
}

export default LoadBalancingLesson
