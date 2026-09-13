import { useMemo, useState } from 'react'
import type { Navigate } from '../site/SiteLayout'
import { GlossaryText } from '../ui/GlossaryText'

type DatabaseTransactionLessonProps = {
  onNavigate: Navigate
}

type TransactionStep = {
  id: 'begin' | 'lock' | 'debit' | 'credit' | 'commit'
  label: string
  title: string
  body: string
  detail: string
}

type AccountValues = {
  source: number
  destination: number
}

const INITIAL_VALUES: AccountValues = { source: 1000, destination: 200 }
const TRANSFER_AMOUNT = 300

const TRANSACTION_STEPS: TransactionStep[] = [
  {
    id: 'begin',
    label: 'BEGIN',
    title: '「2つの更新をひとまとまりにする」と宣言する',
    body: '送金処理を始める前に、アプリケーションはTransactionを開始します。ここからCommitまたはRollbackまでの一連の更新を、1つの仕事として扱います。',
    detail: 'この教材のRead Committed相当の概念モデルでは、口座Aと口座Bの確定済み残高はまだ変わっていません。Transactionは「複数の変更の途中だけが別の処理に見えてしまう」問題を避ける土台になります。',
  },
  {
    id: 'lock',
    label: 'LOCK',
    title: '更新対象を決め、競合する更新を調整する',
    body: 'この例では、口座Aと口座Bの行を更新する前にロックを取得します。同じ残高を別の送金が同時に書き換えないよう、ほかの更新は待機または競合として扱われます。',
    detail: 'ロックの形や待機の扱いはDatabase製品・Isolation Level・実装によって異なります。ここでは排他ロックを使う代表例として、更新競合を見える化しています。',
  },
  {
    id: 'debit',
    label: 'UPDATE A',
    title: '口座Aの残高から300を引く（まだ確定しない）',
    body: 'Transactionの作業中ビューでは、口座Aが1000から700になります。この教材のRead Committed相当のモデルでは、この時点で別の処理へ「Aだけ減った状態」を確定結果として見せません。',
    detail: '途中で障害や検証エラーが起きればRollbackで開始前の状態へ戻せます。Transactionの途中の値をほかの処理がどう見られるかはIsolation Levelによって異なります。',
  },
  {
    id: 'credit',
    label: 'UPDATE B',
    title: '口座Bの残高へ300を加える（まだ確定しない）',
    body: '同じTransactionの中で、口座Bは200から500になります。必要な更新がそろったので、次に全体を確定できる状態です。',
    detail: '送金額、残高不足、更新件数などの検証もCommit前に行います。ここでは説明のため、残高不足や手数料などを省いた単純な例にしています。',
  },
  {
    id: 'commit',
    label: 'COMMIT',
    title: '2つの更新をまとめて確定し、ロックを解放する',
    body: 'Commit後、この教材の確定済みビューはA=700、B=500になります。途中のA=700・B=200だけが確定するのではなく、成功した結果全体を扱えることがTransactionの重要な性質です。',
    detail: '多くのDatabaseは障害復旧を考慮して更新ログなどを利用します。どこまでを「確定」と扱うかの実装詳細や耐障害性は、製品・設定・ストレージ構成で変わります。',
  },
]

function LinkedText({ text, onNavigate }: { text: string; onNavigate: Navigate }) {
  return <GlossaryText text={text} onOpenTerm={termId => onNavigate(`/glossary/${termId}`)} />
}

function yen(value: number) {
  return `¥${value.toLocaleString('ja-JP')}`
}

