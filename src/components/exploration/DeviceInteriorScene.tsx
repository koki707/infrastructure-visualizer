import { Line, OrbitControls } from '@react-three/drei'
import { VisibleText as Text } from '../scene/VisibleText'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, type ReactNode } from 'react'
import type { Mesh } from 'three'
import type { ExplorationItem, ExplorationWorld } from '../../types/exploration'
import { ProtocolUnit } from './ProtocolUnit'

type Point = [number, number, number]

const SWITCH_PATH: Point[] = [[-5.75, -.78, 0], [-4.1, -.78, 0], [-2.45, .62, 0], [-.55, .62, 0], [1.55, .62, 0], [3.65, -.78, 0], [5.75, -.78, 0]]
const ROUTER_PATH: Point[] = [[-5.75, -.78, 0], [-4.15, -.78, 0], [-2.5, .62, 0], [-.55, .62, 0], [1.45, .62, 0], [3.35, .62, 0], [5.45, -.78, 0]]
const DNS_PATH: Point[] = [[-5.7, -.75, 0], [-3.55, -.75, 0], [-1.45, .45, 0], [.8, .45, 0], [3.35, -.75, 0], [5.45, -.75, 0]]
const SERVER_PATH: Point[] = [[-5.75, -.8, 0], [-4.15, -.8, 0], [-2.5, .62, 0], [-.7, .62, 0], [1.05, .62, 0], [3.15, .62, 0], [5.35, -.8, 0]]

function itemMap(world: ExplorationWorld) { return Object.fromEntries(world.items.map(item => [item.id, item])) as Record<string, ExplorationItem> }
function cursor(active: boolean) { document.body.style.cursor = active ? 'pointer' : 'auto' }

function DevicePart({ item, position, selected, children, onSelect, labelOffset = -.9 }: { item: ExplorationItem; position: Point; selected: boolean; children: ReactNode; onSelect: (item: ExplorationItem) => void; labelOffset?: number }) {
  return <group position={position} onClick={(event) => { event.stopPropagation(); onSelect(item) }} onPointerOver={() => cursor(true)} onPointerOut={() => cursor(false)}>
    {children}
    {selected && <mesh position={[0, 0, -.28]}><boxGeometry args={[2.05, 1.36, .03]} /><meshBasicMaterial color="#67e8f9" transparent opacity={.2} /></mesh>}
    <mesh position={[0, labelOffset + .12, .105]}><boxGeometry args={[2.2, .54, .03]} /><meshStandardMaterial color="#0d2638" emissive="#0d2638" emissiveIntensity={.12} roughness={.55} /></mesh>
    <Text position={[0, labelOffset, .18]} fontSize={.17} color="#ffffff" outlineWidth={.013} outlineColor="#07111f" anchorX="center" maxWidth={2.1}>{item.title}</Text>
    <Text position={[0, labelOffset + .25, .18]} fontSize={.125} color="#a5f3fc" outlineWidth={.007} outlineColor="#07111f" anchorX="center" maxWidth={2.1}>{item.subtitle}</Text>
  </group>
}

function PacketPulse({ points, color = '#67e8f9' }: { points: Point[]; color?: string }) {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    const phase = (clock.elapsedTime * .42) % (points.length - 1)
    const index = Math.floor(phase)
    const t = phase - index
    const from = points[index]
    const to = points[index + 1]
    ref.current?.position.set(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2])
  })
  return <mesh ref={ref}><sphereGeometry args={[.13, 16, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} /></mesh>
}

function Chassis({ label, accent = '#3b5062' }: { label: string; accent?: string }) {
  return <>
    <mesh position={[0, -.1, -.46]}><boxGeometry args={[13.25, 5.38, .3]} /><meshStandardMaterial color="#172a3d" metalness={.72} roughness={.34} /></mesh>
    <mesh position={[0, -.1, -.26]}><boxGeometry args={[12.78, 4.9, .06]} /><meshStandardMaterial color="#27465b" emissive={accent} emissiveIntensity={.08} metalness={.36} roughness={.52} /></mesh>
    <mesh position={[0, 1.94, -.18]}><boxGeometry args={[12.58, .5, .09]} /><meshStandardMaterial color="#345b70" metalness={.52} roughness={.42} /></mesh>
    {Array.from({ length: 18 }, (_, index) => <mesh key={index} position={[-5.25 + index * .62, 1.91, -.11]}><boxGeometry args={[.34, .11, .035]} /><meshStandardMaterial color="#0b1220" roughness={.7} /></mesh>)}
    {[-6.06, 6.06].flatMap(x => [-2.28, 2.28].map(y => <mesh key={`${x}-${y}`} position={[x, y, -.12]}><cylinderGeometry args={[.075, .075, .035, 12]} /><meshStandardMaterial color="#94a3b8" metalness={.9} roughness={.3} /></mesh>))}
    <mesh position={[-5.8, 1.94, -.08]}><boxGeometry args={[.08, .32, .06]} /><meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={.8} /></mesh>
    <Text position={[-5.56, 1.92, .1]} fontSize={.16} color="#f8fafc" outlineWidth={.008} outlineColor="#0f172a">{label}</Text>
  </>
}

