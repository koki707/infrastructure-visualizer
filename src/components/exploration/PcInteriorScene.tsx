import { Line, OrbitControls } from '@react-three/drei'
import { VisibleText as Text } from '../scene/VisibleText'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Mesh } from 'three'
import type { ExplorationItem, ExplorationWorld } from '../../types/exploration'

type Position = [number, number, number]

const DATA_PATH: Position[] = [[-1.2, 3.05, 1.45], [-1.2, 1.9, 1.45], [-1.2, .75, 1.45], [1.8, .15, .4], [4.35, -.55, -1.25], [5.85, -.55, -1.25]]
const SYSTEM_BUS: Position[][] = [
  [[-1.8, -.47, -.35], [-3.55, -.47, -.35]],
  [[-1.8, -.47, -.35], [2.4, -.47, 1.12]],
  [[-1.8, -.47, -.35], [4.25, -.47, -1.28]],
]

function hoverCursor(active: boolean) { document.body.style.cursor = active ? 'pointer' : 'auto' }

function select(item: ExplorationItem, onSelect: (item: ExplorationItem) => void) {
  return (event: { stopPropagation: () => void }) => { event.stopPropagation(); onSelect(item) }
}

function FloatingLayer({ item, position, selected, onSelect }: { item: ExplorationItem; position: Position; selected: boolean; onSelect: (item: ExplorationItem) => void }) {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => { if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * .75 + position[1]) * .045 })
  return <group position={position} onClick={select(item, onSelect)} onPointerOver={() => hoverCursor(true)} onPointerOut={() => hoverCursor(false)}>
    <mesh ref={ref} scale={selected ? 1.08 : 1}>
      <boxGeometry args={[2.75, .62, .16]} />
      <meshStandardMaterial color={item.accent} emissive={item.accent} emissiveIntensity={selected || item.next ? .4 : .12} />
    </mesh>
    <Text position={[0, .02, .14]} fontSize={.23} color="#07111f" outlineWidth={.007} outlineColor="#f8fafc" anchorX="center">{item.title}</Text>
    <Text position={[0, -.48, 0]} fontSize={.15} color="#0f172a" outlineWidth={.006} outlineColor="#f8fafc" anchorX="center">{item.subtitle}</Text>
    {item.next && <Text position={[1.62, 0, 0]} fontSize={.16} color="#0369a1" outlineWidth={.004} outlineColor="#f8fafc">›</Text>}
  </group>
}

function Cpu({ item, selected, onSelect }: { item: ExplorationItem; selected: boolean; onSelect: (item: ExplorationItem) => void }) {
  return <group position={[-1.25, -.52, -.35]} onClick={select(item, onSelect)} onPointerOver={() => hoverCursor(true)} onPointerOut={() => hoverCursor(false)}>
    <mesh><boxGeometry args={[1.65, .22, 1.65]} /><meshStandardMaterial color="#334155" metalness={.75} roughness={.28} /></mesh>
    <mesh position={[0, .2, 0]} scale={selected ? 1.08 : 1}><boxGeometry args={[1.18, .22, 1.18]} /><meshStandardMaterial color="#d97706" emissive="#f59e0b" emissiveIntensity={selected ? .8 : .3} metalness={.6} /></mesh>
    {[-.38, 0, .38].map(x => <mesh key={x} position={[x, .38, 0]}><boxGeometry args={[.13, .18, 1.02]} /><meshStandardMaterial color="#94a3b8" metalness={.8} /></mesh>)}
    <Text position={[0, .68, 0]} fontSize={.24} color="#f8fafc" outlineWidth={.012} outlineColor="#020617" anchorX="center">CPU</Text>
  </group>
}

function Memory({ item, selected, onSelect }: { item: ExplorationItem; selected: boolean; onSelect: (item: ExplorationItem) => void }) {
  return <group position={[-3.75, -.48, -.65]} onClick={select(item, onSelect)} onPointerOver={() => hoverCursor(true)} onPointerOut={() => hoverCursor(false)}>
    {[0, .46].map(offset => <group key={offset} position={[offset, 0, 0]} rotation={[0, .08, 0]}><mesh scale={selected ? 1.06 : 1}><boxGeometry args={[.28, .18, 2.35]} /><meshStandardMaterial color="#4f46e5" emissive="#6366f1" emissiveIntensity={selected ? .55 : .16} metalness={.45} /></mesh>{[-.7, -.25, .2, .65].map(z => <mesh key={z} position={[0, .13, z]}><boxGeometry args={[.3, .04, .22]} /><meshStandardMaterial color="#a5b4fc" /></mesh>)}</group>)}
    <Text position={[.2, .43, 0]} fontSize={.21} color="#f8fafc" outlineWidth={.011} outlineColor="#020617" anchorX="center">メモリ</Text>
  </group>
}

function Storage({ item, selected, onSelect }: { item: ExplorationItem; selected: boolean; onSelect: (item: ExplorationItem) => void }) {
  return <group position={[2.35, -.54, 1.12]} onClick={select(item, onSelect)} onPointerOver={() => hoverCursor(true)} onPointerOut={() => hoverCursor(false)}>
    <mesh scale={selected ? 1.07 : 1}><boxGeometry args={[2.55, .16, .85]} /><meshStandardMaterial color="#334155" metalness={.72} roughness={.3} /></mesh>
    <mesh position={[-.58, .13, 0]}><boxGeometry args={[.62, .04, .52]} /><meshStandardMaterial color="#64748b" metalness={.6} /></mesh>
    <mesh position={[.66, .13, 0]}><boxGeometry args={[.28, .04, .52]} /><meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={.3} /></mesh>
    <Text position={[0, .36, 0]} fontSize={.21} color="#f8fafc" outlineWidth={.011} outlineColor="#020617" anchorX="center">NVMe SSD</Text>
  </group>
}

