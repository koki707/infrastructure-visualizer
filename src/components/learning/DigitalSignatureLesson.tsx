import { useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type DigitalSignatureLessonProps = {
  onNavigate: Navigate
}

type SignatureScenario = 'valid' | 'tampered'

type SignatureStep = {
  label: string
  title: string
  body: string
  detail: string
}

const SIGNATURE_STEPS: SignatureStep[] = [
  {
    label: '原文',
    title: '作成者が、署名したいデータを用意する',
    body: 'ここでは請求額を含む短い文書を例にします。Digital Signatureは、文書そのものを秘密にするためではなく、文書が想定した秘密鍵の保持者によって署名され、途中で変わっていないかを確かめるために使います。',
    detail: '署名する対象は文書全体だけとは限りません。プロトコルや形式に応じて、どのデータを保護の対象にするかが決められています。',
  },
  {
    label: 'Hash',
    title: 'データから、内容に対応する短い値を計算する',
    body: '作成者は文書にHash Functionを適用し、内容に対応するHash値（Digest）を得ます。同じ内容なら同じHash値になり、内容が変われば通常は大きく異なる値になります。',
    detail: 'Hash値は文書を復元するための値ではありません。また、短いHash値だけを見て内容が安全に秘密になるわけでもありません。',
  },
  {
    label: '署名',
    title: '秘密鍵を使い、Hash値に対する署名を作る',
    body: '作成者はPrivate Keyを使って、Hash値を入力にDigital Signatureを生成します。受信者へは通常、文書・署名・検証に必要な公開鍵情報や証明書の情報が渡されます。',
    detail: '「秘密鍵でHashを暗号化する」と説明されることがありますが、これは一般的な署名方式を正確に表す言い方ではありません。署名の生成・検証は、方式ごとに定められた署名アルゴリズムで行われます。',
  },
  {
    label: '検証',
    title: '受信者が公開鍵で、署名と受信データの対応を確かめる',
    body: '受信者は受け取った文書から改めてHash値を計算し、Public Keyを使って署名を検証します。署名がその文書のHash値と対応し、鍵の組み合わせが正しければ検証は成功します。',
    detail: '公開鍵だけでは「誰の鍵か」を自動で保証できません。Webで接続先を確かめるときなどは、公開鍵と主体の結び付きを検証するためにCertificateや信頼の仕組みも必要です。',
  },
  {
    label: '結果',
    title: '変更があれば、署名の検証に失敗する',
    body: '署名後に保護対象のデータが変わると、受信側で計算するHash値が一致しなくなり、通常は署名を検証できません。これにより、意図しない改ざんを検出する助けになります。',
    detail: 'Digital Signatureはデータの暗号化そのものではありません。内容を秘密にするには別の暗号化が必要であり、署名は完全性と署名鍵の保持者による作成を検証するための仕組みです。',
  },
]

const ORIGINAL_DOCUMENT = '請求額: ¥1,000'
const ALTERED_DOCUMENT = '請求額: ¥9,000'
const ORIGINAL_DIGEST = 'H-A1C7…82'
const ALTERED_DIGEST = 'H-9F42…6D'
const SIGNATURE_VALUE = 'SIG-7K3…P9'

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

function DataChip({ label, value, tone = 'slate' }: { label: string; value: string; tone?: 'slate' | 'violet' | 'emerald' | 'rose' }) {
  const colors = {
    slate: 'border-slate-200 bg-slate-50 text-slate-900',
    violet: 'border-violet-200 bg-violet-50 text-violet-950',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    rose: 'border-rose-200 bg-rose-50 text-rose-950',
  }[tone]

  return <div className={`rounded-xl border px-3 py-2 ${colors}`}>
    <p className="text-[10px] font-bold tracking-[.12em] text-slate-500">{label}</p>
    <code className="mt-1 block break-all font-mono text-xs font-bold">{value}</code>
  </div>
}

/** A deliberately high-level signature lesson. It avoids presenting a signature as generic encryption. */
export function DigitalSignatureLesson({ onNavigate }: DigitalSignatureLessonProps) {
  const [scenario, setScenario] = useState<SignatureScenario>('valid')
  const [step, setStep] = useState(0)
  const current = SIGNATURE_STEPS[step]
  const isTampered = scenario === 'tampered'
  const receivedDocument = isTampered ? ALTERED_DOCUMENT : ORIGINAL_DOCUMENT
  const receivedDigest = isTampered ? ALTERED_DIGEST : ORIGINAL_DIGEST
  const verificationReady = step >= 3
  const verificationSucceeded = !isTampered && step === SIGNATURE_STEPS.length - 1
  const verificationFailed = isTampered && step === SIGNATURE_STEPS.length - 1

  const chooseScenario = (nextScenario: SignatureScenario) => {
    setScenario(nextScenario)
    setStep(0)
  }

  const reset = () => setStep(0)

  const actionHint = step === 0
    ? 'まず、署名する文書と受信側に届いた文書を見比べます。'
    : step === 1
      ? '文書の内容からHash値を作る役割を確認します。'
      : step === 2
        ? '秘密鍵は署名を生成する側だけが保持します。'
        : step === 3
          ? '受信側は公開鍵と、受信した文書から作ったHash値を使います。'
          : verificationSucceeded
            ? '署名と受信データの対応を検証できました。'
            : '受信データが変わったため、署名との対応を検証できません。'

  return <section aria-label="Digital Signatureのステップ図解" className="rounded-3xl border border-violet-200 bg-violet-50/45 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow text-violet-700">INTERACTIVE SECURITY</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">署名と検証を止めながら、改ざん検出を追う</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="Digital Signatureは、データが途中で変わっていないかと、対応するPrivate Keyを持つ側が署名を作ったかを確かめるための仕組みです。正常な例と改ざんされた例を切り替え、Hash・署名・Public Keyによる検証を1段階ずつ確認できます。" onNavigate={onNavigate} /></p>
      </div>
      <span className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-bold text-violet-800">{step + 1} / {SIGNATURE_STEPS.length}</span>
    </div>

    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-white p-4">
      <div>
        <p className="text-sm font-bold text-slate-900">受信時の状況を選ぶ</p>
        <p className="mt-1 text-xs leading-6 text-slate-600">改ざん例では、署名そのものは元の文書に対して作られたままです。</p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="署名の検証例">
        <button type="button" aria-pressed={scenario === 'valid'} onClick={() => chooseScenario('valid')} className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${scenario === 'valid' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-800'}`}>変更なし</button>
        <button type="button" aria-pressed={scenario === 'tampered'} onClick={() => chooseScenario('tampered')} className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${scenario === 'tampered' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:text-rose-800'}`}>途中で変更された例</button>
      </div>
    </div>

    <div className="mt-5 grid gap-2 sm:grid-cols-5" role="tablist" aria-label="Digital Signatureの段階">
      {SIGNATURE_STEPS.map((item, index) => <button
        key={item.label}
        id={`signature-step-${index}`}
        type="button"
        role="tab"
        aria-selected={step === index}
        aria-controls="signature-step-panel"
        onClick={() => setStep(index)}
        className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${step === index ? 'border-violet-500 bg-white text-violet-950 shadow-sm' : 'border-violet-100 bg-violet-50 text-slate-600 hover:border-violet-300 hover:bg-white'}`}
      >
        <span className="block text-[10px] text-violet-700">{index + 1}</span>
        <span className="mt-1 block leading-5">{item.label}</span>
      </button>)}
    </div>

    <div id="signature-step-panel" role="tabpanel" aria-labelledby={`signature-step-${step}`} className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
        <article className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold tracking-[.14em] text-sky-700">SIGNER</p><h3 className="mt-1 text-base font-bold text-slate-900">作成者</h3></div><span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-bold text-sky-800">Private Keyを保持</span></div>
          <div className="mt-4 grid gap-2"><DataChip label="署名した文書" value={ORIGINAL_DOCUMENT} tone="slate" /><DataChip label="作成時のHash値" value={ORIGINAL_DIGEST} tone="violet" /><DataChip label="生成した署名" value={SIGNATURE_VALUE} tone="violet" /></div>
        </article>
        <div className="flex items-center justify-center" aria-hidden="true"><span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-center text-xs font-bold text-violet-800">文書<br />+<br />署名</span></div>
        <article className={`rounded-2xl border p-4 ${isTampered ? 'border-rose-200 bg-rose-50/60' : 'border-emerald-200 bg-emerald-50/55'}`}>
          <div className="flex items-start justify-between gap-3"><div><p className={`text-[10px] font-bold tracking-[.14em] ${isTampered ? 'text-rose-700' : 'text-emerald-700'}`}>VERIFIER</p><h3 className="mt-1 text-base font-bold text-slate-900">受信者</h3></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${isTampered ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>{isTampered ? '文書が変更された例' : '同じ文書を受信'}</span></div>
          <div className="mt-4 grid gap-2"><DataChip label="受信した文書" value={receivedDocument} tone={isTampered ? 'rose' : 'slate'} /><DataChip label="受信側で計算したHash値" value={receivedDigest} tone={isTampered ? 'rose' : 'emerald'} /><DataChip label="受信した署名" value={SIGNATURE_VALUE} tone="violet" /></div>
        </article>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite">
          <p className="text-xs font-bold text-violet-800">{current.label}</p>
          <h3 className="mt-1 text-base font-bold text-slate-900">{current.title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={current.body} onNavigate={onNavigate} /></p>
          <p className="mt-3 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><LinkedText text={current.detail} onNavigate={onNavigate} /></p>
        </article>
        <aside className={`rounded-xl border p-4 ${verificationSucceeded ? 'border-emerald-300 bg-emerald-50' : verificationFailed ? 'border-rose-300 bg-rose-50' : 'border-violet-200 bg-violet-50'}`}>
          <p className={`text-xs font-bold ${verificationSucceeded ? 'text-emerald-900' : verificationFailed ? 'text-rose-900' : 'text-violet-900'}`}>{verificationReady ? '検証の見え方' : 'いま見るポイント'}</p>
          <p className="mt-2 text-sm font-bold text-slate-900">{verificationSucceeded ? '検証に成功' : verificationFailed ? '検証に失敗（変更を検出）' : '検証の前段階'}</p>
          <p className="mt-2 text-xs leading-6 text-slate-700"><LinkedText text={actionHint} onNavigate={onNavigate} /></p>
          {verificationReady && <div className="mt-4 rounded-lg border border-white bg-white/80 p-3 text-xs"><p className="font-bold text-slate-800">受信側の比較</p><p className="mt-2 font-mono text-slate-700">署名: {SIGNATURE_VALUE}</p><p className={`mt-1 font-mono font-bold ${isTampered ? 'text-rose-800' : 'text-emerald-800'}`}>{isTampered ? `${ORIGINAL_DIGEST} ≠ ${receivedDigest}` : `${ORIGINAL_DIGEST} = ${receivedDigest}`}</p></div>}
        </aside>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs text-slate-600">各段階で停止して、署名と暗号化の役割の違いを確認できます。</p>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setStep(value => Math.max(0, value - 1))} disabled={step === 0} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-violet-300 hover:text-violet-800 disabled:cursor-not-allowed disabled:opacity-40">← 前の段階</button><button type="button" onClick={() => setStep(value => Math.min(SIGNATURE_STEPS.length - 1, value + 1))} disabled={step === SIGNATURE_STEPS.length - 1} className="rounded-lg bg-violet-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-40">次の段階 →</button><button type="button" onClick={reset} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-slate-900">最初に戻す</button></div>
      </div>
    </div>

    <div className="mt-4 grid gap-3 md:grid-cols-2">
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>署名と暗号化は別の役割：</b>Digital Signatureは、主に完全性と署名鍵の保持者による作成を検証する仕組みです。文書の内容を読めないようにする暗号化そのものではありません。</p>
      <p className="rounded-xl border border-violet-200 bg-white px-4 py-3 text-xs leading-6 text-slate-700"><b>教材上の簡略化：</b>具体的な署名方式、Hash Function、鍵の保護、Certificateの信頼確認や失効確認は省いています。ここでは、Hash → 秘密鍵による署名生成 → 公開鍵による検証という役割の流れだけを扱います。</p>
    </div>
  </section>
}

export default DigitalSignatureLesson