function Port({ active = false, label }: { active?: boolean; label?: string }) {
  return <group>
    <mesh><boxGeometry args={[.54, .32, .35]} /><meshStandardMaterial color="#080f19" metalness={.78} roughness={.24} /></mesh>
    <mesh position={[0, .19, .19]}><circleGeometry args={[.043, 12]} /><meshStandardMaterial color={active ? '#5eead4' : '#64748b'} emissive={active ? '#0f766e' : '#334155'} emissiveIntensity={active ? 1.4 : .18} /></mesh>
    {label && <Text position={[0, -.04, .2]} fontSize={.105} color="#dbeafe" anchorX="center">{label}</Text>}
  </group>
}

function PortBank({ count = 3, activeIndex = 1, label }: { count?: number; activeIndex?: number; label?: string }) {
  const spacing = .48
  return <group>{Array.from({ length: count }, (_, index) => <group key={index} position={[(index - (count - 1) / 2) * spacing, 0, 0]}><Port active={index === activeIndex} /></group>)}{label && <Text position={[0, -.48, .2]} fontSize={.11} color="#dbeafe" anchorX="center">{label}</Text>}</group>
}

function Display({ lines }: { lines: string[] }) {
  return <group>
    <mesh><boxGeometry args={[1.7, .8, .28]} /><meshStandardMaterial color="#6d8798" metalness={.48} roughness={.4} /></mesh>
    <mesh position={[0, 0, .16]}><boxGeometry args={[1.45, .53, .03]} /><meshStandardMaterial color="#edf6f9" emissive="#d7edf3" emissiveIntensity={.06} roughness={.5} /></mesh>
    {lines.map((line, index) => <Text key={line} position={[0, .18 - index * .2, .19]} fontSize={.105} color={index === 0 ? '#0f2742' : '#1e3a5f'} outlineWidth={.005} outlineColor="#ffffff" anchorX="center" maxWidth={1.35}>{line}</Text>)}
  </group>
}

function SwitchInterior({ world, selectedId, onSelect }: { world: ExplorationWorld; selectedId: string | null; onSelect: (item: ExplorationItem) => void }) {
  const items = useMemo(() => itemMap(world), [world])
  return <>
    <Chassis label="LANスイッチ · L2フレーム転送" />
    <DevicePart item={items['switch-in']} position={[-5.55, -.78, 0]} selected={selectedId === 'switch-in'} onSelect={onSelect}><PortBank label="ポート 2" /></DevicePart>
    <DevicePart item={items['frame-check']} position={[-3.85, -.78, 0]} selected={selectedId === 'frame-check'} onSelect={onSelect}><Display lines={['フレーム確認', 'FCS / タイプ']} /></DevicePart>
    <DevicePart item={items['destination-mac']} position={[-1.8, .62, 0]} selected={selectedId === 'destination-mac'} onSelect={onSelect}><Display lines={['宛先MAC', '3C:52:82:··']} /></DevicePart>
    <DevicePart item={items['mac-table']} position={[.3, .62, 0]} selected={selectedId === 'mac-table'} onSelect={onSelect}><Display lines={['MACアドレス表', '3C:52 → p4', 'A4:19 → p7']} /></DevicePart>
    <DevicePart item={items['switch-fabric']} position={[2.35, .62, 0]} selected={selectedId === 'switch-fabric'} onSelect={onSelect}><group><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.72, .72, .32, 10]} /><meshStandardMaterial color="#314a5d" metalness={.7} roughness={.33} /></mesh><mesh position={[0, 0, .2]}><circleGeometry args={[.36, 16]} /><meshStandardMaterial color="#b7d7da" emissive="#0f766e" emissiveIntensity={.22} /></mesh><Text position={[0, .03, .23]} fontSize={.13} color="#10202c" anchorX="center">ファブリック</Text></group></DevicePart>
    <DevicePart item={items['egress-queue']} position={[4.25, -.78, 0]} selected={selectedId === 'egress-queue'} onSelect={onSelect}><Display lines={['出力', 'キュー']} /></DevicePart>
    <DevicePart item={items['switch-out']} position={[5.7, -.78, 0]} selected={selectedId === 'switch-out'} onSelect={onSelect}><PortBank label="ポート 4" /></DevicePart>
    <Line points={SWITCH_PATH} color="#7dd3dc" lineWidth={1.5} transparent opacity={.68} />
    <PacketPulse points={SWITCH_PATH} color="#67e8f9" />
    <Text position={[0, -1.63, .2]} fontSize={.15} color="#dbeafe" outlineWidth={.008} outlineColor="#0f172a" anchorX="center">LANスイッチはEthernetフレームを保ったまま、MACアドレスを見て転送する</Text>
    <ProtocolUnit position={[-3.3, -2.32, .12]} kind="frame" caption="受信フレーム：Ethernetヘッダを参照" />
    <ProtocolUnit position={[3.35, -2.32, .12]} kind="frame" caption="送出フレーム：上位のIP / TCPは開かない" />
  </>
}

