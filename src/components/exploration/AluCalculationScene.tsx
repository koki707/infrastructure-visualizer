import { Line, OrbitControls } from '@react-three/drei'
import { VisibleText as Text } from '../scene/VisibleText'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Mesh } from 'three'
import type { ExplorationItem, ExplorationWorld } from '../../types/exploration'

type Point = [number, number, number]

const CALCULATION_PATH: Point[] = [[-4.3, 1.1, .3], [-1.5, .42, .3], [1.0, .42, .3], [4.2, .42, .3]]
// Displayed from most-significant bit (left) to least-significant bit (right).
// The 1s propagate from the right-hand lower bits toward the left-hand higher bits.
const CARRY_BITS = '00111111'

function cursor(active: boolean) { document.body.style.cursor = active ? 'pointer' : 'auto' }

function BitRow({ bits, position, color, label }: { bits: string; position: Point; color: string; label: string }) {
  return <group position={position}>
    {bits.split('').map((bit, index) => <group key={index} position={[(index - 3.5) * .38, 0, 0]}>
      <mesh><boxGeometry args={[.3, .34, .1]} /><meshStandardMaterial color={bit === '1' ? color : '#334155'} emissive={bit === '1' ? color : '#334155'} emissiveIntensity={bit === '1' ? .34 : .04} /></mesh>
      <Text position={[0, 0, .13]} fontSize={.15} color={bit === '1' ? '#07111f' : '#e2e8f0'} anchorX="center">{bit}</Text>
    </group>)}
    <Text position={[-2.05, 0, .05]} fontSize={.12} color="#e2e8f0" outlineWidth={.006} outlineColor="#020617" anchorX="right">{label}</Text>
  </group>
}

function Register({ item, position, bits, decimal, selected, onSelect }: { item: ExplorationItem; position: Point; bits: string; decimal: string; selected: boolean; onSelect: (item: ExplorationItem) => void }) {
  return <group position={position} onClick={(event) => { event.stopPropagation(); onSelect(item) }} onPointerOver={() => cursor(true)} onPointerOut={() => cursor(false)}>
    <mesh scale={selected ? 1.05 : 1}><boxGeometry args={[3.55, 1.5, .42]} /><meshStandardMaterial color={item.accent} emissive={item.accent} emissiveIntensity={selected ? .44 : .16} metalness={.52} roughness={.32} /></mesh>
    <Text position={[0, .45, .24]} fontSize={.19} color="#f8fafc" outlineWidth={.009} outlineColor="#020617" anchorX="center">{item.title}</Text>
    <BitRow bits={bits} position={[0, .02, .24]} color={item.accent} label="" />
    <Text position={[0, -.56, .24]} fontSize={.17} color="#e0f2fe" outlineWidth={.007} outlineColor="#020617" anchorX="center">{decimal}</Text>
  </group>
}

function AluChip({ item, selected, onSelect }: { item: ExplorationItem; selected: boolean; onSelect: (item: ExplorationItem) => void }) {
  return <group position={[.7, .42, 0]} onClick={(event) => { event.stopPropagation(); onSelect(item) }} onPointerOver={() => cursor(true)} onPointerOut={() => cursor(false)}>
    <mesh scale={selected ? 1.08 : 1}><boxGeometry args={[3.0, 2.65, .52]} /><meshStandardMaterial color="#6b2e10" emissive="#d97706" emissiveIntensity={selected ? .48 : .2} metalness={.74} roughness={.26} /></mesh>
    <mesh position={[0, .12, .3]}><octahedronGeometry args={[.7, 0]} /><meshStandardMaterial color="#f59e0b" emissive="#fbbf24" emissiveIntensity={.45} metalness={.72} /></mesh>
    <Text position={[0, .94, .3]} fontSize={.22} color="#fff7ed" outlineWidth={.01} outlineColor="#451a03" anchorX="center">ALU · ADD</Text>
    <Text position={[0, -.73, .3]} fontSize={.16} color="#fed7aa" outlineWidth={.007} outlineColor="#451a03" anchorX="center">ビットごとの加算器</Text>
    <Text position={[0, -1.05, .3]} fontSize={.12} color="#fde68a" outlineWidth={.006} outlineColor="#451a03" anchorX="center">キャリーを次の桁へ渡す</Text>
  </group>
}

