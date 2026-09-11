import { Line, OrbitControls } from '@react-three/drei'
import { VisibleText as Text } from '../scene/VisibleText'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import type { ExplorationItem, ExplorationWorld } from '../../types/exploration'
import { ProtocolUnit, type PacketUnitKind } from './ProtocolUnit'

type Point = [number, number, number]

const LAYER_POSITIONS: Array<{ id: string; position: Point; color: string; subtitle: string }> = [
  { id: 'app-layer', position: [0, 2.55, 0], color: '#38bdf8', subtitle: 'Application Data' },
  { id: 'transport', position: [0, 1.35, 0], color: '#818cf8', subtitle: '+ TCP Header' },
  { id: 'network', position: [0, .15, 0], color: '#fbbf24', subtitle: '+ IP Header' },
  { id: 'ethernet', position: [0, -1.05, 0], color: '#2dd4bf', subtitle: '+ Ethernet Header / FCS' },
  { id: 'physical', position: [0, -2.25, 0], color: '#34d399', subtitle: '信号として送出' },
]
const PACKET_PATH: Point[] = LAYER_POSITIONS.map(layer => [0, layer.position[1], .55])

function Part({ item, position, color, subtitle, selected, onSelect }: { item: ExplorationItem; position: Point; color: string; subtitle: string; selected: boolean; onSelect: (item: ExplorationItem) => void }) {
  return <group position={position} onClick={(event) => { event.stopPropagation(); onSelect(item) }} onPointerOver={() => { document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
    <mesh scale={selected ? 1.06 : 1}><boxGeometry args={[5.25, .78, .28]} /><meshStandardMaterial color="#ffffff" emissive={selected ? color : '#ffffff'} emissiveIntensity={selected ? .18 : .03} roughness={.78} /></mesh>
    <mesh position={[-2.53, 0, .02]} scale={selected ? 1.06 : 1}><boxGeometry args={[.12, .63, .31]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.18} /></mesh>
    <Text position={[-2.3, .03, .2]} fontSize={.2} color="#0f172a" outlineWidth={.006} outlineColor="#ffffff">{item.title}</Text>
    <Text position={[2.15, .03, .2]} fontSize={.16} color="#334155" outlineWidth={.005} outlineColor="#ffffff" anchorX="right">{subtitle}</Text>
  </group>
}

const PACKET_FORMS: PacketUnitKind[] = ['data', 'segment', 'packet', 'frame']

function EncapsulationPacket() {
  const ref = useRef<Group>(null)
  useFrame(({ clock }) => {
    const phase = (clock.elapsedTime * .5) % (PACKET_PATH.length - 1)
    const index = Math.floor(phase)
    const progress = phase - index
    const from = PACKET_PATH[index]
    const to = PACKET_PATH[index + 1]
    ref.current?.position.set(from[0] + (to[0] - from[0]) * progress, from[1] + (to[1] - from[1]) * progress, from[2])
    ref.current?.scale.setScalar(.86 + index * .045)
    ref.current?.children.forEach((child, childIndex) => { child.visible = childIndex === Math.min(index, PACKET_FORMS.length - 1) })
  })
  return <group ref={ref}>{PACKET_FORMS.map((kind, index) => <group key={kind} visible={index === 0}><ProtocolUnit kind={kind} position={[0, 0, .86]} /></group>)}</group>
}

export function NetworkStackScene({ world, selectedId, onSelect }: { world: ExplorationWorld; selectedId: string | null; onSelect: (item: ExplorationItem) => void }) {
  const items = useMemo(() => Object.fromEntries(world.items.map(item => [item.id, item])) as Record<string, ExplorationItem>, [world.items])
  return <Canvas camera={{ position: [0, .15, 16.5], fov: 47 }} dpr={[1, 2]}>
    <color attach="background" args={['#f8fafc']} />
    <ambientLight intensity={1.4} />
    <pointLight position={[2, 4, 6]} intensity={30} color="#7dd3fc" />
    <Line points={PACKET_PATH} color="#94a3b8" lineWidth={1.3} transparent opacity={.58} />
    {LAYER_POSITIONS.map(layer => <Part key={layer.id} item={items[layer.id]} position={layer.position} color={layer.color} subtitle={layer.subtitle} selected={selectedId === layer.id} onSelect={onSelect} />)}
    <EncapsulationPacket />
    <Text position={[-3.1, 3.35, .2]} fontSize={.2} color="#0f172a" outlineWidth={.006} outlineColor="#f8fafc">送信側：下へ進むごとに外側の制御情報を付加</Text>
    <Text position={[3.18, -2.25, .2]} fontSize={.16} color="#047857" outlineWidth={.005} outlineColor="#f8fafc">NIC → LAN</Text>
    <OrbitControls enablePan enableDamping minDistance={7} maxDistance={46} maxPolarAngle={Math.PI / 2.05} target={[0, .1, 0]} zoomToCursor />
  </Canvas>
}
