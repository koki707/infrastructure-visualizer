export interface GlossaryDetailSection {
  title: string
  body: string
}

export type GlossaryCategoryId = 'computer' | 'web' | 'network' | 'transport' | 'ip-routing' | 'link' | 'access'

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
  /** Optional longer-form teaching material, displayed only on request. */
  deepDive?: GlossaryDetailSection[]
  related?: string[]
  matches: string[]
}
