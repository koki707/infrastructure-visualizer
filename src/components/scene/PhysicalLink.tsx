import { Line } from '@react-three/drei'
import { VisibleText as Text } from './VisibleText'
import { useFrame } from '@react-three/fiber'
import { memo, useMemo, useRef } from 'react'
import { CatmullRomCurve3, TubeGeometry, Vector3, type Mesh } from 'three'
import { connectionPoints } from '../../data/network'
import type { Connection } from '../../types/network'

const MEDIUM_STYLE = {
  ethernet: { cable: '#1e3a8a', signal: '#38bdf8', label: '#075985', radius: .052 },
  fiber: { cable: '#475569', signal: '#c084fc', label: '#6d28d9', radius: .046 },
  'backbone-fiber': { cable: '#334155', signal: '#f59e0b', label: '#92400e', radius: .058 },
  wireless: { cable: '#0ea5e9', signal: '#67e8f9', label: '#075985', radius: .02 },
} as const

function SignalDots({ curve, color, count = 3 }: { curve: CatmullRomCurve3; color: string; count?: number }) {
  const refs = useRef<Array<Mesh | null>>([])
  useFrame(({ clock }) => {
    refs.current.forEach((mesh, index) => {
      const point = curve.getPointAt((clock.elapsedTime * .07 + index / count) % 1)
      mesh?.position.copy(point)
    })
  })
  return <>{Array.from({ length: count }, (_, index) => <mesh key={index} ref={node => { refs.current[index] = node }}><sphereGeometry args={[.055, 12, 12]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.1} /></mesh>)}</>
}

export const PhysicalLink = memo(function PhysicalLink({ connection, active }: { connection: Connection; active: boolean }) {
  const points = useMemo(() => connectionPoints(connection.from, connection.to), [connection])
  const curve = useMemo(() => new CatmullRomCurve3(points.map(point => new Vector3(...point)), false, 'centripetal'), [points])
  const style = MEDIUM_STYLE[connection.medium]
  const tubeGeometry = useMemo(() => new TubeGeometry(curve, 72, style.radius, 8, false), [curve, style.radius])
  const labelPosition = curve.getPoint(.5)
  return <group>
    <mesh geometry={tubeGeometry} castShadow>
      <meshStandardMaterial color={style.cable} emissive={active ? style.signal : '#000000'} emissiveIntensity={active ? .5 : 0} metalness={connection.medium === 'ethernet' ? .35 : .7} roughness={.34} />
    </mesh>
    {active && <><Line points={points} color={style.signal} lineWidth={2.4} transparent opacity={.82} /><SignalDots curve={curve} color={style.signal} count={connection.medium === 'ethernet' ? 2 : 4} /></>}
    <Text position={[labelPosition.x, labelPosition.y + .38, labelPosition.z]} fontSize={.15} color={style.label} outlineWidth={.006} outlineColor="#f8fafc" anchorX="center" maxWidth={3.2}>{connection.label}</Text>
    <Text position={[labelPosition.x, labelPosition.y + .17, labelPosition.z]} fontSize={.11} color="#475569" outlineWidth={.005} outlineColor="#f8fafc" anchorX="center">{connection.medium === 'ethernet' ? '銅線・電気信号' : '光パルス・光ファイバ'}</Text>
  </group>
})
