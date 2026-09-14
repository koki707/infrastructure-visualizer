import { Line, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CatmullRomCurve3, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import type { NetworkNode, Position } from '../../types/network'
import { NodeModel, type DeviceActivity } from '../scene/NodeModel'
import { VisibleText } from '../scene/VisibleText'

type DnsSceneStep = 0 | 1 | 2 | 3 | 4

type PacketPlan = {
  label: string
  detail: string
  color: string
  path: Position[]
}

const DNS_NODES: NetworkNode[] = [
  { id: 'pc', name: 'PC', type: 'pc', position: [-5.1, -0.05, 0], detail: 'ブラウザ · docs.example.test', description: 'DNS問い合わせ（DNS Query）を始めるPCです。' },
  { id: 'home-router', name: '家庭用ルーター', type: 'router', position: [-1.45, -0.05, 0], detail: 'デフォルトゲートウェイ', description: 'DNSリゾルバーへ向けて転送する代表例です。' },
  { id: 'dns-server', name: 'DNSリゾルバー', type: 'dns', position: [2.8, -0.05, 0], detail: '設定済みの再帰リゾルバー', description: '名前解決を行う教育用の代表モデルです。' },
]

const PC_POSITION = DNS_NODES[0].position
const ROUTER_POSITION = DNS_NODES[1].position
const RESOLVER_POSITION = DNS_NODES[2].position
const UPSTREAM_POSITION: Position = [6.1, -0.05, 1.9]

function packetPlanFor(step: DnsSceneStep, cacheHit: boolean): PacketPlan | null {
  if (step === 1) return { label: 'DNS問い合わせ', detail: 'QNAME: docs.example.test', color: '#0ea5e9', path: [PC_POSITION, ROUTER_POSITION] }
  if (step === 2) return { label: 'DNS問い合わせ', detail: 'QTYPE: A · リゾルバーへ到着', color: '#0ea5e9', path: [ROUTER_POSITION, RESOLVER_POSITION] }
  if (step === 3 && !cacheHit) return { label: '上流への問い合わせ', detail: '必要な情報を上流へ問い合わせ', color: '#8b5cf6', path: [RESOLVER_POSITION, UPSTREAM_POSITION, RESOLVER_POSITION] }
  if (step === 4) return { label: 'DNS応答', detail: 'docs.example.test → 203.0.113.10', color: '#10b981', path: [RESOLVER_POSITION, ROUTER_POSITION, PC_POSITION] }
  return null
}

function activityFor(step: DnsSceneStep, nodeId: string, cacheHit: boolean): DeviceActivity {
  const activities: Record<DnsSceneStep, Partial<Record<string, DeviceActivity>>> = {
    0: { pc: 'outgoing' },
    1: { pc: 'outgoing', 'home-router': 'incoming' },
    2: { 'home-router': 'outgoing', 'dns-server': 'incoming' },
    3: { 'dns-server': cacheHit ? 'outgoing' : 'incoming' },
    4: { 'dns-server': 'outgoing', 'home-router': 'incoming', pc: 'incoming' },
  }
  return activities[step][nodeId] ?? null
}

function focusFor(step: DnsSceneStep) {
  if (step === 1 || step === 2) return 'home-router'
  if (step === 3) return 'dns-server'
  return step === 4 ? 'pc' : 'pc'
}

function DnsPacket({ plan, replayKey }: { plan: PacketPlan; replayKey: number }) {
  const groupRef = useRef<Group>(null)
  const initializedRef = useRef(false)
  const replayRef = useRef(replayKey)
  const startedAtRef = useRef(0)
  const curve = useMemo(() => new CatmullRomCurve3(plan.path.map(point => new Vector3(...point))), [plan.path])

  useFrame(({ clock }) => {
    const group = groupRef.current
    if (!group) return
    if (!initializedRef.current || replayRef.current !== replayKey) {
      initializedRef.current = true
      replayRef.current = replayKey
      startedAtRef.current = clock.elapsedTime
    }
    const progress = Math.min(Math.max((clock.elapsedTime - startedAtRef.current) / 1.65, 0), 1)
    const point = curve.getPointAt(progress)
    group.position.set(point.x, point.y + 0.4 + Math.sin(progress * Math.PI) * 0.12, point.z + 0.14)
    group.rotation.y = clock.elapsedTime * 1.45
  })

  return <group ref={groupRef}>
    <mesh scale={[1.16, 0.86, 0.62]} rotation={[0.25, 0.12, 0]}>
      <boxGeometry args={[0.46, 0.46, 0.46]} />
      <meshBasicMaterial color={plan.color} wireframe />
    </mesh>
    <mesh scale={[0.72, 0.54, 0.36]} rotation={[0.25, 0.12, 0]}>
      <boxGeometry args={[0.46, 0.46, 0.46]} />
      <meshBasicMaterial color="#a5f3fc" wireframe />
    </mesh>
    <mesh>
      <icosahedronGeometry args={[0.2, 2]} />
      <meshStandardMaterial color="#fef3c7" emissive={plan.color} emissiveIntensity={1.7} />
    </mesh>
    <VisibleText position={[0, 0.52, 0]} fontSize={0.17} color="#0f172a" anchorX="center">{plan.label}</VisibleText>
    <VisibleText position={[0, -0.48, 0]} fontSize={0.09} color="#155e75" anchorX="center" maxWidth={3.4}>{plan.detail}</VisibleText>
  </group>
}

function ResolverCache({ active, cacheHit }: { active: boolean; cacheHit: boolean }) {
  const indicatorColor = cacheHit ? '#10b981' : active ? '#f59e0b' : '#94a3b8'
  return <group position={[2.8, 0.85, -1.1]}>
    <mesh>
      <boxGeometry args={[1.5, 0.58, 0.35]} />
      <meshStandardMaterial color="#e0f2fe" metalness={0.25} roughness={0.5} />
    </mesh>
    <mesh position={[-0.58, 0, 0.2]}>
      <circleGeometry args={[0.07, 16]} />
      <meshStandardMaterial color={indicatorColor} emissive={indicatorColor} emissiveIntensity={active ? 1.9 : 0.45} />
    </mesh>
    <VisibleText position={[0, 0.08, 0.22]} fontSize={0.12} color="#0f172a" anchorX="center">リゾルバーキャッシュ</VisibleText>
    <VisibleText position={[0, -0.13, 0.22]} fontSize={0.08} color="#475569" anchorX="center">{cacheHit ? '回答あり' : 'キャッシュミス（例）'}</VisibleText>
  </group>
}

function UpstreamDns({ active }: { active: boolean }) {
  const indicator = active ? '#8b5cf6' : '#94a3b8'
  return <group position={UPSTREAM_POSITION}>
    <mesh position={[0, -0.12, 0]}>
      <boxGeometry args={[1.1, 0.9, 0.62]} />
      <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.32} />
    </mesh>
    {[0.18, -0.08, -0.34].map((y, index) => <group key={y}>
      <mesh position={[0, y, 0.33]}><boxGeometry args={[0.82, 0.15, 0.02]} /><meshStandardMaterial color="#475569" /></mesh>
      <mesh position={[-0.31, y, 0.35]}><circleGeometry args={[0.026, 12]} /><meshStandardMaterial color={active && index === 1 ? indicator : '#67e8f9'} emissive={active && index === 1 ? indicator : '#0891b2'} emissiveIntensity={active && index === 1 ? 2.2 : 0.6} /></mesh>
    </group>)}
    <VisibleText position={[0, -0.85, 0]} fontSize={0.15} color="#0f172a" anchorX="center">上流DNS</VisibleText>
    <VisibleText position={[0, -1.07, 0]} fontSize={0.09} color="#475569" anchorX="center">論理的な問い合わせ先</VisibleText>
  </group>
}

