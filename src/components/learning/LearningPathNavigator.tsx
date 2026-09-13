import { LEARNING_TOPIC_BY_ID, learningPathForTopic } from '../../data/learningTopics'
import type { Navigate } from '../site/SiteLayout'

type Props = {
  topicId: string
  onNavigate: Navigate
}

/**
 * Shows an optional recommended study order without presenting it as the
 * literal processing order of one network request.
 */
export function LearningPathNavigator({ topicId, onNavigate }: Props) {
  const path = learningPathForTopic(topicId)
  if (!path) return null

  const topics = path.topicIds.map(id => LEARNING_TOPIC_BY_ID.get(id)).filter((topic): topic is NonNullable<typeof topic> => Boolean(topic))
  const currentIndex = topics.findIndex(topic => topic.id === topicId)
  const currentBranch = path.branches?.find(branch => branch.fromTopicId === topicId || branch.topicIds.includes(topicId))
  const sourceTopic = currentBranch ? LEARNING_TOPIC_BY_ID.get(currentBranch.fromTopicId) : null
  const previous = currentIndex > 0 ? topics[currentIndex - 1] : null
  const next = currentIndex >= 0 && currentIndex < topics.length - 1 ? topics[currentIndex + 1] : null

  return <nav aria-label="おすすめの学習ルート" className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="eyebrow">RECOMMENDED LEARNING PATH</p><h2 className="mt-2 text-lg font-bold text-slate-900">{path.title}</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700">{path.description}</p></div>
      <button type="button" onClick={() => onNavigate('/topics')} className="rounded-lg border border-cyan-300 bg-white px-3 py-2 text-xs font-bold text-cyan-800 transition hover:border-cyan-500 hover:bg-cyan-50">教材一覧へ</button>
    </div>
    <ol className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label="Webアクセスの土台を学ぶ順番">
      {topics.map((item, index) => <li key={item.id} className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onNavigate(`/learn/${item.id}`)}
          aria-current={item.id === topicId ? 'step' : undefined}
          className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${item.id === topicId ? 'border-cyan-600 bg-cyan-700 text-white shadow-sm' : 'border-cyan-200 bg-white text-slate-700 hover:border-cyan-400 hover:bg-cyan-50'}`}
        >
          <span className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${item.id === topicId ? 'bg-white/20 text-white' : 'bg-cyan-50 text-cyan-800'}`}>{index + 1}</span>{item.shortTitle}
        </button>
        {index < topics.length - 1 && <span className="text-cyan-500" aria-hidden="true">→</span>}
      </li>)}
    </ol>
    {currentIndex >= 0 && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-cyan-200 pt-4">
      <p className="text-xs leading-6 text-slate-600">このルートでは <b className="text-slate-900">{currentIndex + 1} / {topics.length}</b>。学びやすい順番であり、実際の1回の通信の厳密な処理順ではありません。</p>
      <div className="flex gap-2">
        {previous && <button type="button" onClick={() => onNavigate(`/learn/${previous.id}`)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-800">← {previous.shortTitle}</button>}
        {next && <button type="button" onClick={() => onNavigate(`/learn/${next.id}`)} className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan-700">次へ：{next.shortTitle} →</button>}
      </div>
    </div>}
    {currentBranch && <div className="mt-5 rounded-xl border border-white/90 bg-white/80 p-4">
      <p className="text-xs font-bold text-cyan-900">{currentBranch.title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {sourceTopic && <button type="button" onClick={() => onNavigate(`/learn/${sourceTopic.id}`)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-800">{sourceTopic.shortTitle}へ戻る</button>}
        {currentBranch.topicIds.map(id => LEARNING_TOPIC_BY_ID.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item)).map(item => <button key={item.id} type="button" onClick={() => onNavigate(`/learn/${item.id}`)} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${item.id === topicId ? 'border-cyan-500 bg-cyan-50 text-cyan-900' : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-800'}`}>{item.shortTitle}</button>)}
      </div>
    </div>}
  </nav>
}