function AccountCard({
  name,
  value,
  change,
  locked,
  tone,
}: {
  name: string
  value: number
  change?: string
  locked: boolean
  tone: 'sky' | 'violet'
}) {
  const colors = tone === 'sky'
    ? 'border-sky-200 bg-sky-50 text-sky-950'
    : 'border-violet-200 bg-violet-50 text-violet-950'
  return <article className={`rounded-2xl border p-4 ${colors}`}>
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-[10px] font-bold tracking-[.14em] text-slate-500">ACCOUNT</p><h4 className="mt-1 text-sm font-bold">{name}</h4></div>
      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${locked ? 'bg-amber-200 text-amber-950' : 'bg-white/80 text-slate-600'}`}>{locked ? '更新を調整中' : '利用可能'}</span>
    </div>
    <p className="mt-5 font-mono text-2xl font-bold tracking-tight">{yen(value)}</p>
    <p className={`mt-2 text-xs font-semibold ${change ? 'text-slate-700' : 'text-slate-500'}`}>{change ?? '確定済み残高'}</p>
  </article>
}

/**
 * A deliberately small, deterministic transaction visual. It shows why a
 * multi-row update needs an all-or-nothing boundary without pretending to be
 * a full database engine or a specific product's locking implementation.
 */
export function DatabaseTransactionLesson({ onNavigate }: DatabaseTransactionLessonProps) {
  const [step, setStep] = useState(0)
  const [rolledBack, setRolledBack] = useState(false)
  const current = TRANSACTION_STEPS[step]
  const isCommitted = !rolledBack && current.id === 'commit'
  const isWorking = !rolledBack && step >= 2 && step < TRANSACTION_STEPS.length - 1
  const locksHeld = !rolledBack && step >= 1 && step < TRANSACTION_STEPS.length - 1

  const workingValues = useMemo<AccountValues>(() => {
    if (rolledBack || step < 2) return INITIAL_VALUES
    if (step === 2) return { source: INITIAL_VALUES.source - TRANSFER_AMOUNT, destination: INITIAL_VALUES.destination }
    return { source: INITIAL_VALUES.source - TRANSFER_AMOUNT, destination: INITIAL_VALUES.destination + TRANSFER_AMOUNT }
  }, [rolledBack, step])

  const committedValues = rolledBack
    ? INITIAL_VALUES
    : isCommitted
      ? workingValues
      : INITIAL_VALUES

  const selectStep = (index: number) => {
    setRolledBack(false)
    setStep(index)
  }

  const reset = () => {
    setRolledBack(false)
    setStep(0)
  }

  const rollBack = () => {
    if (step >= 2 && step < TRANSACTION_STEPS.length - 1) setRolledBack(true)
  }

  const status = rolledBack
    ? { label: 'ROLLBACK 済み', body: '途中の更新を破棄し、確定済み残高を開始前の状態へ戻しました。ロックも解放されます。', className: 'border-rose-300 bg-rose-50 text-rose-950' }
    : isCommitted
      ? { label: 'COMMIT 済み', body: '2つの更新がまとまって確定し、ほかの更新を待たせていたロックを解放しました。', className: 'border-emerald-300 bg-emerald-50 text-emerald-950' }
      : { label: '処理を一時停止中', body: 'いまの段階で止めて、作業中の値・外から見える確定値・ロックの役割を見比べられます。', className: 'border-cyan-200 bg-cyan-50 text-cyan-950' }

  return <section aria-label="Database Transactionのステップ図解" className="rounded-3xl border border-indigo-200 bg-indigo-50/45 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow text-indigo-700">INTERACTIVE DATABASE</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">送金を途中で止めて、Transactionの役割を読む</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700"><LinkedText text="DatabaseのTransactionは、複数の更新を「全部成功」か「全部取り消し」にまとめるための境界です。この例では、口座Aから口座Bへ300円を送る処理を、各段階で止めながら見ます。" onNavigate={onNavigate} /></p>
      </div>
      <span className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-800">{rolledBack ? 'ROLLBACK' : `${step + 1} / ${TRANSACTION_STEPS.length}`}</span>
    </div>

    <div className="mt-6 grid gap-2 sm:grid-cols-5" role="tablist" aria-label="Transactionの段階">
      {TRANSACTION_STEPS.map((item, index) => <button
        key={item.id}
        type="button"
        role="tab"
        aria-selected={!rolledBack && step === index}
        onClick={() => selectStep(index)}
        className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${!rolledBack && step === index ? 'border-indigo-500 bg-white text-indigo-950 shadow-sm' : 'border-indigo-100 bg-indigo-50 text-slate-600 hover:border-indigo-300 hover:bg-white'}`}
      >
        <span className="block text-[10px] text-indigo-700">{index + 1}</span>
        <span className="mt-1 block">{item.label}</span>
      </button>)}
    </div>

    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" onClick={() => selectStep(Math.max(0, step - 1))} disabled={rolledBack || step === 0} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-indigo-300 disabled:cursor-not-allowed disabled:opacity-45">← 前の状態</button>
      <button type="button" onClick={() => selectStep(Math.min(TRANSACTION_STEPS.length - 1, step + 1))} disabled={rolledBack || step === TRANSACTION_STEPS.length - 1} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-45">次の状態 →</button>
      <button type="button" onClick={rollBack} disabled={rolledBack || step < 2 || step >= TRANSACTION_STEPS.length - 1} className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-45">ここで失敗したとしてRollback</button>
      <button type="button" onClick={reset} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-slate-900">最初に戻す</button>
    </div>

    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
        <div aria-live="polite">
          <p className="text-xs font-bold text-indigo-800">{rolledBack ? 'ROLLBACK' : current.label}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{rolledBack ? '途中の変更を確定させずに取り消す' : current.title}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-700"><LinkedText text={rolledBack ? '入力値の検証に失敗した、途中で障害が起きた、残高が不足していたなどの場合、Rollbackを選べます。Transaction内で行った変更は確定前なので、開始前の整合した状態へ戻せます。' : current.body} onNavigate={onNavigate} /></p>
          <p className="mt-3 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-950"><LinkedText text={rolledBack ? 'Rollbackは、すでにCommitされた別のTransactionを自動で取り消す操作ではありません。この例のように、まだCommitしていない自分のTransactionを中止する代表例です。' : current.detail} onNavigate={onNavigate} /></p>
        </div>
        <div className={`rounded-xl border p-4 ${status.className}`}>
          <p className="text-xs font-bold">現在の状態</p>
          <p className="mt-1 text-lg font-bold">{status.label}</p>
          <p className="mt-2 text-xs leading-6">{status.body}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-white/80 px-3 py-2"><p className="text-[10px] font-semibold text-slate-500">口座Aの更新</p><p className="mt-1 font-mono text-sm font-bold">{INITIAL_VALUES.source} → {workingValues.source}</p></div>
            <div className="rounded-lg bg-white/80 px-3 py-2"><p className="text-[10px] font-semibold text-slate-500">口座Bの更新</p><p className="mt-1 font-mono text-sm font-bold">{INITIAL_VALUES.destination} → {workingValues.destination}</p></div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_auto_1fr] xl:items-stretch">
        <section className={`rounded-2xl border p-4 ${isWorking ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-200 bg-slate-50'}`} aria-label="Transaction内の作業中ビュー">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-bold text-slate-900">Transaction内の作業ビュー</p><p className="mt-1 text-xs text-slate-600">この処理だけが組み立てている途中の値（教育用の表現）</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${isWorking ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{isWorking ? '更新中' : isCommitted ? '確定済み' : rolledBack ? '破棄済み' : '開始前'}</span></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><AccountCard name="口座A" value={workingValues.source} change={step >= 2 && !rolledBack ? `− ${yen(TRANSFER_AMOUNT)}` : undefined} locked={locksHeld} tone="sky" /><AccountCard name="口座B" value={workingValues.destination} change={step >= 3 && !rolledBack ? `+ ${yen(TRANSFER_AMOUNT)}` : undefined} locked={locksHeld} tone="violet" /></div>
        </section>
        <div className="flex items-center justify-center" aria-hidden="true"><span className="rounded-full border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-700">Commit / Rollback<br /><span className="font-normal text-slate-500">確定境界</span></span></div>
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4" aria-label="この教材での確定済みビュー">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-bold text-slate-900">この教材での確定済みビュー</p><p className="mt-1 text-xs text-slate-600">Read Committed相当の概念モデルで、別の処理へ示す確定結果</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${isCommitted ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-800'}`}>{isCommitted ? '新しい結果' : '開始時の結果'}</span></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><AccountCard name="口座A" value={committedValues.source} locked={false} tone="sky" /><AccountCard name="口座B" value={committedValues.destination} locked={false} tone="violet" /></div>
        </section>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_.9fr]">
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-bold text-slate-900">別の送金処理はどうなる？</p><p className="mt-2 text-xs leading-6 text-slate-700">{locksHeld ? '口座AまたはBを更新したい別の処理は、ロック待機や競合エラーなどとして調整されます。これにより、同じ残高を同時に書き換える問題を減らします。' : isCommitted || rolledBack ? 'ロックが解放されたので、別の処理はこの教材での確定済みビューを基準に実行できます。' : '更新対象がまだ決まっていないため、この例ではロックも取得していません。'}</p></section>
        <section className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm font-bold text-slate-900">保存される記録（概念図）</p><ol className="mt-2 space-y-1.5 text-xs text-slate-600"><li className={step >= 0 ? 'font-semibold text-slate-800' : ''}>01. BEGIN transfer A → B</li><li className={step >= 2 && !rolledBack ? 'font-semibold text-slate-800' : ''}>02. UPDATE account A</li><li className={step >= 3 && !rolledBack ? 'font-semibold text-slate-800' : ''}>03. UPDATE account B</li><li className={isCommitted ? 'font-bold text-emerald-700' : rolledBack ? 'font-bold text-rose-700' : 'text-slate-400'}>{isCommitted ? '04. COMMIT' : rolledBack ? '04. ROLLBACK' : '04. COMMIT または ROLLBACK を待つ'}</li></ol></section>
      </div>
    </div>

    <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><b>教材上の簡略化：</b>これは行ロックを使うRDBMSの代表的な送金例です。「確定済みビュー」はRead Committed相当の教育用の見せ方であり、実際のDatabaseではMVCC、Isolation Level、ログ、制約、分散Transaction、障害復旧などにより、途中の値の見え方や競合時の結果が変わります。Transactionが常にすべての不整合を防ぐわけではなく、アプリケーション側の検証や適切な設計も必要です。</p>
  </section>
}

export default DatabaseTransactionLesson
