import { useMemo } from 'react'
import { GLOSSARY_TERMS } from '../../data/glossary'

type Props = {
  text: string
  onOpenTerm: (termId: string) => void
  className?: string
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Turns known terms in explanatory prose into lightweight in-app glossary links. */
export function GlossaryText({ text, onOpenTerm, className }: Props) {
  const { expression, termsByLabel } = useMemo(() => {
    // A one-character Japanese alias (for example 「行」 for Row) is useful
    // for glossary search, but it is too broad to safely turn into a link in
    // ordinary prose such as 「実行する」. Keep those aliases in the data and
    // search UI, while only linking labels that are unambiguous in context.
    const labels = GLOSSARY_TERMS
      .flatMap(term => [term.term, ...term.matches])
      .filter(label => label.length > 1)
    const uniqueLabels = [...new Set(labels)].sort((a, b) => b.length - a.length)
    const map = new Map<string, string>()
    GLOSSARY_TERMS.forEach(term => [term.term, ...term.matches]
      .filter(label => label.length > 1)
      .forEach(label => map.set(label, term.id)))
    return { expression: new RegExp(`(${uniqueLabels.map(escapeRegExp).join('|')})`, 'g'), termsByLabel: map }
  }, [])
  const parts = text.split(expression)

  return <span className={className}>{parts.map((part, index) => {
    const termId = termsByLabel.get(part)
    return termId ? <button key={`${part}-${index}`} type="button" onClick={() => onOpenTerm(termId)} className="rounded-sm font-semibold text-cyan-800 underline decoration-cyan-300 decoration-1 underline-offset-2 transition hover:bg-cyan-100 hover:text-cyan-950">{part}</button> : <span key={`${part}-${index}`}>{part}</span>
  })}</span>
}
