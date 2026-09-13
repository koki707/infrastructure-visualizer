import { LEARNING_PATHS, LEARNING_TOPIC_BY_ID } from '../../data/learningTopics'
import type { Navigate } from '../site/SiteLayout'

type Props = {
  onNavigate: Navigate
}

/**
 * The entry point for recommended study routes. These are deliberately
 * separate from a protocol's literal runtime sequence.
 */
export function LearningPathOverview({ onNavigate }: Props) {
  return <section aria-label="おすすめの学習ルート" className="mt-10 rounded-3xl border border-cyan-200 bg-cyan-50/60 p-5 sm:p-7">
    <div className="max-w-3xl"><p className="eyebrow">RECOMMENDED LEARNING PATH</p><h2 className="mt-2 text-xl font-bold text-slate-900">迷ったら、つながりのある順番で学ぶ</h2><p className="mt-2 text-sm leading-7 text-slate-700">これは理解しやすさのための案内です。実際の1回の通信をそのまま再現した厳密な処理順ではありません。</p></div>
    <div className="mt-6 space-y-4">
      {LEARNING_PATHS.map(path => {
        const topics = path.topicIds.map(id => LEARNING_TOPIC_BY_ID.get(id)).filter((topic): topic is NonNullable<typeof topic> => Boolean(topic))
        return <article key={path.id} className="rounded-2xl border border-white/90 bg-white/80 p-4 sm:p-5">
          <h3 className="font-bold text-slate-900">{path.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{path.description}</p>
          <ol className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label={`${path.title}の順番`}>
            {topics.map((topic, index) => <li key={topic.id} className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => onNavigate(`/learn/${topic.id}`)} className="rounded-xl border border-cyan-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-900"><span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-50 text-[10px] text-cyan-800">{index + 1}</span>{topic.shortTitle}</button>{index < topics.length - 1 && <span className="text-cyan-500" aria-hidden="true">→</span>}</li>)}
          </ol>
          {path.branches && <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-200 pt-4">{path.branches.map(branch => {
            const source = LEARNING_TOPIC_BY_ID.get(branch.fromTopicId)
            const branchTopics = branch.topicIds.map(id => LEARNING_TOPIC_BY_ID.get(id)).filter((topic): topic is NonNullable<typeof topic> => Boolean(topic))
            return <div key={`${path.id}-${branch.fromTopicId}`} className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-slate-500">{source?.shortTitle ?? '途中'}から：{branch.title}</span>{branchTopics.map(topic => <button key={topic.id} type="button" onClick={() => onNavigate(`/learn/${topic.id}`)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-800">{topic.shortTitle}</button>)}</div>
          })}</div>}
        </article>
      })}
    </div>
  </section>
}

export default LearningPathOverview
