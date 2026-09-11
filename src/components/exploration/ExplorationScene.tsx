import { OrbitControls } from '@react-three/drei'
import { VisibleText as Text } from '../scene/VisibleText'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'
import type { ExplorationItem, ExplorationWorld } from '../../types/exploration'
import { AluCalculationScene } from './AluCalculationScene'
import { DeviceInteriorScene } from './DeviceInteriorScene'
import { HardwareDetailScene } from './HardwareDetailScene'
import { NetworkStackScene } from './NetworkStackScene'
import { PcInteriorScene } from './PcInteriorScene'

type Position = [number, number, number]

const PC_LAYOUT: Record<string, Position> = {
  application: [0, 2.15, 0], os: [0, .75, 0], stack: [0, -.7, 0], nic: [0, -2.15, 0],
  cpu: [-3.05, 1.05, -.45], memory: [-3.05, -.9, -.45], storage: [3.05, .05, -.45],
}

function positionFor(world: ExplorationWorld, item: ExplorationItem, index: number): Position {
  if (world.id === 'pc') return PC_LAYOUT[item.id] ?? [0, 0, 0]
  if (world.id === 'stack') return [0, 2.3 - index * 1.18, 0]
  if (['frame', 'header', 'tcp', 'ip', 'appdata', 'bits'].includes(world.id)) return [(index - (world.items.length - 1) / 2) * 2, .1, 0]
  return [((index % 4) - 1.5) * 2.35, index < 4 ? .7 : -1.9, 0]
}

function Concept({ world, item, index, selected, onSelect }: { world: ExplorationWorld; item: ExplorationItem; index: number; selected: boolean; onSelect: (item: ExplorationItem) => void }) {
  const ref = useRef<Mesh>(null)
  const basePosition = positionFor(world, item, index)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.elapsedTime * .7 + index) * .05
  })
  return <group position={basePosition} onClick={(event) => { event.stopPropagation(); onSelect(item) }} onPointerOver={() => { document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
    <mesh ref={ref} scale={selected ? 1.12 : 1}>
      <boxGeometry args={[1.55, .82, .52]} />
      <meshStandardMaterial color={item.accent} emissive={item.accent} emissiveIntensity={selected || item.next ? .42 : .14} />
    </mesh>
    <Text position={[0, -.03, .31]} fontSize={.2} color="#07111f" outlineWidth={.006} outlineColor="#f8fafc" anchorX="center" maxWidth={1.35}>{item.title}</Text>
    <Text position={[0, -.67, 0]} fontSize={.15} color="#0f172a" outlineWidth={.005} outlineColor="#f8fafc" anchorX="center" maxWidth={1.9}>{item.subtitle}</Text>
    {item.next && <Text position={[0, .64, 0]} fontSize={.14} color="#0369a1" outlineWidth={.004} outlineColor="#f8fafc" anchorX="center">クリックして開く</Text>}
  </group>
}

function EncapsulationShell({ visible }: { visible: boolean }) {
  if (!visible) return null
  return <group position={[0, -.55, -1.2]} rotation={[-.12, .12, 0]}>
    <mesh renderOrder={0}><boxGeometry args={[10.6, 2.45, .12]} /><meshStandardMaterial color="#2dd4bf" transparent opacity={.12} depthWrite={false} /></mesh>
    <mesh position={[0, 0, .22]} renderOrder={1}><boxGeometry args={[7.7, 1.78, .12]} /><meshStandardMaterial color="#818cf8" transparent opacity={.16} depthWrite={false} /></mesh>
    <mesh position={[0, 0, .44]} renderOrder={2}><boxGeometry args={[4.7, 1.08, .12]} /><meshStandardMaterial color="#38bdf8" transparent opacity={.2} depthWrite={false} /></mesh>
    <Text position={[-4.55, .86, .12]} fontSize={.14} color="#0f766e">Ethernet</Text>
    <Text position={[-3.15, .54, .35]} fontSize={.14} color="#4338ca">IP</Text>
    <Text position={[-1.75, .24, .58]} fontSize={.14} color="#0369a1">TCP</Text>
  </group>
}

export function ExplorationScene({ world, selectedId, onSelect }: { world: ExplorationWorld; selectedId: string | null; onSelect: (item: ExplorationItem) => void }) {
  if (world.id === 'pc') return <PcInteriorScene world={world} selectedId={selectedId} onSelect={onSelect} />
  if (world.id === 'stack') return <NetworkStackScene world={world} selectedId={selectedId} onSelect={onSelect} />
  if (world.id === 'alu') return <AluCalculationScene world={world} selectedId={selectedId} onSelect={onSelect} />
  if (world.id === 'cpu' || world.id === 'memory') return <HardwareDetailScene world={world} selectedId={selectedId} onSelect={onSelect} />
  if (world.id === 'switch' || world.id === 'dns' || world.id === 'router' || world.id === 'server') return <DeviceInteriorScene world={world} selectedId={selectedId} onSelect={onSelect} />
  const isDataStructure = ['frame', 'header', 'tcp', 'ip'].includes(world.id)
  return <Canvas camera={{ position: [0, 1.2, 16], fov: 50 }} dpr={[1, 2]}>
    <color attach="background" args={['#f8fafc']} />
    <ambientLight intensity={1.45} />
    <pointLight position={[0, 5, 6]} intensity={38} color="#7dd3fc" />
    <gridHelper args={[16, 16, '#bfdbfe', '#e2e8f0']} position={[0, -3.25, 0]} />
    <EncapsulationShell visible={isDataStructure} />
    {world.items.map((item, index) => <Concept key={item.id} world={world} item={item} index={index} selected={item.id === selectedId} onSelect={onSelect} />)}
    <OrbitControls enablePan enableDamping minDistance={6} maxDistance={48} maxPolarAngle={Math.PI / 2.05} zoomToCursor />
  </Canvas>
}
