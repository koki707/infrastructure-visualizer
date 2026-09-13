import { Line, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CatmullRomCurve3, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import type { NetworkNode, Position } from '../../types/network'
import { NodeModel, type DeviceActivity } from '../scene/NodeModel'
import { VisibleText } from '../scene/VisibleText'

type ArpSceneStep = 0 | 1 | 2 | 3 | 4
type PacketKind = 'arp' | 'frame'

type PacketPlan = {
  label: string
  detail: string
  color: string
  kind: PacketKind
  path: Position[]
}

const LAN_NODES: NetworkNode[] = [
  { id: 'pc', name: 'PC', type: 'pc', position: [-4.6, -0.05, 0], detail: '192.168.1.10', description: 'ARPを送信するPCです。' },
  { id: 'switch', name: 'LAN Switch', type: 'switch', position: [0, -0.05, 0], detail: '同一LAN内で転送', description: '同一ブロードキャストドメイン内でFrameを転送します。' },
  { id: 'home-router', name: 'Home Router', type: 'router', position: [4.6, -0.05, 0], detail: '192.168.1.1 · Default Gateway', description: '別ネットワーク向けの次ホップです。' },
]

const PC_POSITION = LAN_NODES[0].position
const SWITCH_POSITION = LAN_NODES[1].position
const ROUTER_POSITION = LAN_NODES[2].position

function packetPlanFor(step: ArpSceneStep): PacketPlan | null {
  if (step === 1) return {
    label: 'ARP Request',
    detail: 'L2: FF:FF:FF:FF:FF:FF',
    color: '#0ea5e9',
    kind: 'arp',
    path: [PC_POSITION, SWITCH_POSITION],
  }
  if (step === 2) return {
    label: 'ARP Request',
    detail: 'SwitchがLAN内へ転送',
    color: '#0ea5e9',
    kind: 'arp',
    path: [PC_POSITION, SWITCH_POSITION, ROUTER_POSITION],
  }
  if (step === 3) return {
    label: 'ARP Reply',
    detail: '192.168.1.1 = 02:00:5E:10:00:01',
    color: '#10b981',
    kind: 'arp',
    path: [ROUTER_POSITION, SWITCH_POSITION, PC_POSITION],
  }
  if (step === 4) return {
    label: 'Ethernet Frame',
    detail: 'L2: Gateway MAC · L3: Web Server IP',
    color: '#f59e0b',
    kind: 'frame',
    path: [PC_POSITION, SWITCH_POSITION, ROUTER_POSITION],
  }
  return null
}

function activityFor(step: ArpSceneStep, nodeId: string): DeviceActivity {
  const activities: Record<ArpSceneStep, Partial<Record<string, DeviceActivity>>> = {
    0: { pc: 'outgoing' },
    1: { pc: 'outgoing', switch: 'incoming' },
    2: { switch: 'outgoing', 'home-router': 'incoming' },
    3: { 'home-router': 'outgoing', switch: 'incoming', pc: 'incoming' },
    4: { pc: 'outgoing', switch: 'outgoing', 'home-router': 'incoming' },
  }
  return activities[step][nodeId] ?? null
}

function focusFor(step: ArpSceneStep) {
  if (step === 2) return 'switch'
  if (step === 3) return 'home-router'
  if (step === 4) return 'home-router'
  return 'pc'
}

function ArpPacket({ plan, replayKey }: { plan: PacketPlan; replayKey: number }) {
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
    const progress = Math.min(Math.max((clock.elapsedTime - startedAtRef.current) / 1.45, 0), 1)
    const point = curve.getPointAt(progress)
    group.position.set(point.x, point.y + 0.35 + Math.sin(progress * Math.PI) * 0.12, point.z + 0.12)
    group.rotation.y = clock.elapsedTime * 1.5
  })

  const outerColor = plan.kind === 'frame' ? '#f59e0b' : plan.color
  const innerColor = plan.kind === 'frame' ? '#38bdf8' : '#a5f3fc'
  return <group ref={groupRef}>
    <mesh scale={[1.18, 0.86, 0.62]} rotation={[0.25, 0.12, 0]}>
      <boxGeometry args={[0.46, 0.46, 0.46]} />
      <meshBasicMaterial color={outerColor} wireframe />
    </mesh>
    <mesh scale={[0.72, 0.54, 0.36]} rotation={[0.25, 0.12, 0]}>
      <boxGeometry args={[0.46, 0.46, 0.46]} />
      <meshBasicMaterial color={innerColor} wireframe />
    </mesh>
    <mesh>
      <icosahedronGeometry args={[0.2, 2]} />
      <meshStandardMaterial color="#fef3c7" emissive={outerColor} emissiveIntensity={1.7} />
    </mesh>
    <VisibleText position={[0, 0.52, 0]} fontSize={0.17} color="#0f172a" anchorX="center">{plan.label}</VisibleText>
    <VisibleText position={[0, -0.48, 0]} fontSize={0.09} color="#155e75" anchorX="center" maxWidth={3.2}>{plan.detail}</VisibleText>
  </group>
}

