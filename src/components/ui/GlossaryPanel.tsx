import { glossaryTermsFor } from '../../data/glossary'

export function GlossaryPanel({ context, onOpenTerm }: { context: string[]; onOpenTerm: (id: string) => void }) {
  const relatedTerms = glossaryTermsFor(context)
  return <section className="panel p-5">
    <p className="eyebrow">用語解説</p>
    <p className="mt-2 text-xs leading-5 text-slate-500">気になる用語を押すと、用語ページで正式名称と役割を確認できます。</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {relatedTerms.map(term => <button key={term.id} onClick={() => onOpenTerm(term.id)} className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 transition hover:border-cyan-400 hover:bg-cyan-100">{term.term}</button>)}
    </div>
    <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">略語の正式名称、役割、関連する用語を個別の用語ページにまとめています。</p>
  </section>
}
