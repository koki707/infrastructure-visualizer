import { Line, OrbitControls } from '@react-three/drei'
import { VisibleText as Text } from '../scene/VisibleText'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, type ReactNode } from 'react'
import type { Mesh } from 'three'
import type { ExplorationItem, ExplorationWorld } from '../../types/exploration'

type Point = [number, number, number]

const CPU_PATH: Point[] = [[-4.6, 1.5, 0], [-2.65, 1.5, 0], [-.65, 1.5, 0], [1.2, 1.5, 0], [1.2, -.45, 0], [3.15, -.45, 0], [4.85, -1.4, 0]]
const MEMORY_PATH: Point[] = [[-4.8, 1.4, 0], [-2.85, 1.4, 0], [-.45, .3, 0], [2.15, .3, 0], [4.55, 1.5, 0]]

function cursor(enabled: boolean) { document.body.style.cursor = enabled ? 'pointer' : 'auto' }

function itemMap(world: ExplorationWorld) { return Object.fromEntries(world.items.map(item => [item.id, item])) as Record<string, ExplorationItem> }

function ClickTarget({ item, position, selected, children, onSelect }: { item: ExplorationItem; position: Point; selected: boolean; children: ReactNode; onSelect: (item: ExplorationItem) => void }) {
  return <group position={position} onClick={(event) => { event.stopPropagation(); onSelect(item) }} onPointerOver={() => cursor(true)} onPointerOut={() => cursor(false)}>
    {children}
    {selected && <mesh position={[0, 0, -.26]}><boxGeometry args={[1.95, 1.18, .03]} /><meshBasicMaterial color="#22d3ee" transparent opacity={.18} /></mesh>}
    <Text position={[0, -.91, .18]} fontSize={.19} color="#f8fafc" outlineWidth={.012} outlineColor="#020617" anchorX="center" maxWidth={2.35}>{item.title}</Text>
    <Text position={[0, -.66, .18]} fontSize={.14} color="#dbeafe" outlineWidth={.008} outlineColor="#020617" anchorX="center" maxWidth={2.35}>{item.subtitle}</Text>
  </group>
}

function MovingBit({ points, color }: { points: Point[]; color: string }) {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    const phase = (clock.elapsedTime * .48) % (points.length - 1)
    const index = Math.floor(phase)
    const t = phase - index
    const from = points[index]
    const to = points[index + 1]
    ref.current?.position.set(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t)
  })
  return <mesh ref={ref}><sphereGeometry args={[.14, 16, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.7} /></mesh>
}