function CachePulse({ replayKey }: { replayKey: number }) {
  const meshRef = useRef<Mesh>(null)
  const initializedRef = useRef(false)
  const replayRef = useRef(replayKey)
  const startedAtRef = useRef(0)
  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return
    if (!initializedRef.current || replayRef.current !== replayKey) {
      initializedRef.current = true
      replayRef.current = replayKey
      startedAtRef.current = clock.elapsedTime
    }
    const progress = Math.min(Math.max((clock.elapsedTime - startedAtRef.current) / 1.1, 0), 1)
    mesh.visible = progress < 1
    mesh.scale.setScalar(0.35 + progress * 1.9)
    ;(mesh.material as MeshBasicMaterial).opacity = (1 - progress) * 0.65
  })
  return <mesh ref={meshRef} position={[2.8, -1.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <ringGeometry args={[0.17, 0.22, 32]} />
    <meshBasicMaterial color="#8b5cf6" transparent depthWrite={false} />
  </mesh>
}

function DnsScene({ step, replayKey, cacheHit }: { step: DnsSceneStep; replayKey: number; cacheHit: boolean }) {
  const [selectedId, setSelectedId] = useState(focusFor(step))
  const packet = packetPlanFor(step, cacheHit)
  const focus = focusFor(step)

  useEffect(() => setSelectedId(focus), [focus])

  return <>
    <color attach="background" args={['#f5fbff']} />
    <ambientLight intensity={1.25} />
    <directionalLight position={[5, 9, 7]} intensity={2.15} castShadow shadow-mapSize={[1024, 1024]} />
    <pointLight position={[-4, 4, 3]} intensity={8} color="#7dd3fc" />
    <mesh position={[0.5, -1.55, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[16.5, 8.6]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.92} />
    </mesh>
    <gridHelper args={[16, 16, '#bae6fd', '#e2e8f0']} position={[0.5, -1.52, 0]} />
    <mesh position={[0.5, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[15.3, 7.3]} />
      <meshBasicMaterial color="#e0f2fe" transparent opacity={0.34} depthWrite={false} />
    </mesh>
    <VisibleText position={[0.5, -1.36, -3.35]} fontSize={0.2} color="#0f4c6f" anchorX="center">DNS名前解決 · 教育用の代表例</VisibleText>
    <VisibleText position={[0.5, -1.6, -3.35]} fontSize={0.11} color="#475569" anchorX="center">PCは設定済みの再帰リゾルバへ問い合わせます</VisibleText>

    <Line points={[PC_POSITION, ROUTER_POSITION]} color={step === 1 || step === 4 ? '#0ea5e9' : '#94a3b8'} lineWidth={step === 1 || step === 4 ? 2.1 : 1.1} />
    <Line points={[ROUTER_POSITION, RESOLVER_POSITION]} color={step === 2 || step === 4 ? '#0ea5e9' : '#94a3b8'} lineWidth={step === 2 || step === 4 ? 2.1 : 1.1} />
    <Line points={[RESOLVER_POSITION, UPSTREAM_POSITION]} color={step === 3 && !cacheHit ? '#8b5cf6' : '#cbd5e1'} lineWidth={step === 3 && !cacheHit ? 1.9 : 0.9} dashed dashScale={8} dashSize={0.35} gapSize={0.2} />
    {step === 3 && <CachePulse replayKey={replayKey} />}
    <ResolverCache active={step === 2 || step === 3 || step === 4} cacheHit={cacheHit} />
    <UpstreamDns active={step === 3 && !cacheHit} />
    {DNS_NODES.map(node => <NodeModel
      key={node.id}
      node={node}
      active={node.id === selectedId}
      activity={activityFor(step, node.id, cacheHit)}
      onSelect={selected => setSelectedId(selected.id)}
      onExplore={() => undefined}
    />)}
    {packet && <DnsPacket plan={packet} replayKey={replayKey} />}
    <OrbitControls enablePan enableDamping dampingFactor={0.08} minDistance={8} maxDistance={23} maxPolarAngle={Math.PI / 2.05} target={[0.5, -0.3, 0]} zoomToCursor />
  </>
}

export default function DnsThreeScene({ step, replayKey, cacheHit }: { step: number; replayKey: number; cacheHit: boolean }) {
  const safeStep = Math.min(Math.max(step, 0), 4) as DnsSceneStep
  return <Canvas className="h-full w-full" camera={{ position: [0.5, 6.9, 11.7], fov: 43 }} dpr={[1, 2]} shadows>
    <DnsScene step={safeStep} replayKey={replayKey} cacheHit={cacheHit} />
  </Canvas>
}