function BroadcastPulse({ position, replayKey }: { position: Position; replayKey: number }) {
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
    const progress = Math.min(Math.max((clock.elapsedTime - startedAtRef.current) / 1.25, 0), 1)
    mesh.visible = progress < 1
    mesh.scale.setScalar(0.35 + progress * 2.1)
    ;(mesh.material as MeshBasicMaterial).opacity = (1 - progress) * 0.62
  })

  return <mesh ref={meshRef} position={[position[0], -1.4, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
    <ringGeometry args={[0.18, 0.22, 32]} />
    <meshBasicMaterial color="#38bdf8" transparent depthWrite={false} />
  </mesh>
}

function LanPeer({ position, active }: { position: Position; active: boolean }) {
  return <group position={position}>
    <mesh position={[0, -0.28, 0]}>
      <boxGeometry args={[0.64, 0.56, 0.4]} />
      <meshStandardMaterial color="#64748b" metalness={0.55} roughness={0.38} />
    </mesh>
    <mesh position={[0, -0.1, 0.22]}>
      <boxGeometry args={[0.38, 0.16, 0.02]} />
      <meshStandardMaterial color={active ? '#fbbf24' : '#94a3b8'} emissive={active ? '#f59e0b' : '#64748b'} emissiveIntensity={active ? 1.5 : 0.25} />
    </mesh>
    {active && <mesh position={[0, -0.57, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.47, 0.52, 32]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0.75} depthWrite={false} />
    </mesh>}
  </group>
}

function LanScene({ step, replayKey }: { step: ArpSceneStep; replayKey: number }) {
  const [selectedId, setSelectedId] = useState(focusFor(step))
  const packet = packetPlanFor(step)
  const peerLeft: Position = [-0.2, -0.1, 2.65]
  const peerRight: Position = [0.2, -0.1, -2.65]
  const focus = focusFor(step)

  useEffect(() => setSelectedId(focus), [focus])

  return <>
    <color attach="background" args={['#f5fbff']} />
    <ambientLight intensity={1.25} />
    <directionalLight position={[5, 9, 7]} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]} />
    <pointLight position={[-4, 4, 3]} intensity={8} color="#7dd3fc" />
    <mesh position={[0, -1.55, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[15, 8]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.92} />
    </mesh>
    <gridHelper args={[15, 15, '#bae6fd', '#e2e8f0']} position={[0, -1.52, 0]} />
    <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[13.8, 6.8]} />
      <meshBasicMaterial color="#dff5ff" transparent opacity={step === 0 ? 0.26 : 0.38} depthWrite={false} />
    </mesh>
    <VisibleText position={[0, -1.36, -3.1]} fontSize={0.2} color="#0f4c6f" anchorX="center">HOME LAN · 192.168.1.0 /24</VisibleText>
    <VisibleText position={[0, -1.6, -3.1]} fontSize={0.11} color="#475569" anchorX="center">ARPはこのリンク内で次ホップを見つけます</VisibleText>

    <Line points={[PC_POSITION, SWITCH_POSITION]} color={step === 1 || step === 2 || step === 3 || step === 4 ? '#0ea5e9' : '#94a3b8'} lineWidth={step === 0 ? 1.1 : 2.1} />
    <Line points={[SWITCH_POSITION, ROUTER_POSITION]} color={step >= 2 ? '#0ea5e9' : '#94a3b8'} lineWidth={step >= 2 ? 2.1 : 1.1} />
    <Line points={[SWITCH_POSITION, peerLeft]} color={step === 2 ? '#38bdf8' : '#cbd5e1'} lineWidth={step === 2 ? 1.7 : 0.8} transparent opacity={step === 2 ? 0.9 : 0.5} />
    <Line points={[SWITCH_POSITION, peerRight]} color={step === 2 ? '#38bdf8' : '#cbd5e1'} lineWidth={step === 2 ? 1.7 : 0.8} transparent opacity={step === 2 ? 0.9 : 0.5} />
    {step === 2 && <><BroadcastPulse position={peerLeft} replayKey={replayKey} /><BroadcastPulse position={peerRight} replayKey={replayKey} /></>}
    <LanPeer position={peerLeft} active={step === 2} />
    <LanPeer position={peerRight} active={step === 2} />
    <VisibleText position={[peerLeft[0], -0.95, peerLeft[2]]} fontSize={0.11} color="#475569" anchorX="center">同一LANの端末</VisibleText>
    <VisibleText position={[peerRight[0], -0.95, peerRight[2]]} fontSize={0.11} color="#475569" anchorX="center">同一LANの端末</VisibleText>

    {LAN_NODES.map(node => <NodeModel
      key={node.id}
      node={node}
      active={node.id === selectedId}
      activity={activityFor(step, node.id)}
      onSelect={selected => setSelectedId(selected.id)}
      onExplore={() => undefined}
    />)}
    {packet && <ArpPacket plan={packet} replayKey={replayKey} />}
    <OrbitControls enablePan enableDamping dampingFactor={0.08} minDistance={7} maxDistance={21} maxPolarAngle={Math.PI / 2.05} target={[0, -0.3, 0]} zoomToCursor />
  </>
}

export default function ArpThreeScene({ step, replayKey }: { step: number; replayKey: number }) {
  const safeStep = Math.min(Math.max(step, 0), 4) as ArpSceneStep
  return <Canvas
    className="h-full w-full"
    camera={{ position: [0, 6.8, 10.8], fov: 43 }}
    dpr={[1, 2]}
    shadows
  >
    <LanScene step={safeStep} replayKey={replayKey} />
  </Canvas>
}
