import { useFrame } from '@react-three/fiber'
import { memo, useRef } from 'react'
import { Group, Vector3 } from 'three'
import { VisibleText as Text } from './VisibleText'
import type { NetworkNode } from '../../types/network'

export type DeviceActivity = 'incoming' | 'outgoing' | null

interface Props { node: NetworkNode; active: boolean; activity: DeviceActivity; onSelect: (node: NetworkNode) => void; onExplore: (node: NetworkNode) => void }
interface ModelProps { activity: DeviceActivity }

const dark = '#111827'
const activityColor = (activity: DeviceActivity) => activity === 'incoming' ? '#fbbf24' : '#2dd4bf'

/** Keeps primary device names readable at overview distance and hides only secondary detail. */
function DeviceLabels({ node, active }: Pick<Props, 'node' | 'active'>) {
  const labelRef = useRef<Group>(null)
  const detailRef = useRef<Group>(null)
  const positionRef = useRef(new Vector3())
  useFrame(({ camera }) => {
    const label = labelRef.current
    if (!label) return
    label.getWorldPosition(positionRef.current)
    const distance = camera.position.distanceTo(positionRef.current)
    label.scale.setScalar(Math.max(.9, Math.min(1.65, distance / 23)))
    if (detailRef.current) detailRef.current.visible = distance < 40
  })
  return <group ref={labelRef} position={[0, -1.45, 0]}>
    <Text fontSize={.35} color={active ? '#0369a1' : '#0f172a'} anchorX="center">{node.name}</Text>
    <group ref={detailRef}><Text position={[0, -.38, 0]} fontSize={.18} color="#334155" anchorX="center">{node.detail}</Text></group>
  </group>
}

function PC({ activity }: ModelProps) {
  const indicator = activityColor(activity)
  return <group>
    <mesh position={[-.2, .48, 0]} castShadow><boxGeometry args={[1.38, .9, .14]} /><meshStandardMaterial color="#334155" metalness={.65} roughness={.35} /></mesh>
    <mesh position={[-.2, .48, .08]}><boxGeometry args={[1.18, .7, .03]} /><meshStandardMaterial color="#062a3a" emissive="#0e7490" emissiveIntensity={.55} /></mesh>
    <mesh position={[-.2, .48, .105]}><planeGeometry args={[.98, .51]} /><meshBasicMaterial color="#0ea5e9" transparent opacity={.12} /></mesh>
    <mesh position={[-.2, -.15, 0]}><boxGeometry args={[.13, .42, .13]} /><meshStandardMaterial color="#475569" metalness={.7} /></mesh>
    <mesh position={[-.2, -.38, 0]}><boxGeometry args={[.72, .09, .38]} /><meshStandardMaterial color="#64748b" metalness={.6} /></mesh>
    <mesh position={[.78, -.05, .03]}><boxGeometry args={[.42, 1.12, .62]} /><meshStandardMaterial color={dark} metalness={.75} roughness={.28} /></mesh>
    <mesh position={[.78, .25, .35]}><circleGeometry args={[.07, 20]} /><meshStandardMaterial color={activity ? indicator : '#22d3ee'} emissive={activity ? indicator : '#0891b2'} emissiveIntensity={activity ? 5.5 : 1.1} /></mesh>
    {[.02, -.17].map(y => <mesh key={y} position={[.78, y, .35]}><boxGeometry args={[.2, .025, .01]} /><meshStandardMaterial color="#334155" /></mesh>)}
    <mesh position={[-.22, -.58, .52]} rotation={[-.18, 0, 0]}><boxGeometry args={[.95, .08, .38]} /><meshStandardMaterial color="#1e293b" metalness={.5} /></mesh>
    {[-.3, -.1, .1, .3].map(x => <mesh key={x} position={[x - .22, -.53, .66]} rotation={[-.18, 0, 0]}><boxGeometry args={[.1, .025, .05]} /><meshStandardMaterial color="#64748b" /></mesh>)}
  </group>
}

