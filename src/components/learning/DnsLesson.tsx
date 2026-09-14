import { lazy, Suspense, useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

const DnsThreeScene = lazy(() => import('./DnsThreeScene'))

type DnsLessonProps = {
  onNavigate: Navigate
}

type DnsStep = {
  shortTitle: string
  title: string
  body: string
  detail: string
}

const DNS_STEPS: DnsStep[] = [
  {
    shortTitle: '名前を確認',
    title: 'Webサイトの名前だけでは、まだ配送先が決まらない',
    body: 'ブラウザはURLからホスト名 docs.example.test を取り出します。ネットワーク上で配送するには、対応するIPアドレスなどの情報が必要です。',
    detail: 'DNSが主に扱うのはホスト名です。/guide のようなパス（Path）や ?topic=network のようなクエリ（Query）は、通常DNS問い合わせには含まれません。',
  },
  {
    shortTitle: 'DNS問い合わせ',
    title: 'PCは設定済みのDNSリゾルバへ問い合わせる',
    body: 'PCは、DHCPや手動設定などで知っているDNSリゾルバへ、docs.example.test のAレコードを問い合わせる代表例を示します。',
    detail: 'PCが直接ルートDNSサーバー（Root DNS Server）へ問い合わせるわけではありません。この教材のDNSサーバーは、問い合わせを受け取る再帰リゾルバーを代表しています。',
  },
  {
    shortTitle: 'キャッシュを確認',
    title: 'DNSリゾルバが、以前の回答を使えるか確かめる',
    body: 'DNSリゾルバは、保存済みの回答が有効かを確認します。使える回答があれば、上流へ問い合わせずにPCへ返せます。',
    detail: 'ブラウザ、OS、DNSリゾルバなど複数の場所にキャッシュが存在し得ます。ここではリゾルバのキャッシュに絞って表しています。',
  },
  {
    shortTitle: '情報を得る',
    title: '必要なときだけ、リゾルバが上流へ問い合わせる',
    body: 'キャッシュに回答がなければ、リゾルバーはフォワーダーや権威DNSなど、設定された上流の仕組みを使って情報を得ます。',
    detail: 'ルート・TLD・権威DNSの詳しい往復、CNAME連鎖、DNSSEC検証などは、この最初の教材では省略しています。',
  },
  {
    shortTitle: 'DNS応答',
    title: '接続先の情報をPCへ返し、次の通信へ進む',
    body: 'DNSリゾルバーは回答をキャッシュし、PCへDNS応答（DNS Answer）を返します。PCは得たIPアドレスを手がかりに、次にWebサーバーへの通信を始めます。',
    detail: 'DNS応答を受け取っただけでは、TCP接続やHTTP通信は完了していません。これはWebアクセスの前段にある名前解決です。',
  },
]

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

export function DnsLesson({ onNavigate }: DnsLessonProps) {
  const [step, setStep] = useState(0)
  const [cacheHit, setCacheHit] = useState(false)
  const [sceneVersion, setSceneVersion] = useState(0)
  const current = DNS_STEPS[step]
  const dynamicTitle = step === 3 && cacheHit ? 'キャッシュにある回答を使う' : current.title
  const dynamicBody = step === 3 && cacheHit
    ? '有効な回答がキャッシュにあれば、DNSリゾルバーは上流DNSへ問い合わせず、保存済みの情報からDNS応答（DNS Answer）を準備できます。'
    : current.body
  const dynamicDetail = step === 3 && cacheHit
    ? 'キャッシュにはTTL（Time To Live）など、有効期間に関わる情報があります。期限切れや更新が必要な場合は、再び上流へ問い合わせます。'
    : current.detail
  const sceneSummary = [
    { signal: 'まだDNS送信なし', focus: 'URLからホスト名だけを取り出す', result: '名前を問い合わせる準備ができました' },
    { signal: 'DNS問い合わせ', focus: 'PC → 家庭用ルーター', result: '設定済みリゾルバーへ向かいます' },
    { signal: 'DNS問い合わせ', focus: '家庭用ルーター → DNSリゾルバー', result: 'リゾルバーがキャッシュを確認します' },
    cacheHit
      ? { signal: 'リゾルバーキャッシュ', focus: '有効な回答を再利用する', result: '上流DNSへの問い合わせを省略します' }
      : { signal: '上流への問い合わせ', focus: 'リゾルバーが必要な情報を上流へ問い合わせる', result: '回答を得てキャッシュへ保存します' },
    { signal: 'DNS応答', focus: 'DNSリゾルバー → 家庭用ルーター → PC', result: '203.0.113.10 を受け取ります' },
  ] as const
  const currentScene = sceneSummary[step]

  const chooseStep = (index: number) => {
    setStep(index)
    setSceneVersion(version => version + 1)
  }

  return <section aria-label="DNSの3Dステップシミュレーション" className="rounded-3xl border border-indigo-200 bg-indigo-50/40 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="eyebrow text-indigo-700">操作して学ぶDNS</p><h2 className="mt-2 text-xl font-bold text-slate-900">名前をリゾルバー（Resolver）へ尋ね、接続先の情報を得る</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="DNS問い合わせ（DNS Query）とDNS応答（DNS Answer）の移動、リゾルバーキャッシュ、必要なときだけ行う上流への問い合わせを、段階を止めながら確かめます。" onNavigate={onNavigate} /></p></div>
      <span className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-800">{step + 1} / {DNS_STEPS.length}</span>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" role="tablist" aria-label="DNS名前解決の段階">
      {DNS_STEPS.map((item, index) => <button key={item.shortTitle} type="button" role="tab" aria-selected={step === index} onClick={() => chooseStep(index)} className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${step === index ? 'border-indigo-500 bg-white text-indigo-900 shadow-sm' : 'border-indigo-100 bg-indigo-50 text-slate-600 hover:border-indigo-300 hover:bg-white'}`}><span className="block text-[10px] text-indigo-700">{index + 1}</span><span className="mt-1 block">{item.shortTitle}</span></button>)}
    </div>

    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-white p-4">
      <div><p className="text-sm font-bold text-slate-900">リゾルバーキャッシュの状態</p><p className="mt-1 text-xs leading-6 text-slate-600">同じ名前でも、キャッシュが使えるかで上流への問い合わせの有無が変わります。</p></div>
      <div className="flex rounded-xl border border-indigo-200 bg-indigo-50 p-1" role="group" aria-label="リゾルバーキャッシュの状態を選択">
        <button type="button" aria-pressed={!cacheHit} onClick={() => { setCacheHit(false); setSceneVersion(version => version + 1) }} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${!cacheHit ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600 hover:text-indigo-800'}`}>キャッシュなし</button>
        <button type="button" aria-pressed={cacheHit} onClick={() => { setCacheHit(true); setSceneVersion(version => version + 1) }} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${cacheHit ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-600 hover:text-indigo-800'}`}>キャッシュあり</button>
      </div>
    </div>

    <section className="mt-6 overflow-hidden rounded-2xl border border-indigo-200 bg-white" aria-label="DNSの3Dシミュレーション">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 bg-indigo-50 px-4 py-3">
        <div><p className="eyebrow text-indigo-700">3D DNSシミュレーション</p><p className="mt-1 text-sm font-bold text-slate-900">{currentScene.signal}</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setSceneVersion(version => version + 1)} className="rounded-lg border border-indigo-300 bg-white px-3 py-2 text-xs font-bold text-indigo-800 transition hover:border-indigo-500 hover:bg-indigo-50">この動きを再生</button><button type="button" onClick={() => { setStep(0); setSceneVersion(version => version + 1) }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">最初に戻す</button></div>
      </div>
      <div className="h-[320px] bg-indigo-50/40 sm:h-[350px]"><Suspense fallback={<div className="flex h-full items-center justify-center text-sm font-semibold text-slate-600">3Dシミュレーションを準備しています…</div>}><DnsThreeScene step={step} replayKey={sceneVersion} cacheHit={cacheHit} /></Suspense></div>
      <div className="grid gap-2 border-t border-indigo-100 bg-white p-4 text-xs leading-6 sm:grid-cols-3" aria-live="polite">
        <div className="rounded-lg bg-slate-50 px-3 py-2"><span className="font-bold text-slate-500">現在の信号</span><p className="mt-1 font-semibold text-slate-800">{currentScene.signal}</p></div>
        <div className="rounded-lg bg-slate-50 px-3 py-2"><span className="font-bold text-slate-500">見るポイント</span><p className="mt-1 text-slate-800">{currentScene.focus}</p></div>
        <div className="rounded-lg bg-slate-50 px-3 py-2"><span className="font-bold text-slate-500">結果</span><p className="mt-1 text-slate-800">{currentScene.result}</p></div>
      </div>
    </section>

    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-live="polite">
      <p className="text-xs font-bold text-indigo-800">{current.shortTitle}</p><h3 className="mt-1 text-base font-bold text-slate-900">{dynamicTitle}</h3><p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={dynamicBody} onNavigate={onNavigate} /></p><p className="mt-3 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><LinkedText text={dynamicDetail} onNavigate={onNavigate} /></p>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <div className={`rounded-xl border p-3 ${step === 1 || step === 2 ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}><p className="text-xs font-bold text-slate-700">DNS問い合わせ（例）</p><code className="mt-2 block break-words text-xs leading-6 text-indigo-950">QNAME: docs.example.test<br />QTYPE: A</code></div>
        <div className={`rounded-xl border p-3 ${step >= 2 ? cacheHit ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}><p className="text-xs font-bold text-slate-700">リゾルバーキャッシュ（例）</p><code className="mt-2 block break-words text-xs leading-6 text-slate-800">{cacheHit ? 'docs.example.test → 203.0.113.10\nTTL: 300秒' : step >= 3 ? 'キャッシュミス → 回答を保存\nTTL: 300秒' : 'まだ回答を確認していません'}</code></div>
        <div className={`rounded-xl border p-3 ${step === 4 ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}><p className="text-xs font-bold text-slate-700">DNS応答（例）</p><code className="mt-2 block break-words text-xs leading-6 text-emerald-900">docs.example.test<br />A 203.0.113.10</code></div>
      </div>
    </section>

    <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>教材上の簡略化：</b>このページではAレコードを代表例にしています。DNSはIPアドレス以外の情報も扱い、UDP 53番で利用されることが多い一方、TCP、DoT、DoH、DoQなどの方式もあります。<code>203.0.113.0/24</code> は説明用に予約されたアドレスです。</p>
  </section>
}

export default DnsLesson
