import { LearningTopicContent } from '../components/learning/LearningTopicContent'
import { PageContainer, type Navigate } from '../components/site/SiteLayout'
import { LEARNING_CATEGORIES } from '../data/learningTopics'
import type { LearningTopic } from '../types/learning'

export function LearningTopicPage({ topic, onNavigate }: { topic: LearningTopic; onNavigate: Navigate }) {
  const category = LEARNING_CATEGORIES.find(item => item.id === topic.category)
  return <PageContainer>
    <nav aria-label="パンくず" className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      <button type="button" onClick={() => onNavigate('/topics')} className="font-semibold text-cyan-700 transition hover:text-cyan-900">学習を探す</button>
      <span aria-hidden="true">›</span>
      <span className="font-semibold text-slate-700">{category?.title ?? '学習'}</span>
      <span aria-hidden="true">›</span>
      <span className="text-slate-700">{topic.shortTitle}</span>
    </nav>
    <LearningTopicContent topic={topic} onNavigate={onNavigate} />
  </PageContainer>
}

export default LearningTopicPage