function HomeRouter({ activity }: ModelProps) {
  const litPort = activity === 'incoming' ? 0 : 3
  const indicator = activityColor(activity)
  return <group>
    <mesh position={[0, -.05, 0]} castShadow><boxGeometry args={[1.35, .52, .82]} /><meshStandardMaterial color="#312e81" metalness={.55} roughness={.3} /></mesh>
    <mesh position={[0, .23, .02]}><boxGeometry args={[1.22, .06, .68]} /><meshStandardMaterial color="#4c1d95" emissive="#312e81" emissiveIntensity={.5} /></mesh>
    {[-.46, .46].map(x => <group key={x} position={[x, .35, -.18]} rotation={[0, 0, x * -.32]}><mesh position={[0, .37, 0]}><cylinderGeometry args={[.025, .04, .72, 12]} /><meshStandardMaterial color="#475569" metalness={.85} /></mesh><mesh position={[0, .75, 0]}><sphereGeometry args={[.06, 12, 12]} /><meshStandardMaterial color="#94a3b8" metalness={.7} /></mesh></group>)}
    {[-.37, -.12, .13, .38].map((x, index) => <mesh key={x} position={[x, .05, .425]}><circleGeometry args={[.045, 16]} /><meshStandardMaterial color={activity && index === litPort ? indicator : '#5eead4'} emissive={activity && index === litPort ? indicator : '#14b8a6'} emissiveIntensity={activity && index === litPort ? 5.2 : .85} /></mesh>)}
    {[-.25, .03, .31].map(x => <mesh key={x} position={[x, -.2, .426]}><boxGeometry args={[.18, .12, .02]} /><meshStandardMaterial color="#0f172a" /></mesh>)}
  </group>
}

function CoreRouter({ activity }: ModelProps) {
  const ports = Array.from({ length: 12 }, (_, index) => ({ x: (index % 6) * .22 - .55, y: Math.floor(index / 6) * .22 - .12 }))
  const litPort = activity === 'incoming' ? 0 : 11
  const indicator = activityColor(activity)
  return <group>
    <mesh position={[0, -.04, 0]} castShadow><boxGeometry args={[1.72, .76, .92]} /><meshStandardMaterial color="#172033" metalness={.78} roughness={.26} /></mesh>
    <mesh position={[0, -.04, .47]}><boxGeometry args={[1.6, .63, .025]} /><meshStandardMaterial color="#020617" metalness={.8} roughness={.22} /></mesh>
    <mesh position={[-.62, .19, .5]}><boxGeometry args={[.2, .13, .018]} /><meshStandardMaterial color="#0f766e" emissive="#2dd4bf" emissiveIntensity={.45} /></mesh>
    <Text position={[-.62, .19, .58]} fontSize={.065} color="#ecfeff" anchorX="center">EDGE</Text>
    {ports.map(({ x, y }, index) => <group key={`${x}-${y}`} position={[x, y, .5]}>
      <mesh><boxGeometry args={[.13, .11, .02]} /><meshStandardMaterial color="#0f172a" metalness={.75} /></mesh>
      <mesh position={[0, .065, .012]}><circleGeometry args={[.013, 10]} /><meshStandardMaterial color={activity && index === litPort ? indicator : index % 3 === 0 ? '#a855f7' : '#34d399'} emissive={activity && index === litPort ? indicator : index % 3 === 0 ? '#9333ea' : '#059669'} emissiveIntensity={activity && index === litPort ? 5 : .75} /></mesh>
    </group>)}
    {[-.36, .36].map(x => <mesh key={x} position={[x, -.44, 0]}><boxGeometry args={[.1, .11, .75]} /><meshStandardMaterial color="#64748b" metalness={.8} /></mesh>)}
  </group>
}

function Switch({ activity }: ModelProps) {
  const litPort = activity === 'incoming' ? 0 : 3
  const indicator = activityColor(activity)
  return <group>
    <mesh position={[0, -.1, 0]} castShadow><boxGeometry args={[1.48, .48, .72]} /><meshStandardMaterial color="#1f2937" metalness={.75} roughness={.28} /></mesh>
    <mesh position={[0, .16, .03]}><boxGeometry args={[1.35, .05, .6]} /><meshStandardMaterial color="#334155" metalness={.7} /></mesh>
    {[-.48, -.16, .16, .48].map((x, index) => <group key={x}><mesh position={[x, -.12, .37]}><boxGeometry args={[.18, .13, .025]} /><meshStandardMaterial color="#020617" /></mesh><mesh position={[x, .08, .375]}><circleGeometry args={[.025, 12]} /><meshStandardMaterial color={activity && index === litPort ? indicator : index === 0 ? '#fbbf24' : '#34d399'} emissive={activity && index === litPort ? indicator : index === 0 ? '#d97706' : '#059669'} emissiveIntensity={activity && index === litPort ? 5.2 : .8} /></mesh></group>)}
    <Text position={[0, .51, 0]} fontSize={.14} color="#67e8f9" anchorX="center">SWITCH</Text>
  </group>
}