function Nic({ item, selected, onSelect }: { item: ExplorationItem; selected: boolean; onSelect: (item: ExplorationItem) => void }) {
  return <group position={[4.25, -.52, -1.28]} onClick={select(item, onSelect)} onPointerOver={() => hoverCursor(true)} onPointerOut={() => hoverCursor(false)}>
    <mesh scale={selected ? 1.07 : 1}><boxGeometry args={[2.35, .14, .72]} /><meshStandardMaterial color="#047857" metalness={.5} roughness={.36} /></mesh>
    {[0, .47, .94].map(x => <mesh key={x} position={[-.76 + x, .12, -.03]}><boxGeometry args={[.26, .05, .42]} /><meshStandardMaterial color="#0f172a" /></mesh>)}
    <mesh position={[1.28, .1, 0]}><boxGeometry args={[.34, .28, .49]} /><meshStandardMaterial color="#94a3b8" metalness={.9} /></mesh>
    <mesh position={[1.47, .1, 0]}><boxGeometry args={[.08, .17, .3]} /><meshStandardMaterial color="#0f172a" /></mesh>
    <mesh position={[1.54, .1, 0]}><boxGeometry args={[.02, .07, .13]} /><meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={1.5} /></mesh>
    <Text position={[-.22, .38, 0]} fontSize={.19} maxWidth={1.85} color="#f8fafc" outlineWidth={.011} outlineColor="#020617" anchorX="center">NIC / Ethernet</Text>
  </group>
}

function DataPulse() {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    const phase = (clock.elapsedTime * .24) % (DATA_PATH.length - 1)
    const index = Math.floor(phase)
    const t = phase - index
    const from = DATA_PATH[index]
    const to = DATA_PATH[index + 1]
    ref.current?.position.set(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t)
  })
  return <mesh ref={ref}><sphereGeometry args={[.13, 18, 18]} /><meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={3} /></mesh>
}

export function PcInteriorScene({ world, selectedId, onSelect }: { world: ExplorationWorld; selectedId: string | null; onSelect: (item: ExplorationItem) => void }) {
  const items = useMemo(() => Object.fromEntries(world.items.map(item => [item.id, item])) as Record<string, ExplorationItem>, [world.items])
  return <Canvas shadows camera={{ position: [13.5, 8.5, 21], fov: 46 }} dpr={[1, 2]}>
    <color attach="background" args={['#f8fafc']} />
    <ambientLight intensity={1.35} />
    <hemisphereLight args={['#dbeafe', '#cbd5e1', 1.35]} />
    <directionalLight castShadow position={[3, 7, 6]} intensity={2.2} shadow-mapSize={[1024, 1024]} />
    <mesh position={[0, -1.12, 0]} receiveShadow><boxGeometry args={[11.4, .24, 6.2]} /><meshStandardMaterial color="#cbd5e1" metalness={.35} roughness={.5} /></mesh>
    <mesh position={[0, -1.24, 0]} receiveShadow><boxGeometry args={[12.1, .08, 6.9]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
    <mesh position={[0, -.95, 0]}><boxGeometry args={[10.7, .07, 5.55]} /><meshStandardMaterial color="#16324a" metalness={.35} roughness={.56} /></mesh>
    <Line points={DATA_PATH} color="#22d3ee" lineWidth={1.5} transparent opacity={.75} />
    {SYSTEM_BUS.map((points, index) => <Line key={index} points={points} color="#94a3b8" lineWidth={1} transparent opacity={.6} />)}
    <FloatingLayer item={items.application} position={[-1.2, 3.05, 1.45]} selected={selectedId === 'application'} onSelect={onSelect} />
    <FloatingLayer item={items.os} position={[-1.2, 1.9, 1.45]} selected={selectedId === 'os'} onSelect={onSelect} />
    <FloatingLayer item={items.stack} position={[-1.2, .75, 1.45]} selected={selectedId === 'stack'} onSelect={onSelect} />
    <Cpu item={items.cpu} selected={selectedId === 'cpu'} onSelect={onSelect} />
    <Memory item={items.memory} selected={selectedId === 'memory'} onSelect={onSelect} />
    <Storage item={items.storage} selected={selectedId === 'storage'} onSelect={onSelect} />
    <Nic item={items.nic} selected={selectedId === 'nic'} onSelect={onSelect} />
    <DataPulse />
    <Text position={[-4.7, 2.95, -.65]} fontSize={.18} color="#0f172a" outlineWidth={.006} outlineColor="#f8fafc">ソフトウェア / 論理層</Text>
    <Text position={[-5.05, -1.4, 2.05]} fontSize={.18} color="#0f172a" outlineWidth={.006} outlineColor="#f8fafc">マザーボード / ハードウェア</Text>
    <Text position={[5.25, -.22, -1.28]} fontSize={.17} color="#0f172a" outlineWidth={.006} outlineColor="#f8fafc">LANへ</Text>
    <OrbitControls enablePan enableDamping minDistance={7} maxDistance={52} maxPolarAngle={Math.PI / 2.05} target={[0, .2, 0]} zoomToCursor />
  </Canvas>
}
