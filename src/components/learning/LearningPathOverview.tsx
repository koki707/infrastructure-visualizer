import { LEARNING_PATHS, LEARNING_TOPIC_BY_ID } from '../../data/learningTopics'
import type { Navigate } from '../site/SiteLayout'

type Props = {
  onNavigate: Navigate
}

type LearningPathItem = (typeof LEARNING_PATHS)[number]

function PathCard({ path, onNavigate }: { path: LearningPathItem; onNavigate: Navigate }) {
  const topics = path.topicIds
    .map(id => LEARNING_TOPIC_BY_ID.get(id))
    .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic))

  return <article className="rounded-2xl border border-white/90 bg-white/80 p-4 sm:p-5">
    <h3 className="font-bold text-slate-900">{path.title}</h3>
    <p className="mt-1 text-sm leading-6 text-slate-600">{path.description}</p>
    <ol className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label={`${path.title}の順番`}>
      {topics.map((topic, index) => <li key={topic.id} className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={() => onNavigate(`/learn/${topic.id}`)} className="rounded-xl border border-cyan-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-900">
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-50 text-[10px] text-cyan-800">{index + 1}</span>
          {topic.shortTitle}
        </button>
        {index < topics.length - 1 && <span className="text-cyan-500" aria-hidden="true">→</span>}
      </li>)}
    </ol>
    {path.branches && <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-200 pt-4">
      {path.branches.map(branch => {
        const source = LEARNING_TOPIC_BY_ID.get(branch.fromTopicId)
        const branchTopics = branch.topicIds
          .map(id => LEARNING_TOPIC_BY_ID.get(id))
          .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic))

        return <div key={`${path.id}-${branch.fromTopicId}`} className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">{source?.shortTitle ?? '途中'}から：{branch.title}</span>
          {branchTopics.map(topic => <button key={topic.id} type="button" onClick={() => onNavigate(`/learn/${topic.id}`)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-800">{topic.shortTitle}</button>)}
        </div>
      })}
    </div>}
  </article>
}

/**
 * A recommended learning order. It is intentionally separate from a
 * protocol's literal runtime sequence.
 */
export function LearningPathOverview({ onNavigate }: Props) {
  const networkPath = LEARNING_PATHS.find(path => path.id === 'network-foundations')
  const expansionPaths = LEARNING_PATHS.filter(path => path.id !== 'network-foundations')

  return <section aria-label="おすすめの学習の進め方" className="mt-10 rounded-3xl border border-cyan-200 bg-cyan-50/60 p-5 sm:p-7">
    <div className="max-w-3xl">
      <p className="eyebrow">おすすめの学習の進め方</p>
      <h2 className="mt-2 text-xl font-bold text-slate-900">全体像から、通信の仕組みへ。そこから他分野へ。</h2>
      <p className="mt-2 text-sm leading-7 text-slate-700">まずは3Dシミュレーションでウェブサイトへつながる全体像を見てから、そこで登場した通信の仕組みを順に深掘りします。PCの中やサービスを支える仕組みは、その土台をつかんだ後に広げていきます。</p>
    </div>

    <ol className="mt-6 grid gap-4 lg:grid-cols-3" aria-label="学習の3段階">
      <li className="rounded-2xl border border-cyan-200 bg-white p-5">
        <p className="text-xs font-bold text-cyan-800">ステップ1: 全体像を見る</p>
        <h3 className="mt-2 font-bold text-slate-900">3Dシミュレーションから始める</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">PCからウェブサーバーまで、データがどこを通るかをまず一度体験します。</p>
        <button type="button" onClick={() => onNavigate('/visualizer')} className="mt-4 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-800">3Dシミュレーションを始める →</button>
      </li>
      <li className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold text-cyan-800">ステップ2: 通信を深掘りする</p>
        <h3 className="mt-2 font-bold text-slate-900">ウェブアクセスの道筋をたどる</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">設定、宛先の確認、経路選択、名前解決、接続という順で、3Dで見た動きを確かめます。</p>
      </li>
      <li className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold text-cyan-800">ステップ3: 他分野へ広げる</p>
        <h3 className="mt-2 font-bold text-slate-900">PC・OS・サービスの仕組みを学ぶ</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">通信を支えるCPU、OS、データベース、セキュリティ、システム構成、アルゴリズムへ進みます。</p>
      </li>
    </ol>

    <div className="mt-7 space-y-5">
      {networkPath && <section aria-labelledby="network-route-heading">
        <div className="mb-3 flex items-center gap-3"><span className="rounded-full bg-cyan-700 px-2.5 py-1 text-[11px] font-bold text-white">ステップ2</span><h3 id="network-route-heading" className="font-bold text-slate-900">ウェブアクセスを通信の順に深掘りする</h3></div>
        <PathCard path={networkPath} onNavigate={onNavigate} />
      </section>}

      <section aria-labelledby="expansion-route-heading">
        <div className="mb-3 flex items-center gap-3"><span className="rounded-full bg-slate-700 px-2.5 py-1 text-[11px] font-bold text-white">ステップ3</span><h3 id="expansion-route-heading" className="font-bold text-slate-900">理解を他のIT分野へ広げる</h3></div>
        <div className="space-y-4">
          {expansionPaths.map(path => <PathCard key={path.id} path={path} onNavigate={onNavigate} />)}
        </div>
      </section>
    </div>
  </section>
}

export default LearningPathOverview
