export interface GlossaryDetailSection {
  title: string
  body: string
}

/**
 * A short, first-contact explanation for learners who have not yet built a
 * mental model of the term. The UI can reveal these in small, predictable
 * sections before presenting protocol details.
 */
export interface GlossaryBeginnerGuide {
  /** A natural Japanese name when the formal term is mostly English. */
  japaneseName?: string
  /** Kana reading for an initialism or an English term when it helps newcomers. */
  pronunciation?: string
  /** 「ひとことで」: the smallest useful definition. */
  inOneSentence: string
  /** 「なぜ必要？」: the problem this concept helps solve. */
  whyNeeded: string
  /** A familiar, explicitly imperfect image that gives learners an entry point. */
  everydayImage: string
  /** Where the learner encounters the concept in a representative flow. */
  whenItAppears: string
  /** A concise guardrail against a common beginner misconception. */
  beginnerNote: string
}

export type GlossaryCategoryId = 'computer' | 'os' | 'database' | 'system' | 'algorithms' | 'web' | 'network' | 'transport' | 'ip-routing' | 'link' | 'access' | 'security'

export interface GlossaryCategory {
  id: GlossaryCategoryId
  title: string
  description: string
  parent?: GlossaryCategoryId
}

export interface GlossaryTerm {
  id: string
  term: string
  /** The branch where this term appears in the glossary navigation. */
  category: GlossaryCategoryId
  /** Formal expansion for initialisms such as DNS and TCP. */
  expansion?: string
  summary: string
  why: string
  /** Optional first-contact explanation, intended for people new to the term. */
  beginnerGuide?: GlossaryBeginnerGuide
  /** Optional longer-form teaching material, displayed only on request. */
  deepDive?: GlossaryDetailSection[]
  related?: string[]
  matches: string[]
}
