import { NETWORK_NODES } from '../../data/network'

export function ProgressBar({ activeNodeId, nodeIds }: { activeNodeId: string; nodeIds: string[] }) {
  const nodes = nodeIds.map(id => NETWORK_NODES.find(node => node.id === id)).filter((node): node is NonNullable<typeof node> => Boolean(node))
  const activeIndex = Math.max(0, nodes.findIndex(node => node.id === activeNodeId))
  return <section className="panel p-4"><p className="eyebrow mb-4">通信経路</p><div className="flex items-start justify-between gap-1">{nodes.map((node, index) => <div key={node.id} className="flex min-w-0 flex-1 items-center last:flex-none"><div className="flex min-w-0 flex-col items-center"><span className={`grid h-7 w-7 place-items-center rounded-full border text-xs ${index < activeIndex ? 'border-cyan-500 bg-cyan-500 text-white' : index === activeIndex ? 'border-amber-300 bg-amber-300 text-slate-900 shadow-sm' : 'border-slate-300 bg-white text-slate-500'}`}>{index < activeIndex ? '✓' : index === activeIndex ? '●' : index + 1}</span><span className="mt-2 max-w-20 text-center text-[10px] leading-3 text-slate-600">{node.name}</span></div>{index < nodes.length - 1 && <div className={`mb-6 h-px flex-1 ${index < activeIndex ? 'bg-cyan-400' : 'bg-slate-200'}`} />}</div>)}</div></section>
}
