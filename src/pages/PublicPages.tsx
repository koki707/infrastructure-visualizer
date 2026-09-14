import { PageContainer, SectionTitle, type Navigate } from '../components/site/SiteLayout'

const TERMS_SECTIONS = [
  ['サービスの目的', 'ITインフラ・シミュレーターは、ウェブアクセスを入口に、ITインフラやコンピュータの仕組みを視覚的に学ぶための個人開発の教育プロジェクトです。'],
  ['教育用シミュレーション', '本サイトのURL選択、DNS、TCP、TLS、HTTP、通信経路、機器内部の表示は教育目的のモデルです。入力されたURLへ実際にアクセスしたり、DNS問い合わせやパケット送信を行ったりしません。'],
  ['教材内容と正確性', '教材は理解しやすさを優先して一部を簡略化しています。内容の正確性には配慮していますが、個別の環境・製品・規格・設定への適合を保証するものではありません。'],
  ['禁止行為', '法令に反する行為、サービスの妨害、第三者の権利を侵害する行為、または本サイトの意図しない利用を禁止します。'],
  ['変更・停止と免責', 'β版のため、内容・機能・提供方法を予告なく変更または停止する場合があります。本サイトの利用により生じた損害について、法令上認められる範囲で責任を負いません。'],
  ['著作権と外部サービス', '本サイト内の自作コンテンツの権利は制作者に帰属します。依存ライブラリは各ライセンスに従います。現在、広告、アカウント登録、決済、アクセス解析は利用していません。'],
  ['規約の変更', '本規約を更新した場合は、このページに掲載します。公開前・公開後を問わず、運用内容が変わる際にはプライバシーページとあわせて見直します。'],
] as const

export function TermsPage({ onNavigate }: { onNavigate: Navigate }) {
  return <PageContainer>
    <SectionTitle eyebrow="利用規約" title="利用規約" lead="ベータ版の教育サイトを利用する際の基本的な注意事項です。" />
    <div className="mt-10 max-w-3xl space-y-4">
      {TERMS_SECTIONS.map(([title, body]) => <article key={title} className="panel p-6"><h2 className="text-lg font-bold text-slate-900">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{body}</p></article>)}
    </div>
    <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">教材内容や不具合に関する連絡先は、公開時にフッターの問い合わせ導線へ設定します。</div>
    <button type="button" onClick={() => onNavigate('/visualizer')} className="mt-8 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700">シミュレーションを開く</button>
  </PageContainer>
}

export function NotFoundPage({ onNavigate }: { onNavigate: Navigate }) {
  return <PageContainer>
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">ページが見つかりません</h1>
      <p className="mt-4 text-sm leading-7 text-slate-600">URLが正しいか確認するか、トップページまたはシミュレーション画面から目的のページを選んでください。</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => onNavigate('/')} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700">トップへ戻る</button>
        <button type="button" onClick={() => onNavigate('/visualizer')} className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700">シミュレーションを開く</button>
      </div>
    </div>
  </PageContainer>
}
