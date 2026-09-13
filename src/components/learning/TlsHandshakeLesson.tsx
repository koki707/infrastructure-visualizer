import { useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type TlsHandshakeLessonProps = {
  onNavigate: Navigate
}

type TlsStep = {
  shortTitle: string
  title: string
  body: string
  detail: string
  clientLabel: string
  serverLabel: string
  direction: 'client-to-server' | 'server-to-client' | 'both'
  exchange: string[]
  protected: string
}

const TLS_STEPS: TlsStep[] = [
  {
    shortTitle: 'ClientHello',
    title: 'ブラウザが、利用できるTLSの条件を伝える',
    body: 'ブラウザは接続先の名前と、利用できるTLSの版・暗号スイート・鍵交換に関する情報などをServerへ送ります。これがTLS接続を始める代表的な最初のメッセージです。',
    detail: 'この時点ではHTTP Requestの本文はまだ保護されていません。ブラウザは、どの安全な組み合わせで通信できるかをServerとすり合わせようとしています。',
    clientLabel: '接続条件を提示',
    serverLabel: '条件を待つ',
    direction: 'client-to-server',
    exchange: ['接続先の名前（代表例）', '対応するTLSの条件', '鍵交換に必要な情報'],
    protected: 'まだHTTPデータは送らない',
  },
  {
    shortTitle: 'ServerHello / Certificate',
    title: 'Serverが選んだ条件と証明書を返す',
    body: 'Serverは選んだ通信条件を知らせ、通常は自分の証明書を送ります。証明書には接続先の名前に関する情報と公開鍵などが含まれ、ブラウザが「想定した相手か」を確認する手がかりになります。',
    detail: '証明書は単なる身分証ではありません。信頼できる発行者からの署名、対象の名前、有効期間などを、ブラウザが複数の観点から確認します。',
    clientLabel: '証明書を受け取る',
    serverLabel: '条件と証明書を送る',
    direction: 'server-to-client',
    exchange: ['選択されたTLSの条件', '証明書チェーン（代表例）', 'Serverの公開鍵に関する情報'],
    protected: '認証の材料を確認中',
  },
  {
    shortTitle: '証明書を検証',
    title: 'ブラウザが、接続先の正当性を確かめる',
    body: 'ブラウザは証明書の対象名がURLの接続先と合うか、有効期間内か、信頼できる発行者へたどれるか、署名が正しいかなどを確認します。問題があれば、通常は警告や接続失敗になります。',
    detail: '公開鍵は誰でも参照できる情報です。秘密に保つ必要があるのは対応する秘密鍵で、Serverは秘密鍵を持つことをプロトコル上で証明します。',
    clientLabel: '証明書を検証',
    serverLabel: '秘密鍵を保持',
    direction: 'both',
    exchange: ['対象名・有効期間の確認', '信頼の連鎖と署名の検証', 'Serverが秘密鍵を持つことの確認'],
    protected: 'なりすましを減らす確認',
  },
  {
    shortTitle: '共有秘密を導出',
    title: '双方が、通信を保護する鍵の材料を作る',
    body: '合意した鍵交換方式を使い、ブラウザとServerは共有秘密を導出します。そこから、以降の通信を保護する対称鍵（ここではセッション鍵と呼びます）をそれぞれが計算します。',
    detail: 'セッション鍵そのものを、そのままネットワークへ送るわけではありません。TLSの版や設定によってメッセージの構成は異なりますが、現在の代表的な方式では一時的な鍵交換を使う設計が広く利用されます。',
    clientLabel: '共有秘密を導出',
    serverLabel: '共有秘密を導出',
    direction: 'both',
    exchange: ['鍵交換の計算材料', '双方で導く共有秘密', '通信方向ごとの保護鍵'],
    protected: 'セッション鍵はネットワークへ平文送信しない',
  },
  {
    shortTitle: '保護された通信',
    title: 'TLSの上で、HTTPのデータを安全に運ぶ',
    body: 'ここからHTTP RequestやHTTP ResponseはTLSで保護されます。暗号化は内容を読まれにくくし、完全性の確認は途中で変更されていないかを確かめる助けになります。',
    detail: 'HTTPSは安全性に役立ちますが、Webサイト全体の安全性を単独で保証するものではありません。Server側の実装、ブラウザの検証、利用者の操作なども重要です。',
    clientLabel: '暗号化したHTTP Request',
    serverLabel: '暗号化したHTTP Response',
    direction: 'both',
    exchange: ['暗号化されたHTTP Request', '暗号化されたHTTP Response', '改ざんを検出するための情報'],
    protected: 'HTTPの内容をTLSで保護',
  },
]

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

function DirectionMark({ direction }: { direction: TlsStep['direction'] }) {
  if (direction === 'both') return <span aria-hidden="true" className="text-xl font-bold text-violet-600">⇄</span>
  return <span aria-hidden="true" className="text-xl font-bold text-violet-600">{direction === 'client-to-server' ? '→' : '←'}</span>
}

/** A deliberately high-level TLS lesson: it explains the purpose and sequence without implementing cryptography. */
export function TlsHandshakeLesson({ onNavigate }: TlsHandshakeLessonProps) {
  const [step, setStep] = useState(0)
  const current = TLS_STEPS[step]
  const isLastStep = step === TLS_STEPS.length - 1

  const previous = () => setStep(value => Math.max(0, value - 1))
  const next = () => setStep(value => Math.min(TLS_STEPS.length - 1, value + 1))

  return <section aria-label="TLSハンドシェイクのステップ図解" className="rounded-3xl border border-violet-200 bg-violet-50/50 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow text-violet-700">INTERACTIVE TLS</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">接続先を確認して、通信を保護するまで</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="TLSは、HTTPSなどで通信内容を保護し、接続先の確認を助ける仕組みです。各ポイントで止めながら、証明書・公開鍵・セッション鍵が担う役割を確認できます。" onNavigate={onNavigate} /></p>
      </div>
      <span className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-bold text-violet-800">{step + 1} / {TLS_STEPS.length}</span>
    </div>

    <div className="mt-6 grid gap-2 sm:grid-cols-5" role="tablist" aria-label="TLSハンドシェイクの段階">
      {TLS_STEPS.map((item, index) => <button
        key={item.shortTitle}
        id={`tls-step-${index}`}
        type="button"
        role="tab"
        aria-selected={step === index}
        aria-controls="tls-step-panel"
        onClick={() => setStep(index)}
        className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${step === index ? 'border-violet-500 bg-white text-violet-950 shadow-sm' : 'border-violet-100 bg-violet-50 text-slate-600 hover:border-violet-300 hover:bg-white'}`}
      >
        <span className="block text-[10px] text-violet-700">{index + 1}</span>
        <span className="mt-1 block leading-5">{item.shortTitle}</span>
      </button>)}
    </div>

    <div id="tls-step-panel" role="tabpanel" aria-labelledby={`tls-step-${step}`} className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1.1fr_auto_1fr]">
        <div className={`lesson-device ${current.direction === 'client-to-server' || current.direction === 'both' ? 'lesson-device-active' : ''}`}>
          <span className="lesson-device-icon bg-sky-100 text-sky-800">PC</span>
          <b>Browser</b>
          <span>{current.clientLabel}</span>
        </div>
        <div className={`lesson-arrow ${current.direction === 'client-to-server' || current.direction === 'both' ? 'lesson-arrow-active text-violet-600' : ''}`}><DirectionMark direction={current.direction} /></div>
        <div className="lesson-device">
          <span className="lesson-device-icon bg-violet-100 text-violet-800">TLS</span>
          <b>保護された通信路</b>
          <span>{current.protected}</span>
        </div>
        <div className={`lesson-arrow ${current.direction === 'server-to-client' || current.direction === 'both' ? 'lesson-arrow-active text-violet-600' : ''}`}><DirectionMark direction={current.direction} /></div>
        <div className={`lesson-device ${current.direction === 'server-to-client' || current.direction === 'both' ? 'lesson-device-active' : ''}`}>
          <span className="lesson-device-icon bg-emerald-100 text-emerald-800">WEB</span>
          <b>Web Server</b>
          <span>{current.serverLabel}</span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite">
          <p className="text-xs font-bold text-violet-800">TLS {current.shortTitle}</p>
          <h3 className="mt-1 text-base font-bold text-slate-900">{current.title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={current.body} onNavigate={onNavigate} /></p>
          <p className="mt-3 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><LinkedText text={current.detail} onNavigate={onNavigate} /></p>
        </div>
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
          <p className="text-xs font-bold text-violet-900">この段階で確認するもの</p>
          <ul className="mt-3 space-y-2 text-xs leading-6 text-slate-700">
            {current.exchange.map(item => <li key={item} className="rounded-lg border border-white bg-white/80 px-3 py-2"><LinkedText text={item} onNavigate={onNavigate} /></li>)}
          </ul>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs text-slate-600">{isLastStep ? 'TLSの接続準備ができた後、アプリケーションのデータを保護して運べます。' : '次の段階へ進む前に、今の役割を確認できます。'}</p>
        <div className="flex gap-2">
          <button type="button" onClick={previous} disabled={step === 0} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-violet-300 hover:text-violet-800 disabled:cursor-not-allowed disabled:opacity-40">前の段階</button>
          <button type="button" onClick={next} disabled={isLastStep} className="rounded-lg bg-violet-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-40">次の段階</button>
        </div>
      </div>
    </div>

    <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>教材上の簡略化：</b>TLS 1.2 / 1.3、暗号スイート、証明書チェーン、鍵交換メッセージの詳細は環境により異なります。ここでは、認証・鍵の合意・暗号化されたデータ通信という役割の流れを示しています。暗号アルゴリズムそのものは実装していません。</p>
  </section>
}

export default TlsHandshakeLesson
