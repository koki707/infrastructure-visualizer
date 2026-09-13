/**
 * Metadata shared by the expanding set of interactive learning topics.
 *
 * This deliberately stays separate from ExplorationWorld: the latter models a
 * navigable 3D world, while a LearningTopic can choose the representation that
 * best explains a concept (2D diagram, step execution, text, or 3D).
 */
export type LearningCategoryId = 'network' | 'computer' | 'os' | 'database' | 'security' | 'system' | 'algorithms'

export type VisualizationType = 'interactive-2d' | 'step-animation' | '3d' | 'hybrid-3d' | 'text-diagram'

export type LearningTopicStatus = 'available' | 'partial' | 'planned'

export interface LearningTopic {
  id: string
  category: LearningCategoryId
  title: string
  shortTitle: string
  summary: string
  why: string
  visualization: VisualizationType
  learningGoals: string[]
  prerequisites?: string[]
  relatedTopics?: string[]
  nextTopics?: string[]
  glossaryTerms: string[]
  status: LearningTopicStatus
  /** Existing simulator is a related learning context, not an external link. */
  simulatorPath?: '/visualizer'
}

export interface LearningCategory {
  id: LearningCategoryId
  title: string
  description: string
  status: LearningTopicStatus
}