function Flags({ item, selected, onSelect }: { item: ExplorationItem; selected: boolean; onSelect: (item: ExplorationItem) => void }) {
  return <group position={[4.15, -1.35, 0]} onClick={(event) => { event.stopPropagation(); onSelect(item) }} onPointerOver={() => cursor(true)} onPointerOut={() => cursor(false)}>
    <mesh scale={selected ? 1.06 : 1}><boxGeometry args={[2.5, .72, .34]} /><meshStandardMaterial color="#6b5317" emissive="#f59e0b" emissiveIntensity={selected ? .34 : .13} metalness={.56} /></mesh>
    <Text position={[0, .06, .2]} fontSize={.14} color="#fef3c7" outlineWidth={.007} outlineColor="#451a03" anchorX="center">C=0 · Z=0 · N=0 · V=0</Text>
    <Text position={[0, -.55, .15]} fontSize={.13} color="#f8fafc" outlineWidth={.006} outlineColor="#020617" anchorX="center">演算結果の状態</Text>
  </group>
}

function MovingOperand() {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    const phase = (clock.elapsedTime * .35) % (CALCULATION_PATH.length - 1)
    const index = Math.floor(phase)
    const t = phase - index
    const from = CALCULATION_PATH[index]
    const to = CALCULATION_PATH[index + 1]
    ref.current?.position.set(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t)
  })
  return <mesh ref={ref}><sphereGeometry args={[.14, 16, 16]} /><meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={2.7} /></mesh>
}

export function AluCalculationScene({ world, selectedId, onSelect }: { world: ExplorationWorld; selectedId: string | null; onSelect: (item: ExplorationItem) => void }) {
  const items = useMemo(() => Object.fromEntries(world.items.map(item => [item.id, item])) as Record<string, ExplorationItem>, [world.items])
  return <Canvas camera={{ position: [0, 1.2, 16.5], fov: 48 }} dpr={[1, 2]}>
    <color attach="background" args={['#f8fafc']} />
    <ambientLight intensity={1.15} />
    <pointLight position={[0, 5, 6]} intensity={34} color="#fef3c7" />
    <mesh position={[0, .1, -.46]}><boxGeometry args={[11.5, 6.1, .3]} /><meshStandardMaterial color="#1f2937" metalness={.76} roughness={.3} /></mesh>
    <mesh position={[0, .1, -.25]}><boxGeometry args={[11.05, 5.65, .04]} /><meshStandardMaterial color="#243b32" emissive="#173328" emissiveIntensity={.13} /></mesh>
    <Register item={items['alu-input-a']} position={[-4.0, 1.45, 0]} bits="00101101" decimal="45 (10進数)" selected={selectedId === 'alu-input-a'} onSelect={onSelect} />
    <Register item={items['alu-input-b']} position={[-4.0, -.82, 0]} bits="00010011" decimal="19 (10進数)" selected={selectedId === 'alu-input-b'} onSelect={onSelect} />
    <AluChip item={items['alu-adder']} selected={selectedId === 'alu-adder'} onSelect={onSelect} />
    <Register item={items['alu-result']} position={[4.05, .48, 0]} bits="01000000" decimal="64 (10進数)" selected={selectedId === 'alu-result'} onSelect={onSelect} />
    <Flags item={items['alu-flags']} selected={selectedId === 'alu-flags'} onSelect={onSelect} />
    <Line points={CALCULATION_PATH} color="#fbbf24" lineWidth={1.8} transparent opacity={.85} />
    <Line points={[[-2.55, -1.85, .08], [-1.65, -1.85, .08], [-1.25, -1.55, .08], [2.2, -1.55, .08], [2.6, -1.85, .08], [4.75, -1.85, .08]]} color="#f97316" lineWidth={1.1} transparent opacity={.68} />
    <MovingOperand />
    <Text position={[-4.98, 2.82, .1]} fontSize={.22} color="#f8fafc" outlineWidth={.01} outlineColor="#020617">ADD R0, R1（教育用の8ビット例）</Text>
    <Text position={[-4.98, 2.42, .1]} fontSize={.17} color="#fef3c7" outlineWidth={.007} outlineColor="#020617">00101101 (2進数 / 45) + 00010011 (2進数 / 19) = 01000000 (2進数 / 64)</Text>
    <BitRow bits={CARRY_BITS} position={[.72, -2.48, .1]} color="#f97316" label="各桁から次の桁へのキャリー" />
    <Text position={[.72, -2.93, .1]} fontSize={.13} color="#e2e8f0" outlineWidth={.006} outlineColor="#020617" anchorX="center">最上位桁のキャリー=0：この例では8ビットからの桁あふれなし</Text>
    <OrbitControls enablePan enableDamping minDistance={7} maxDistance={46} maxPolarAngle={Math.PI / 2.05} target={[0, .1, 0]} zoomToCursor />
  </Canvas>
}