function CpuBlocks({ world, selectedId, onSelect }: { world: ExplorationWorld; selectedId: string | null; onSelect: (item: ExplorationItem) => void }) {
  const items = useMemo(() => itemMap(world), [world])
  return <>
    <mesh position={[0, .05, -.45]}><boxGeometry args={[11.2, 5.45, .3]} /><meshStandardMaterial color="#1f2937" metalness={.78} roughness={.3} /></mesh>
    <mesh position={[0, .05, -.25]}><boxGeometry args={[10.75, 5.05, .05]} /><meshStandardMaterial color="#244334" emissive="#173328" emissiveIntensity={.13} metalness={.25} roughness={.52} /></mesh>
    <ClickTarget item={items['instruction-cache']} position={[-4.6, 1.5, 0]} selected={selectedId === 'instruction-cache'} onSelect={onSelect}><mesh><boxGeometry args={[1.45, .86, .3]} /><meshStandardMaterial color="#475569" emissive="#64748b" emissiveIntensity={.14} metalness={.72} /></mesh><Text position={[0, .05, .19]} fontSize={.15} color="white" outlineWidth={.007} outlineColor="#020617" anchorX="center">L1 I-Cache</Text></ClickTarget>
    <ClickTarget item={items.fetch} position={[-2.65, 1.5, 0]} selected={selectedId === 'fetch'} onSelect={onSelect}><mesh><boxGeometry args={[1.45, .86, .3]} /><meshStandardMaterial color="#3f4e46" emissive="#5f6f64" emissiveIntensity={.11} metalness={.62} /></mesh><Text position={[0, .05, .19]} fontSize={.17} color="white" outlineWidth={.007} outlineColor="#020617" anchorX="center">FETCH</Text></ClickTarget>
    <ClickTarget item={items.decode} position={[-.65, 1.5, 0]} selected={selectedId === 'decode'} onSelect={onSelect}><mesh><boxGeometry args={[1.45, .86, .3]} /><meshStandardMaterial color="#4b5563" emissive="#6b7280" emissiveIntensity={.12} metalness={.68} /></mesh><Text position={[0, .05, .19]} fontSize={.16} color="white" outlineWidth={.007} outlineColor="#020617" anchorX="center">DECODE</Text></ClickTarget>
    <ClickTarget item={items.registers} position={[1.2, 1.5, 0]} selected={selectedId === 'registers'} onSelect={onSelect}>{[-.35, 0, .35].map(x => <mesh key={x} position={[x, 0, 0]}><boxGeometry args={[.22, .96, .32]} /><meshStandardMaterial color="#a16207" emissive="#d4a72c" emissiveIntensity={.16} metalness={.85} /></mesh>)}<Text position={[0, .04, .2]} fontSize={.13} color="#fff7ed" outlineWidth={.007} outlineColor="#020617" anchorX="center">R0 R1 R2</Text></ClickTarget>
    <ClickTarget item={items['control-unit']} position={[-.55, -.55, 0]} selected={selectedId === 'control-unit'} onSelect={onSelect}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.67, .67, .34, 6]} /><meshStandardMaterial color="#52525b" emissive="#71717a" emissiveIntensity={.13} metalness={.78} /></mesh><Text position={[0, .04, .22]} fontSize={.13} color="white" outlineWidth={.007} outlineColor="#020617" anchorX="center">CONTROL</Text></ClickTarget>
    <ClickTarget item={items.alu} position={[3.15, -.45, 0]} selected={selectedId === 'alu'} onSelect={onSelect}><mesh><octahedronGeometry args={[.85, 0]} /><meshStandardMaterial color="#b45309" emissive="#c47a2c" emissiveIntensity={.16} metalness={.85} /></mesh><Text position={[0, .03, .73]} fontSize={.17} color="#fef3c7" outlineWidth={.008} outlineColor="#451a03" anchorX="center">ALU</Text></ClickTarget>
    <ClickTarget item={items['memory-bus']} position={[4.85, -1.4, 0]} selected={selectedId === 'memory-bus'} onSelect={onSelect}><mesh><boxGeometry args={[1.55, .55, .3]} /><meshStandardMaterial color="#475569" emissive="#64748b" emissiveIntensity={.12} metalness={.7} /></mesh><Text position={[0, .03, .19]} fontSize={.13} color="white" outlineWidth={.007} outlineColor="#020617" anchorX="center">MEMORY BUS</Text><Text position={[.98, .03, .19]} fontSize={.14} color="#fde68a" outlineWidth={.005} outlineColor="#020617">›</Text></ClickTarget>
    <Line points={CPU_PATH} color="#f5c56c" lineWidth={1.8} transparent opacity={.86} />
    <Line points={[[-.65, 1.5, 0], [-.55, -.55, 0]]} color="#86efac" lineWidth={1.2} transparent opacity={.68} />
    <Line points={[[1.2, 1.5, 0], [3.15, -.45, 0]]} color="#eab66e" lineWidth={1.2} transparent opacity={.76} />
    <Line points={[[-5.05, -1.92, -.08], [-3.6, -1.92, -.08], [-3.1, -2.3, -.08], [2.45, -2.3, -.08], [3.05, -1.82, -.08]]} color="#b87333" lineWidth={.8} transparent opacity={.65} />
    <MovingBit points={CPU_PATH} color="#fbbf24" />
    <Text position={[-4.72, 2.72, .1]} fontSize={.19} color="#f8fafc" outlineWidth={.009} outlineColor="#020617">命令実行サイクル（簡略）</Text>
    <Text position={[-4.72, 2.38, .1]} fontSize={.16} color="#fef3c7" outlineWidth={.007} outlineColor="#020617">例：LOAD R1, [0x0042]</Text>
  </>
}

