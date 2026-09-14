import { Line, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useMemo } from 'react'
import { CONNECTIONS, NETWORK_NODES } from '../../data/network'
import type { NetworkNode } from '../../types/network'
import type { PacketJourney } from '../../types/request'
import { DataPacket } from './DataPacket'
import { NodeModel, type DeviceActivity } from './NodeModel'
import { PhysicalLink } from './PhysicalLink'
import { VisibleText as Text } from './VisibleText'

interface Props { selectedId: string; journey: PacketJourney | null; onSelect: (node: NetworkNode) => void; onExploreNode: (node: NetworkNode) => void }
interface RegionProps { title: string; subtitle: string; position: [number, number, number]; size: [number, number]; color: string; active: boolean }
type RegionId = 'home' | 'dns' | 'isp' | 'internet' | 'server'

const regionForNode = (nodeId: string): RegionId => {
  if (nodeId === 'pc' || nodeId === 'switch' || nodeId === 'home-router') return 'home'
  if (nodeId === 'dns-server') return 'dns'
  if (nodeId === 'isp-router') return 'isp'
  if (nodeId === 'internet-router') return 'internet'
  return 'server'
}

const connectionKey = (from: string, to: string) => [from, to].sort().join('|')

function Region({ title, subtitle, position, size, color, active }: RegionProps) {
  return <group position={position}>
    <mesh position={[0, -.95, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow renderOrder={-2}><planeGeometry args={size} /><meshStandardMaterial color={color} transparent opacity={active ? .37 : .2} depthWrite={false} roughness={.8} /></mesh>
    <mesh position={[0, -.99, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}><ringGeometry args={[Math.min(...size) * .22, Math.max(...size) * .64, 4]} /><meshBasicMaterial color={active ? '#0e7490' : color} transparent opacity={active ? .9 : .42} depthWrite={false} /></mesh>
    <Text position={[0, -.88, -size[1] / 2 - .35]} rotation={[-Math.PI / 2, 0, 0]} fontSize={.32} color={active ? '#075985' : '#0f4c5c'} anchorX="center">{title}</Text>
    <Text position={[0, -.88, -size[1] / 2 - .7]} rotation={[-Math.PI / 2, 0, 0]} fontSize={.16} color="#475569" anchorX="center">{subtitle}</Text>
  </group>
}

function DataCenterRacks() {
  return <group position={[9.75, 2.3, -2.1]}>{[-.55, .55].map(x => <group key={x} position={[x, 0, 0]}><mesh><boxGeometry args={[.45, 1.1, .5]} /><meshStandardMaterial color="#334155" metalness={.7} roughness={.3} /></mesh>{[-.27, .05, .34].map(y => <mesh key={y} position={[0, y, .26]}><boxGeometry args={[.27, .035, .02]} /><meshStandardMaterial color="#67e8f9" emissive="#0891b2" emissiveIntensity={1.2} /></mesh>)}</group>)}</group>
}

function HomeEnvironment() {
  return <group position={[-6, -3.55, .5]}>
    <mesh position={[0, 0, 0]} receiveShadow><boxGeometry args={[7.7, .12, 5.8]} /><meshStandardMaterial color="#e0f2fe" roughness={.85} /></mesh>
    <mesh position={[0, 1.35, -.15]} renderOrder={-1}><boxGeometry args={[7.45, 2.65, .08]} /><meshBasicMaterial color="#7dd3fc" wireframe transparent opacity={.26} depthWrite={false} /></mesh>
    <Line points={[[-3.78, 0, -2.82], [-3.78, 2.7, -2.82], [0, 4.1, -2.82], [3.78, 2.7, -2.82], [3.78, 0, -2.82]]} color="#7dd3fc" lineWidth={1.2} transparent opacity={.62} />
    <Text position={[0, .25, -2.95]} fontSize={.18} color="#0369a1" anchorX="center">家庭内ネットワーク</Text>
  </group>
}

function FiberTerminal() {
  return <group position={[-.85, -2.55, -.15]}>
    <mesh><boxGeometry args={[.5, .72, .38]} /><meshStandardMaterial color="#f8fafc" metalness={.35} roughness={.4} /></mesh>
    <mesh position={[0, .12, .205]}><boxGeometry args={[.31, .16, .015]} /><meshStandardMaterial color="#1e293b" /></mesh>
    <mesh position={[-.08, .12, .222]}><circleGeometry args={[.025, 12]} /><meshStandardMaterial color="#a855f7" emissive="#9333ea" emissiveIntensity={2} /></mesh>
    <Text position={[0, -.55, .1]} fontSize={.13} color="#475569" outlineWidth={.005} outlineColor="#f8fafc" anchorX="center">ONU / ONT</Text>
  </group>
}

function WirelessCoverage() {
  const origin: [number, number, number] = [-2.7, .45, -.2]
  return <group>{[.7, 1.05, 1.4].map(radius => {
    const points: [number, number, number][] = Array.from({ length: 18 }, (_, index) => {
      const angle = Math.PI * (index / 17)
      return [origin[0] + Math.cos(angle) * radius, origin[1] + Math.sin(angle) * radius, origin[2] - .35]
    })
    return <Line key={radius} points={points} color="#38bdf8" lineWidth={1.2} transparent opacity={.45} />
  })}<Text position={[-2.7, 1.95, -.55]} fontSize={.13} color="#0369a1" outlineWidth={.005} outlineColor="#f8fafc" anchorX="center">Wi-Fi（宅内で選べる無線接続）</Text></group>
}

function ProviderFacility() {
  return <group position={[1.55, -2.92, .35]}>
    <mesh><boxGeometry args={[3.25, .14, 2.3]} /><meshStandardMaterial color="#dcfce7" roughness={.86} /></mesh>
    {[-.9, -.3, .3, .9].map(x => <mesh key={x} position={[x, .25, -.65]}><boxGeometry args={[.36, .52, .25]} /><meshStandardMaterial color="#334155" metalness={.66} roughness={.3} /></mesh>)}
    <Text position={[0, .13, -1.25]} fontSize={.16} color="#047857" anchorX="center">ISP PoP / 光アクセス設備</Text>
  </group>
}

/** Very faint alternate paths explain that the Internet is not a single cable. */
function InternetMesh() {
  const routes: [number, number, number][][] = [
    [[2.8, -.5, 2.5], [4.2, .65, 2.7], [6.1, .15, 1.65]],
    [[3.2, -2.6, .4], [5.05, -2.85, -.15], [6.65, -1.2, .15]],
    [[3.45, .1, -.55], [5.35, 1.15, -.7], [7.05, .35, -.35]],
  ]
  return <group>{routes.map((points, index) => <Line key={index} points={points} color="#94a3b8" lineWidth={.9} transparent opacity={.22} />)}</group>
}

function activityForJourney(journey: PacketJourney | null) {
  if (!journey || journey.nodePath.length < 2) return { activeLink: null, activeRegion: null as RegionId | null, nodeActivity: new Map<string, DeviceActivity>() }
  const linkCount = journey.nodePath.length - 1
  const scaledProgress = Math.max(0, Math.min(journey.progress, 1)) * linkCount
  const linkIndex = Math.min(linkCount - 1, Math.floor(scaledProgress))
  const fraction = Math.min(1, scaledProgress - linkIndex)
  const from = journey.nodePath[linkIndex]
  const to = journey.nodePath[linkIndex + 1]
  const nodeActivity = new Map<string, DeviceActivity>()
  // These short windows make a router visibly receive before it visibly forwards.
  if (fraction < .22) nodeActivity.set(from, 'outgoing')
  if (fraction > .76) nodeActivity.set(to, 'incoming')
  return {
    activeLink: connectionKey(from, to),
    activeRegion: regionForNode(fraction < .5 ? from : to),
    nodeActivity,
  }
}

export function NetworkScene({ selectedId, journey, onSelect, onExploreNode }: Props) {
  const activity = useMemo(() => activityForJourney(journey), [journey])
  return <Canvas shadows camera={{ position: [1, 10, 31], fov: 50 }} dpr={[1, 2]}>
    <color attach="background" args={['#eef6fb']} />
    {/* The previous 24–52 range reached the fog endpoint at max overview zoom. */}
    <fog attach="fog" args={['#eef6fb', 62, 112]} />
    <ambientLight intensity={1.1} /><directionalLight position={[6, 14, 8]} intensity={2.35} castShadow shadow-mapSize={[1024, 1024]} /><pointLight position={[-7, 5, 4]} intensity={16} color="#7dd3fc" />
    <mesh position={[0, -3.75, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[34, 24]} /><meshStandardMaterial color="#f8fafc" roughness={.92} /></mesh>
    <gridHelper args={[34, 34, '#bfdbfe', '#e2e8f0']} position={[0, -3.72, 0]} />
    <Region title="家庭内ネットワーク" subtitle="192.168.x.x /24" position={[-5.7, -1.65, .4]} size={[8, 6]} color="#bae6fd" active={activity.activeRegion === 'home'} />
    <Region title="DNS名前解決" subtitle="ISP DNSリゾルバ" position={[-.7, 3.05, -3.4]} size={[4.5, 4]} color="#c4b5fd" active={activity.activeRegion === 'dns'} />
    <Region title="ISPネットワーク" subtitle="事業者ルーティング" position={[1.5, .8, .3]} size={[5, 5]} color="#a7f3d0" active={activity.activeRegion === 'isp'} />
    <Region title="インターネット" subtitle="接続されたルーター群" position={[4.7, -2.05, 1.7]} size={[5.5, 4.5]} color="#fde68a" active={activity.activeRegion === 'internet'} />
    <Region title="サーバーネットワーク" subtitle="データセンター / Webサーバー" position={[8.7, 2, -1.8]} size={[5, 5.2]} color="#bfdbfe" active={activity.activeRegion === 'server'} />
    <HomeEnvironment />
    <ProviderFacility />
    <FiberTerminal />
    <WirelessCoverage />
    <InternetMesh />
    {CONNECTIONS.map(connection => <PhysicalLink key={`${connection.from}-${connection.to}`} connection={connection} active={activity.activeLink === connectionKey(connection.from, connection.to)} />)}
    <DataCenterRacks />
    {NETWORK_NODES.map(node => <NodeModel key={node.id} node={node} active={node.id === selectedId} activity={activity.nodeActivity.get(node.id) ?? null} onSelect={onSelect} onExplore={onExploreNode} />)}
    {journey !== null && <DataPacket journey={journey} />}
    <OrbitControls
      enablePan
      enableDamping
      dampingFactor={.08}
      minDistance={12}
      maxDistance={80}
      maxPolarAngle={Math.PI / 2.05}
      target={[0, 0, 0]}
      zoomToCursor
    />
  </Canvas>
}