function RouterInterior({ world, selectedId, onSelect }: { world: ExplorationWorld; selectedId: string | null; onSelect: (item: ExplorationItem) => void }) {
  const items = useMemo(() => itemMap(world), [world])
  return <>
    <Chassis label="ルーター · L3転送" accent="#4a3f31" />
    <DevicePart item={items.incoming} position={[-5.55, -.78, 0]} selected={selectedId === 'incoming'} onSelect={onSelect}><Port active label="eth0" /></DevicePart>
    <DevicePart item={items['l2-decap']} position={[-3.9, -.78, 0]} selected={selectedId === 'l2-decap'} onSelect={onSelect}><Display lines={['L2受信', 'Ethernetを外す']} /></DevicePart>
    <DevicePart item={items['ip-lookup']} position={[-2.05, .62, 0]} selected={selectedId === 'ip-lookup'} onSelect={onSelect}><Display lines={['宛先IP', '93.184.216.34']} /></DevicePart>
    <DevicePart item={items.ttl} position={[-.15, .62, 0]} selected={selectedId === 'ttl'} onSelect={onSelect}><Display lines={['TTL', '64 → 63']} /></DevicePart>
    <DevicePart item={items.route} position={[1.85, .62, 0]} selected={selectedId === 'route'} onSelect={onSelect}><Display lines={['ルーティング表', '0.0.0.0/0 → ISP', '最長プレフィックス']} /></DevicePart>
    <DevicePart item={items['next-hop']} position={[3.8, .62, 0]} selected={selectedId === 'next-hop'} onSelect={onSelect}><Display lines={['次ホップ', 'ISPルーター']} /></DevicePart>
    <DevicePart item={items['l2-encap']} position={[5.45, -.78, 0]} selected={selectedId === 'l2-encap'} onSelect={onSelect}><Port active label="eth1" /></DevicePart>
    <Line points={ROUTER_PATH} color="#d8c799" lineWidth={1.5} transparent opacity={.7} />
    <PacketPulse points={ROUTER_PATH} color="#f1c96b" />
    <Text position={[0, -1.63, .2]} fontSize={.15} color="#f5e6c4" outlineWidth={.008} outlineColor="#0f172a" anchorX="center">Ethernetを外す → IPで経路を決める → 次のリンク用のフレームを作り直す</Text>
    <ProtocolUnit position={[-4.05, -2.32, .12]} kind="frame" caption="受信フレーム" />
    <ProtocolUnit position={[0, -2.32, .12]} kind="packet" caption="Ethernetを外したIPパケット" />
    <ProtocolUnit position={[4.05, -2.32, .12]} kind="frame" caption="次ホップ用の新しいフレーム" />
  </>
}

function DnsInterior({ world, selectedId, onSelect }: { world: ExplorationWorld; selectedId: string | null; onSelect: (item: ExplorationItem) => void }) {
  const items = useMemo(() => itemMap(world), [world])
  return <>
    <Chassis label="DNSリゾルバ · 名前解決" accent="#334d68" />
    <DevicePart item={items['dns-nic']} position={[-5.55, -.75, 0]} selected={selectedId === 'dns-nic'} onSelect={onSelect}><Port active label="UDP / 53" /></DevicePart>
    <DevicePart item={items['dns-query-item']} position={[-3.45, -.75, 0]} selected={selectedId === 'dns-query-item'} onSelect={onSelect}><Display lines={['DNS問い合わせ', 'example.test?']} /></DevicePart>
    <DevicePart item={items['dns-resolver']} position={[-1.2, .45, 0]} selected={selectedId === 'dns-resolver'} onSelect={onSelect}><Display lines={['リゾルバ', '解析 / 参照']} /></DevicePart>
    <DevicePart item={items['dns-cache']} position={[1.1, .45, 0]} selected={selectedId === 'dns-cache'} onSelect={onSelect}><Display lines={['キャッシュ', 'TTLを確認']} /></DevicePart>
    <DevicePart item={items['dns-upstream']} position={[3.45, -.75, 0]} selected={selectedId === 'dns-upstream'} onSelect={onSelect}><Display lines={['上流DNS', 'キャッシュなし時']} /></DevicePart>
    <DevicePart item={items['dns-answer-item']} position={[5.45, -.75, 0]} selected={selectedId === 'dns-answer-item'} onSelect={onSelect}><Display lines={['DNS応答', 'A / AAAA']} /></DevicePart>
    <Line points={DNS_PATH} color="#8ec5dc" lineWidth={1.5} transparent opacity={.7} />
    <PacketPulse points={DNS_PATH} />
  </>
}

