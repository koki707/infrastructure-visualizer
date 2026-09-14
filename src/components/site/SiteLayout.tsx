import type { ReactNode } from 'react'
import { CONTACT, SITE } from '../../data/siteContent'
import { GlossaryText } from '../ui/GlossaryText'

export type Navigate = (path: string) => void

const NAV_ITEMS = [
  ['/visualizer', 'シミュレーション'],
  ['/topics', '学びを深める'],
  ['/glossary', '用語集'],
  ['/guide', '使い方'],
  ['/about', 'このサイトについて'],
] as const

const FOOTER_ITEMS = [
  ['/visualizer', 'シミュレーション'],
  ['/topics', '学びを深める'],
  ['/glossary', '用語集'],
  ['/guide', '使い方'],
  ['/about', 'このサイトについて'],
  ['/notes', '教材上の注意'],
  ['/privacy', 'プライバシー'],
  ['/terms', '利用規約'],
] as const

function safeContactUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' ? parsed.toString() : null
  } catch {
    return null
  }
}

export function SiteHeader({ path, onNavigate }: { path: string; onNavigate: Navigate }) {
  const action = path === '/visualizer'
    ? { path: '/guide', label: '使い方を見る' }
    : { path: '/visualizer', label: 'シミュレーションを始める' }
  return <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/90 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
      <button type="button" onClick={() => onNavigate('/')} className="shrink-0 text-left">
        <span className="block text-sm font-bold tracking-tight text-slate-900">{SITE.name}</span>
        <span className="block text-[10px] font-semibold tracking-[.14em] text-cyan-700">ITの仕組みを学ぶシミュレーション <span className="rounded bg-amber-100 px-1 text-[9px] tracking-normal text-amber-800">ベータ版</span></span>
      </button>
      <nav aria-label="メインナビゲーション" className="hidden items-center gap-1 md:flex">
        {NAV_ITEMS.map(([href, label]) => <button key={href} type="button" onClick={() => onNavigate(href)} className={`rounded-lg px-3 py-2 text-sm transition ${(path === href || (href === '/glossary' && path.startsWith('/glossary/')) || (href === '/topics' && path.startsWith('/learn/'))) ? 'bg-cyan-50 font-semibold text-cyan-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>{label}</button>)}
      </nav>
      <button type="button" onClick={() => onNavigate(action.path)} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700">{action.label}</button>
    </div>
    <nav aria-label="モバイルナビゲーション" className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
      {NAV_ITEMS.map(([href, label]) => <button key={href} type="button" onClick={() => onNavigate(href)} className={`whitespace-nowrap rounded-md px-2 py-1.5 text-xs ${(path === href || (href === '/glossary' && path.startsWith('/glossary/')) || (href === '/topics' && path.startsWith('/learn/'))) ? 'bg-cyan-50 font-semibold text-cyan-800' : 'text-slate-600'}`}>{label}</button>)}
    </nav>
  </header>
}

export function SiteFooter({ onNavigate }: { onNavigate: Navigate }) {
  const contactUrl = safeContactUrl(CONTACT.feedbackUrl)
  return <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-[1.3fr_1fr] lg:px-8">
      <div><p className="text-base font-bold text-slate-900">{SITE.name} <span className="align-middle text-[10px] font-semibold text-amber-700">ベータ版</span></p><p className="mt-2 max-w-md text-sm leading-6 text-slate-600">IT・コンピュータの仕組みをシミュレーションで理解するための教育用ウェブアプリです。個人開発の教育プロジェクトとして、すべてブラウザ内で動作します。</p>{contactUrl ? <a className="mt-4 inline-block text-sm font-semibold text-cyan-700 underline decoration-cyan-200 underline-offset-4 hover:text-cyan-900" href={contactUrl} target="_blank" rel="noreferrer">お問い合わせ・教材内容の指摘</a> : <p className="mt-4 text-xs leading-5 text-slate-500">お問い合わせ先は公開前に設定予定です。</p>}</div>
      <div><p className="eyebrow">ナビゲーション</p><div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">{FOOTER_ITEMS.map(([href, label]) => <button key={href} type="button" className="w-fit hover:text-cyan-700" onClick={() => onNavigate(href)}>{label}</button>)}</div></div>
    </div>
    <div className="border-t border-slate-100 px-5 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} {SITE.name}</div>
  </footer>
}

export function PageContainer({ children }: { children: ReactNode }) { return <main className="mx-auto max-w-6xl px-5 py-14 lg:px-8 lg:py-20">{children}</main> }

export function SectionTitle({ eyebrow, title, lead, onOpenTerm }: { eyebrow?: string; title: string; lead?: string; onOpenTerm?: (termId: string) => void }) {
  return <div className="max-w-2xl"><p className="eyebrow">{eyebrow ?? 'ITインフラ・シミュレーター'}</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>{lead && <p className="mt-4 text-base leading-8 text-slate-600">{onOpenTerm ? <GlossaryText text={lead} onOpenTerm={onOpenTerm} /> : lead}</p>}</div>
}
