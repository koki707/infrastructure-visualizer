import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Breadcrumb } from '../components/exploration/Breadcrumb'
import { DetailPanel } from '../components/exploration/DetailPanel'
import { ExplorationScene } from '../components/exploration/ExplorationScene'
import { NetworkScene } from '../components/scene/NetworkScene'
import { ControlPanel } from '../components/ui/ControlPanel'
import { EncapsulationPanel } from '../components/ui/EncapsulationPanel'
import { GlossaryPanel } from '../components/ui/GlossaryPanel'
import { InfoPanel } from '../components/ui/InfoPanel'
import { LearningPoint } from '../components/ui/LearningPoint'
import { ProgressBar } from '../components/ui/ProgressBar'
import { RequestStatusPanel } from '../components/ui/RequestStatusPanel'
import { RequestTimeline } from '../components/ui/RequestTimeline'
import { EXPLORATION_WORLDS } from '../data/exploration'
import { ANIMATION_DURATION_MS, NETWORK_NODES, SIMULATION_DESTINATIONS } from '../data/network'
import { REQUEST_STOPS, requestStageAt, stageProgress, toRequestLine } from '../data/request'
import type { ExplorationItem, ExplorationWorldId } from '../types/exploration'
import type { NetworkNode } from '../types/network'
import type { RequestPlaybackMode } from '../types/request'
import { SiteHeader, type Navigate } from '../components/site/SiteLayout'

const toBits = (value: string) => new TextEncoder().encode(value).reduce((bits, byte) => `${bits}${byte.toString(2).padStart(8, '0')} `, '').trim()
const getWorldForNode = (node: NetworkNode): ExplorationWorldId => node.type === 'pc' ? 'pc' : node.type === 'switch' ? 'switch' : node.type === 'dns' ? 'dns' : node.type === 'server' ? 'server' : 'router'
const STEP_HOP_DURATION_MS = 650

/**
 * The existing three-column simulator lives in its own route chunk so ordinary
 * site pages do not eagerly load Three.js and the 3D exploration scenes.
 */