function MemoryBlocks({ world, selectedId, onSelect }: { world: ExplorationWorld; selectedId: string | null; onSelect: (item: ExplorationItem) => void }) {
  const items = useMemo(() => itemMap(world), [world])
  return <>
    <mesh position={[0, .12, -.48]}><boxGeometry args={[11.1, 5.4, .26]} /><meshStandardMaterial color="#172554" metalness={.55} roughness={.36} /></mesh>
    <ClickTarget item={items.address} position={[-4.8, 1.4, 0]} selected={selectedId === 'address'} onSelect={onSelect}><mesh><boxGeometry args={[1.55, .72, .3]} /><meshStandardMaterial color="#0369a1" emissive="#0ea5e9" emissiveIntensity={.25} /></mesh><Text position={[0, .03, .19]} fontSize={.13} color="white" anchorX="center">0x0042</Text></ClickTarget>
    <ClickTarget item={items['address-decoder']} position={[-2.85, 1.4, 0]} selected={selectedId === 'address-decoder'} onSelect={onSelect}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.62, .62, .34, 6]} /><meshStandardMaterial color="#0f766e" emissive="#2dd4bf" emissiveIntensity={.25} /></mesh><Text position={[0, .02, .22]} fontSize={.12} color="white" anchorX="center">DECODE</Text></ClickTarget>
    <ClickTarget item={items['memory-cells']} position={[-.05, .15, 0]} selected={selectedId === 'memory-cells'} onSelect={onSelect}><mesh><boxGeometry args={[3.45, 2.75, .24]} /><meshStandardMaterial color="#312e81" emissive="#3730a3" emissiveIntensity={.16} /></mesh>{Array.from({ length: 24 }, (_, index) => { const x = ((index % 6) - 2.5) * .48; const y = (1.5 - Math.floor(index / 6)) * .5; const active = index === 14; return <mesh key={index} position={[x, y, .18]}><boxGeometry args={[.31, .31, .04]} /><meshStandardMaterial color={active ? '#fbbf24' : '#a5b4fc'} emissive={active ? '#f59e0b' : '#818cf8'} emissiveIntensity={active ? .7 : .15} /></mesh> })}<Text position={[0, -1.72, .18]} fontSize={.14} color="#e0e7ff" anchorX="center">選択されたセル：0x0042</Text></ClickTarget>
    <ClickTarget item={items['data-bus']} position={[2.15, .3, 0]} selected={selectedId === 'data-bus'} onSelect={onSelect}><mesh><boxGeometry args={[1.1, 2.2, .3]} /><meshStandardMaterial color="#b45309" emissive="#f59e0b" emissiveIntensity={.22} /></mesh>{[-.65, -.2, .25, .7].map(y => <Text key={y} position={[0, y, .2]} fontSize={.12} color="#fff7ed" anchorX="center">1010 0110</Text>)}</ClickTarget>
    <ClickTarget item={items.read} position={[4.55, 1.5, 0]} selected={selectedId === 'read'} onSelect={onSelect}><mesh><boxGeometry args={[1.35, .68, .3]} /><meshStandardMaterial color="#047857" emissive="#34d399" emissiveIntensity={.26} /></mesh><Text position={[0, .02, .19]} fontSize={.14} color="white" anchorX="center">READ -&gt; CPU</Text></ClickTarget>
    <ClickTarget item={items.write} position={[4.55, -1.4, 0]} selected={selectedId === 'write'} onSelect={onSelect}><mesh><boxGeometry args={[1.35, .68, .3]} /><meshStandardMaterial color="#be185d" emissive="#fb7185" emissiveIntensity={.24} /></mesh><Text position={[0, .02, .19]} fontSize={.14} color="white" anchorX="center">WRITE &lt;- CPU</Text></ClickTarget>
    <Line points={MEMORY_PATH} color="#67e8f9" lineWidth={1.8} transparent opacity={.8} />
    <Line points={[[2.15, .3, 0], [4.55, -1.4, 0]]} color="#fda4af" lineWidth={1.3} transparent opacity={.75} />
    <MovingBit points={MEMORY_PATH} color="#fbbf24" />
    <Text position={[-4.9, 2.66, .1]} fontSize={.19} color="#f8fafc" outlineWidth={.009} outlineColor="#020617">アドレス指定とデータの流れ（簡略）</Text>
    <Text position={[-4.9, 2.32, .1]} fontSize={.16} color="#dbeafe" outlineWidth={.007} outlineColor="#020617">CPUが「場所」を指定し、値を読み書きする</Text>
  </>
}

export function HardwareDetailScene({ world, selectedId, onSelect }: { world: ExplorationWorld; selectedId: string | null; onSelect: (item: ExplorationItem) => void }) {
  const isCpu = world.id === 'cpu'
  return <Canvas camera={{ position: [0, 1.2, 16.5], fov: 48 }} dpr={[1, 2]}>
    <color attach="background" args={['#f8fafc']} />
    <ambientLight intensity={1.35} />
    <pointLight position={[0, 5, 6]} intensity={30} color={isCpu ? '#fef3c7' : '#c4b5fd'} />
    {isCpu ? <CpuBlocks world={world} selectedId={selectedId} onSelect={onSelect} /> : <MemoryBlocks world={world} selectedId={selectedId} onSelect={onSelect} />}
    <OrbitControls enablePan enableDamping minDistance={7} maxDistance={46} maxPolarAngle={Math.PI / 2.05} target={[0, .1, 0]} zoomToCursor />
  </Canvas>
}