function ServerInterior({ world, selectedId, onSelect }: { world: ExplorationWorld; selectedId: string | null; onSelect: (item: ExplorationItem) => void }) {
  const items = useMemo(() => itemMap(world), [world])
  return <>
    <Chassis label="Webサーバー · リクエスト処理" />
    <DevicePart item={items['server-nic']} position={[-5.55, -.8, 0]} selected={selectedId === 'server-nic'} onSelect={onSelect}><Port active label="NIC" /></DevicePart>
    <DevicePart item={items['physical-in']} position={[-4.05, -.8, 0]} selected={selectedId === 'physical-in'} onSelect={onSelect}><Display lines={['物理層', '信号を復号']} /></DevicePart>
    <DevicePart item={items['ethernet-in']} position={[-2.35, .62, 0]} selected={selectedId === 'ethernet-in'} onSelect={onSelect}><Display lines={['Ethernet', 'フレームを外す']} /></DevicePart>
    <DevicePart item={items['ip-in']} position={[-.55, .62, 0]} selected={selectedId === 'ip-in'} onSelect={onSelect}><Display lines={['IPv4', '宛先IPを確認']} /></DevicePart>
    <DevicePart item={items['tcp-in']} position={[1.25, .62, 0]} selected={selectedId === 'tcp-in'} onSelect={onSelect}><Display lines={['TCP', 'ポート 443']} /></DevicePart>
    <DevicePart item={items['web-server']} position={[3.35, .62, 0]} selected={selectedId === 'web-server'} onSelect={onSelect}><Display lines={['Webサーバー', 'HTTPリクエスト']} /></DevicePart>
    <DevicePart item={items['server-app']} position={[5.35, -.8, 0]} selected={selectedId === 'server-app'} onSelect={onSelect}><Display lines={['アプリケーション', 'リクエスト処理']} /></DevicePart>
    <DevicePart item={items['server-storage']} position={[3.35, -1.6, 0]} selected={selectedId === 'server-storage'} onSelect={onSelect} labelOffset={-.72}><group>{[-.24, 0, .24].map(y => <mesh key={y} position={[0, y, 0]}><boxGeometry args={[1.2, .16, .34]} /><meshStandardMaterial color="#536475" metalness={.68} roughness={.34} /></mesh>)}</group></DevicePart>
    <Line points={SERVER_PATH} color="#8ec5dc" lineWidth={1.5} transparent opacity={.7} />
    <PacketPulse points={SERVER_PATH} />
    <Text position={[0, -2.23, .2]} fontSize={.15} color="#dbeafe" outlineWidth={.008} outlineColor="#0f172a" anchorX="center">受信側：Ethernet → IP → TCPの順に外し、HTTPリクエストをアプリへ渡す</Text>
    <ProtocolUnit position={[-4.5, -2.95, .12]} kind="frame" caption="Ethernetフレーム" />
    <ProtocolUnit position={[-1.55, -2.95, .12]} kind="packet" caption="IPパケット" />
    <ProtocolUnit position={[1.35, -2.95, .12]} kind="segment" caption="TCPセグメント" />
    <ProtocolUnit position={[4.45, -2.95, .12]} kind="data" caption="HTTPリクエスト" />
  </>
}

export function DeviceInteriorScene({ world, selectedId, onSelect }: { world: ExplorationWorld; selectedId: string | null; onSelect: (item: ExplorationItem) => void }) {
  const content = world.id === 'switch'
    ? <SwitchInterior world={world} selectedId={selectedId} onSelect={onSelect} />
    : world.id === 'dns'
      ? <DnsInterior world={world} selectedId={selectedId} onSelect={onSelect} />
      : world.id === 'router'
        ? <RouterInterior world={world} selectedId={selectedId} onSelect={onSelect} />
        : <ServerInterior world={world} selectedId={selectedId} onSelect={onSelect} />

  return <Canvas camera={{ position: [0, .1, 20], fov: 50 }} dpr={[1, 2]}>
    <color attach="background" args={['#f8fafc']} />
    <ambientLight intensity={1.3} />
    <hemisphereLight args={['#dbeafe', '#334155', .75]} />
    <pointLight position={[0, 5, 6]} intensity={26} color="#dbeafe" />
    {content}
    <OrbitControls enablePan enableDamping minDistance={8} maxDistance={60} maxPolarAngle={Math.PI / 2.05} target={[0, -.45, 0]} zoomToCursor />
  </Canvas>
}
