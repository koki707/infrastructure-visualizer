import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { CatmullRomCurve3, Group, Vector3 } from 'three'
import { connectionPoints, NETWORK_NODES } from '../../data/network'
import type { Position } from '../../types/network'
import type { PacketJourney } from '../../types/request'
import { VisibleText as Text } from './VisibleText'

export function DataPacket({ journey, paused = false }: { journey: PacketJourney; paused?: boolean }) {
  const ref = useRef<Group>(null)
  useFrame((_, delta) => {
    if (ref.current && !paused) ref.current.rotation.y += delta * 2.4
  })
  const safeProgress = Math.max(0, Math.min(journey.progress, 1))
  const pathKey = journey.nodePath.join('|')
  const curve = useMemo(() => {
    const fallbackPosition = NETWORK_NODES.find(node => node.id === journey.nodePath[0])?.position ?? NETWORK_NODES[0].position
    const points: Position[] = journey.nodePath.flatMap((id, index) => {
      if (index < journey.nodePath.length - 1) return connectionPoints(id, journey.nodePath[index + 1]).slice(0, -1)
      return [NETWORK_NODES.find(node => node.id === id)?.position ?? fallbackPosition]
    })
    const vectors = points.map(point => new Vector3(...point))
    return new CatmullRomCurve3(vectors.length > 1 ? vectors : [new Vector3(...fallbackPosition), new Vector3(...fallbackPosition)])
  // The route is immutable for one request stage; only the progress changes each frame.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathKey])
  const point = curve.getPointAt(safeProgress)
  const position: [number, number, number] = [point.x, point.y + .25 + Math.sin(safeProgress * Math.PI) * .16, point.z + .18]
  return <group ref={ref} position={position}>
    {/* Nested wireframes are a compact cue that this is an encapsulated unit, not a raw bit. */}
    <mesh scale={[1.25, .95, .7]} rotation={[.3, .15, 0]}><boxGeometry args={[.43, .43, .43]} /><meshBasicMaterial color="#2dd4bf" wireframe /></mesh>
    <mesh scale={[.95, .72, .48]} rotation={[.3, .15, 0]}><boxGeometry args={[.43, .43, .43]} /><meshBasicMaterial color="#38bdf8" wireframe /></mesh>
    <mesh scale={[.65, .5, .28]} rotation={[.3, .15, 0]}><boxGeometry args={[.43, .43, .43]} /><meshBasicMaterial color="#818cf8" wireframe /></mesh>
    <mesh><icosahedronGeometry args={[.24, 2]} /><meshStandardMaterial color="#fef08a" emissive="#facc15" emissiveIntensity={3} /></mesh>
    <Text position={[0, .52, 0]} fontSize={.17} color="#713f12" outlineWidth={.008} outlineColor="#fefce8" anchorX="center">{journey.label}</Text>
    <Text position={[0, -.48, 0]} fontSize={.09} color="#0f766e" outlineWidth={.006} outlineColor="#f0fdfa" anchorX="center">Ethernet · IP · TCP</Text>
  </group>
}