function Server({ activity }: ModelProps) {
  const indicator = activityColor(activity)
  return <group>
    <mesh position={[0, .05, 0]} castShadow><boxGeometry args={[1.15, 1.72, .78]} /><meshStandardMaterial color="#1e293b" metalness={.7} roughness={.25} /></mesh>
    <mesh position={[0, .05, .405]}><boxGeometry args={[.98, 1.55, .025]} /><meshStandardMaterial color="#0f172a" /></mesh>
    {[-.52, -.17, .18, .53].map((y, index) => <group key={y}><mesh position={[0, y, .43]}><boxGeometry args={[.86, .25, .035]} /><meshStandardMaterial color="#334155" metalness={.55} /></mesh><mesh position={[-.32, y, .455]}><boxGeometry args={[.17, .025, .01]} /><meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={index === 1 && activity ? 4.5 : .8} /></mesh><mesh position={[.3, y, .455]}><circleGeometry args={[.035, 12]} /><meshStandardMaterial color={activity && index === 1 ? indicator : index % 2 ? '#34d399' : '#fbbf24'} emissive={activity && index === 1 ? indicator : index % 2 ? '#059669' : '#d97706'} emissiveIntensity={activity && index === 1 ? 5.2 : .8} /></mesh></group>)}
    {[-.38, .38].map(x => <mesh key={x} position={[x, -.92, 0]}><boxGeometry args={[.12, .18, .55]} /><meshStandardMaterial color="#475569" metalness={.7} /></mesh>)}
  </group>
}

function DNSServer({ activity }: ModelProps) {
  const indicator = activityColor(activity)
  return <group>
    <mesh position={[0, -.05, 0]} castShadow><boxGeometry args={[1.05, 1.45, .72]} /><meshStandardMaterial color="#0f3b5b" metalness={.65} roughness={.25} /></mesh>
    {[-.43, -.08, .27].map(y => <mesh key={y} position={[0, y, .38]}><boxGeometry args={[.84, .22, .025]} /><meshStandardMaterial color="#155e75" metalness={.4} /></mesh>)}
    {[-.43, -.08, .27].map(y => <mesh key={`led-${y}`} position={[-.31, y, .405]}><circleGeometry args={[.035, 12]} /><meshStandardMaterial color={activity ? indicator : '#67e8f9'} emissive={activity ? indicator : '#06b6d4'} emissiveIntensity={activity ? 5.2 : .85} /></mesh>)}
    <mesh position={[0, .82, 0]}><sphereGeometry args={[.19, 18, 18]} /><meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={activity ? 2 : .7} /></mesh>
    <Text position={[0, .82, .2]} fontSize={.1} color="#ffffff" anchorX="center">DNS</Text>
  </group>
}

export const NodeModel = memo(function NodeModel({ node, active, activity, onSelect, onExplore }: Props) {
  const model = node.type === 'pc' ? <PC activity={activity} /> : node.type === 'switch' ? <Switch activity={activity} /> : node.type === 'dns' ? <DNSServer activity={activity} /> : node.type === 'server' ? <Server activity={activity} /> : node.id === 'home-router' ? <HomeRouter activity={activity} /> : <CoreRouter activity={activity} />
  const reactionColor = activityColor(activity)
  return <group position={node.position} onClick={(event) => { event.stopPropagation(); onSelect(node) }} onDoubleClick={(event) => { event.stopPropagation(); onExplore(node) }} onPointerOver={() => { document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
    {active && <mesh position={[0, -.82, -.1]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.08, 1.17, 48]} /><meshBasicMaterial color="#67e8f9" transparent opacity={.9} depthWrite={false} /></mesh>}
    {activity && <mesh position={[0, -.79, -.11]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.22, 1.27, 48]} /><meshBasicMaterial color={reactionColor} transparent opacity={.8} depthWrite={false} /></mesh>}
    {model}
    <DeviceLabels node={node} active={active} />
  </group>
})