export default function VisualizerPage({ onNavigate }: { onNavigate: Navigate }) {
  const [destinationId, setDestinationId] = useState(SIMULATION_DESTINATIONS[0].id)
  const [selectedNode, setSelectedNode] = useState<NetworkNode>(NETWORK_NODES[0])
  const [packetProgress, setPacketProgress] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const [paused, setPaused] = useState(false)
  const [playbackMode, setPlaybackMode] = useState<RequestPlaybackMode>('continuous')
  const [stepStopIndex, setStepStopIndex] = useState(0)
  const [stepTargetIndex, setStepTargetIndex] = useState<number | null>(null)
  const [worldHistory, setWorldHistory] = useState<ExplorationWorldId[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [learningPointHidden, setLearningPointHidden] = useState(false)
  const [bitsVisible, setBitsVisible] = useState(false)
  const [devicePickerOpen, setDevicePickerOpen] = useState(false)
  const elapsedRef = useRef(0)
  const segmentStartedAtRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)
  const packetProgressRef = useRef<number | null>(null)

  const worldId = worldHistory.at(-1) ?? null
  const world = worldId ? EXPLORATION_WORLDS[worldId] : null
  const destination = SIMULATION_DESTINATIONS.find(item => item.id === destinationId) ?? SIMULATION_DESTINATIONS[0]
  const url = destination.url
  const stepStops = useMemo(() => REQUEST_STOPS.map(stop => ({
    ...stop,
    nodeId: stop.nodeId === 'web-server' ? destination.serverNodeId : stop.nodeId,
  })), [destination.serverNodeId])
  const requestStage = useMemo(() => {
    const stage = requestStageAt(packetProgress)
    if (!stage) return null
    const replaceServer = (nodeId: string) => nodeId === 'web-server' ? destination.serverNodeId : nodeId
    return {
      ...stage,
      fromNodeId: replaceServer(stage.fromNodeId),
      toNodeId: replaceServer(stage.toNodeId),
      nodePath: stage.nodePath.map(replaceServer),
    }
  }, [destination.serverNodeId, packetProgress])
  const currentStepStop = playbackMode === 'step' && sending ? stepStops[stepStopIndex] ?? null : null
  const movingStepStop = playbackMode === 'step' && sending && stepTargetIndex !== null ? stepStops[stepTargetIndex] ?? null : null
  const pausedAtNodeId = paused && stepTargetIndex === null ? currentStepStop?.nodeId ?? null : null
  const progressedNodeId = useMemo(() => {
    if (!requestStage || packetProgress === null) return null
    const nodeCount = requestStage.nodePath.length - 1
    const nodeIndex = Math.min(nodeCount, Math.floor(stageProgress(requestStage, packetProgress) * nodeCount + 0.000001))
    return requestStage.nodePath[nodeIndex] ?? requestStage.toNodeId
  }, [packetProgress, requestStage])
  const activeNodeId = packetProgress === null ? selectedNode.id : pausedAtNodeId ?? progressedNodeId ?? requestStage?.toNodeId ?? selectedNode.id
  const defaultRouteNodeIds = useMemo(() => ['pc', 'switch', 'home-router', 'isp-router', 'internet-router', destination.serverNodeId], [destination.serverNodeId])
  const progressNodeIds = packetProgress === null ? defaultRouteNodeIds : requestStage?.nodePath ?? defaultRouteNodeIds
  const journey = requestStage && packetProgress !== null
    ? {
      nodePath: requestStage.nodePath,
      progress: stageProgress(requestStage, packetProgress),
      label: requestStage.shortTitle,
      protocol: requestStage.protocol,
    }
    : null
  const requestLine = useMemo(() => toRequestLine(url), [url])
  const bits = useMemo(() => toBits(requestLine), [requestLine])
  const breadcrumbItems = worldHistory.map(id => EXPLORATION_WORLDS[id].title)
  const glossaryContext = world
    ? [world.title, world.lead, world.note ?? '', world.items.find(item => item.id === selectedItemId)?.title ?? '', world.items.find(item => item.id === selectedItemId)?.description ?? '']
    : [selectedNode.name, selectedNode.detail, selectedNode.description, requestStage?.shortTitle ?? '', requestStage?.protocol ?? '', requestStage?.description ?? '']

  const stepPlayback = useMemo(() => {
    if (playbackMode !== 'step' || !sending || !currentStepStop) return null
    const displayStop = movingStepStop ?? currentStepStop
    const node = NETWORK_NODES.find(item => item.id === displayStop.nodeId)
    return {
      currentIndex: stepStopIndex,
      total: stepStops.length,
      stageLabel: displayStop.label,
      nodeName: node?.name ?? displayStop.nodeId,
      isMoving: stepTargetIndex !== null,
      isComplete: stepTargetIndex === null && stepStopIndex === stepStops.length - 1,
    }
  }, [currentStepStop, movingStepStop, playbackMode, sending, stepStopIndex, stepStops.length, stepTargetIndex])
  const stepStatusText = stepPlayback
    ? `止めて追う · ${stepPlayback.currentIndex + 1} / ${stepPlayback.total} · ${stepPlayback.stageLabel} · ${stepPlayback.nodeName}${stepPlayback.isMoving ? 'へ移動中' : stepPlayback.isComplete ? 'で処理を確認' : 'に到着'}`
    : null

  useEffect(() => {
    packetProgressRef.current = packetProgress
  }, [packetProgress])

  useEffect(() => {
    if (packetProgress === null) return
    const activeNode = NETWORK_NODES.find(node => node.id === activeNodeId)
    if (activeNode) setSelectedNode(activeNode)
    if (packetProgress >= 1 && playbackMode === 'continuous') {
      const timer = window.setTimeout(() => {
        setPacketProgress(null)
        setSending(false)
      }, 1100)
      return () => window.clearTimeout(timer)
    }
  }, [packetProgress, activeNodeId, playbackMode])

  useEffect(() => {
    if (!sending || paused) return
    if (playbackMode === 'step') {
      if (stepTargetIndex === null) return
      const from = packetProgressRef.current ?? 0
      const target = stepStops[stepTargetIndex]?.progress
      if (target === undefined || target <= from) return

      const startedAt = performance.now()
      const distance = target - from
      const duration = Math.min(850, Math.max(420, STEP_HOP_DURATION_MS + distance * 1200))
      const tick = (now: number) => {
        const ratio = Math.min((now - startedAt) / duration, 1)
        // A gentle ease makes the arrival legible without adding a long cinematic pause.
        const eased = 1 - (1 - ratio) * (1 - ratio)
        const next = from + distance * eased
        setPacketProgress(next)
        if (ratio < 1) {
          animationFrameRef.current = requestAnimationFrame(tick)
          return
        }
        packetProgressRef.current = target
        setPacketProgress(target)
        setStepStopIndex(stepTargetIndex)
        setStepTargetIndex(null)
        setPaused(true)
      }
      animationFrameRef.current = requestAnimationFrame(tick)
      return () => {
        if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current)
      }
    }

    segmentStartedAtRef.current = performance.now()
    const tick = (now: number) => {
      const elapsed = elapsedRef.current + now - segmentStartedAtRef.current
      const next = Math.min(elapsed / ANIMATION_DURATION_MS, 1)
      setPacketProgress(next)
      if (next < 1) animationFrameRef.current = requestAnimationFrame(tick)
    }
    animationFrameRef.current = requestAnimationFrame(tick)
    return () => {
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [sending, paused, playbackMode, stepStops, stepTargetIndex])

  const startTransmission = () => {
    if (sending) return
    elapsedRef.current = 0
    const initialProgress = playbackMode === 'step' ? stepStops[0]?.progress ?? 0 : 0
    packetProgressRef.current = initialProgress
    setPacketProgress(initialProgress)
    setPaused(playbackMode === 'step')
    setStepStopIndex(0)
    setStepTargetIndex(null)
    setLearningPointHidden(false)
    setDevicePickerOpen(false)
    setSending(true)
  }
  const pauseTransmission = () => {
    if (!sending || paused) return
    if (playbackMode === 'continuous') elapsedRef.current += performance.now() - segmentStartedAtRef.current
    setPaused(true)
  }
  const resumeTransmission = () => {
    if (sending && paused && (playbackMode === 'continuous' || stepTargetIndex !== null)) setPaused(false)
  }
  const advanceStep = () => {
    if (!sending || playbackMode !== 'step' || stepTargetIndex !== null) return
    const nextIndex = stepStopIndex + 1
    if (nextIndex >= stepStops.length) return
    setLearningPointHidden(false)
    setStepTargetIndex(nextIndex)
    setPaused(false)
  }
  const previousStep = () => {
    if (!sending || playbackMode !== 'step' || stepTargetIndex !== null || stepStopIndex <= 0) return
    const previousIndex = stepStopIndex - 1
    const previousProgress = stepStops[previousIndex]?.progress ?? 0
    packetProgressRef.current = previousProgress
    setPacketProgress(previousProgress)
    setStepStopIndex(previousIndex)
    setPaused(true)
    setLearningPointHidden(false)
  }
  const resetStep = () => {
    if (playbackMode !== 'step') return
    const initialProgress = stepStops[0]?.progress ?? 0
    packetProgressRef.current = initialProgress
    setPacketProgress(initialProgress)
    setStepStopIndex(0)
    setStepTargetIndex(null)
    setPaused(true)
    setSending(true)
    setLearningPointHidden(false)
  }
  const endStep = () => {
    if (playbackMode !== 'step') return
    setPacketProgress(null)
    packetProgressRef.current = null
    setSending(false)
    setPaused(false)
    setStepTargetIndex(null)
  }

  // Simulation state and exploration state are deliberately independent.
  const selectNode = useCallback((node: NetworkNode) => {
    if (!sending) setSelectedNode(node)
  }, [sending])
  const openWorld = (nextWorld: ExplorationWorldId) => {
    setWorldHistory(history => history.at(-1) === nextWorld ? history : [...history, nextWorld])
    setSelectedItemId(null)
  }
  const enterNode = (node: NetworkNode) => {
    if (sending) return
    setSelectedNode(node)
    openWorld(getWorldForNode(node))
  }
  const enterSelectedNode = () => enterNode(selectedNode)
  const selectItem = (item: ExplorationItem) => {
    setSelectedItemId(item.id)
    if (item.next) openWorld(item.next)
  }
  const goBack = () => {
    setWorldHistory(history => history.slice(0, -1))
    setSelectedItemId(null)
  }
  const goHome = () => {
    setWorldHistory([])
    setSelectedItemId(null)
  }
  const goToHistory = (index: number) => {
    setWorldHistory(history => history.slice(0, index + 1))
    setSelectedItemId(null)
  }
  const openGlossary = (termId: string) => onNavigate(`/glossary/${termId}`)

  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <SiteHeader path="/visualizer" onNavigate={onNavigate} />
    <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 pb-4 pt-5 lg:px-8">
      <div><p className="eyebrow">3D ネットワークシミュレーション</p><h1 className="mt-1 text-base font-bold tracking-tight text-slate-900 sm:text-lg">URLアクセス：見えないインフラをたどる</h1></div>
      <span className="hidden rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs text-cyan-700 sm:block">ブラウザ内教育シミュレーション</span>
    </div>

    <div className="mx-auto grid max-w-[1600px] items-start gap-4 px-5 pb-6 lg:grid-cols-[310px_minmax(0,1fr)_310px] lg:px-8">
      <aside className="space-y-4">
        <ControlPanel
          destinationId={destinationId}
          destinations={SIMULATION_DESTINATIONS}
          sending={sending}
          paused={paused}
          playbackMode={playbackMode}
          stepPlayback={stepPlayback}
          onDestinationChange={setDestinationId}
          onPlaybackModeChange={setPlaybackMode}
          onSend={startTransmission}
          onPause={pauseTransmission}
          onResume={resumeTransmission}
          onNextStop={advanceStep}
          onPreviousStop={previousStep}
          onResetStep={stepPlayback?.isComplete ? endStep : resetStep}
        />
        <section className="panel p-5">
          <p className="eyebrow">HTTPリクエスト（簡略）</p>
          <pre className="mt-3 whitespace-pre-wrap break-all font-mono text-xs leading-6 text-amber-700">{requestLine}</pre>
          <p className="mt-2 text-xs leading-5 text-slate-500">HTTPリクエストは文字列として扱われ、送信時にはバイト列へ符号化されます。</p>
          <button type="button" aria-expanded={bitsVisible} onClick={() => setBitsVisible(value => !value)} className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-50">{bitsVisible ? 'ビット列を隠す' : 'ビット列を見る（教材用の表示）'}</button>
          {bitsVisible && <p className="mt-2 break-all font-mono text-[11px] leading-5 text-slate-500">{bits}</p>}
        </section>
        <EncapsulationPanel message={requestLine} url={url} onExplore={openWorld} onOpenTerm={openGlossary} />
      </aside>

      <section className={`relative h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:h-[650px] ${world ? 'world-transition' : ''}`}>
        {world ? <>
          <ExplorationScene world={world} selectedId={selectedItemId} onSelect={selectItem} />
          <div className="pointer-events-none absolute left-5 right-5 top-4">
            <div className="pointer-events-auto"><Breadcrumb items={breadcrumbItems} onBack={goBack} onHome={goHome} onNavigate={goToHistory} /></div>
            <div className="mt-3 inline-flex rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur"><span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${sending ? 'bg-cyan-500' : 'bg-slate-400'}`} />{sending ? '通信中・自由に探索' : '自由に探索'}</div>
            {stepStatusText && <p aria-live="polite" className="mt-2 inline-flex max-w-full rounded-lg border border-cyan-100 bg-white/90 px-3 py-1.5 text-xs font-semibold leading-5 text-cyan-900 shadow-sm backdrop-blur">{stepStatusText}</p>}
            <div className="mt-3 max-w-lg rounded-xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <p className="eyebrow">詳細世界</p><h2 className="mt-1 text-xl font-bold text-slate-900">{world.title}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{world.lead}</p>
            </div>
          </div>
        </> : <>
          <NetworkScene selectedId={selectedNode.id} journey={journey} pausedAtNodeId={pausedAtNodeId} paused={paused} onSelect={selectNode} onExploreNode={enterNode} />
          <div className="pointer-events-none absolute left-4 top-4 max-w-[calc(100%-2rem)]">
            <div className="inline-flex rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur"><span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${sending ? 'bg-cyan-500' : 'bg-slate-400'}`} />{sending ? '通信を追う' : '自由に探索'}</div>
            {stepStatusText && <p aria-live="polite" className="mt-2 max-w-xl rounded-lg border border-cyan-100 bg-white/90 px-3 py-1.5 text-xs font-semibold leading-5 text-cyan-900 shadow-sm backdrop-blur">{stepStatusText}</p>}
            <div className="pointer-events-auto mt-2 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-sm backdrop-blur">
              <p className="font-semibold text-slate-700">はじめ方</p>
              <p className="mt-1 leading-5">1. 接続先を選ぶ / 2. シミュレーションを開始 / 3. 気になる機器を選ぶ</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" disabled={sending} aria-expanded={devicePickerOpen} onClick={() => setDevicePickerOpen(value => !value)} className="rounded border border-cyan-300 bg-white px-2 py-1 font-semibold text-cyan-800 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50">機器一覧から選ぶ</button>
                <span className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-500">詳細：ダブルクリック / 右の「内部を見る」</span>
              </div>
              {devicePickerOpen && <div className="mt-2 grid grid-cols-2 gap-1 border-t border-slate-200 pt-2 sm:grid-cols-3">{NETWORK_NODES.map(node => <button key={node.id} type="button" onClick={() => { selectNode(node); setDevicePickerOpen(false) }} className={`rounded px-2 py-1.5 text-left text-[11px] font-semibold transition ${node.id === selectedNode.id ? 'bg-cyan-100 text-cyan-900' : 'bg-slate-50 text-slate-700 hover:bg-cyan-50'}`}>{node.name}</button>)}</div>}
            </div>
          </div>
        </>}
        {sending && !learningPointHidden && requestStage && <div className={`pointer-events-none absolute right-4 ${world ? 'top-20' : 'top-4'}`}><div className="pointer-events-auto"><LearningPoint stage={requestStage} onDismiss={() => setLearningPointHidden(true)} onOpenTerm={openGlossary} /></div></div>}
      </section>

      <aside className="space-y-4">
        <RequestStatusPanel stage={requestStage} url={url} onOpenTerm={openGlossary} />
        {world ? <DetailPanel world={world} selectedId={selectedItemId} onOpenTerm={openGlossary} /> : <InfoPanel node={selectedNode} sending={sending} onExplore={enterSelectedNode} onOpenTerm={openGlossary} />}
        <ProgressBar activeNodeId={activeNodeId} nodeIds={progressNodeIds} />
        <RequestTimeline activeId={requestStage?.id ?? null} onExplore={openWorld} onOpenTerm={openGlossary} />
        <section className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-5 shadow-sm">
          <p className="eyebrow">次の学び方</p>
          <h2 className="mt-2 text-sm font-bold text-slate-900">全体像を見たら、通信の仕組みを深掘りする</h2>
          <p className="mt-2 text-xs leading-5 text-slate-700">まずこのシミュレーションでPCからWebサーバーまでの流れを確認し、そのあとDNS、TCP、IP、Ethernetを通信の順に学べます。</p>
          <button type="button" onClick={() => onNavigate('/topics')} className="mt-3 text-xs font-bold text-cyan-800 transition hover:text-cyan-950">通信の仕組みを深掘りする →</button>
        </section>
        {world && <section className="panel p-5"><p className="eyebrow">探索のヒント</p><p className="mt-3 text-sm leading-6 text-slate-700">光る要素をクリックすると、より具体的な世界へ入れます。通信シミュレーション中でも探索は続けられます。</p></section>}
        <GlossaryPanel context={glossaryContext} onOpenTerm={openGlossary} />
      </aside>
    </div>
  </main>
}
