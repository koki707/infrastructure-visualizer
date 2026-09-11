import { VisibleText as Text } from '../scene/VisibleText'

export type PacketUnitKind = 'data' | 'segment' | 'packet' | 'frame'

type Position = [number, number, number]
type Segment = { label: string; color: string; textColor: string; width?: number }

const SEGMENTS: Record<PacketUnitKind, Segment[]> = {
  data: [
    { label: 'HTTP DATA', color: '#dbeef6', textColor: '#164e63', width: 1.1 },
  ],
  segment: [
    { label: 'TCP', color: '#e4e7f5', textColor: '#3730a3' },
    { label: 'HTTP DATA', color: '#dbeef6', textColor: '#164e63', width: 1.1 },
  ],
  packet: [
    { label: 'IPv4', color: '#f3ead2', textColor: '#854d0e' },
    { label: 'TCP', color: '#e4e7f5', textColor: '#3730a3' },
    { label: 'HTTP DATA', color: '#dbeef6', textColor: '#164e63', width: 1.1 },
  ],
  frame: [
    { label: 'ETH', color: '#d7eee8', textColor: '#115e59' },
    { label: 'IPv4', color: '#f3ead2', textColor: '#854d0e' },
    { label: 'TCP', color: '#e4e7f5', textColor: '#3730a3' },
    { label: 'DATA', color: '#dbeef6', textColor: '#164e63' },
    { label: 'FCS', color: '#e2e8f0', textColor: '#334155' },
  ],
}

/**
 * A shared, non-overlapping packet view. Every world uses the same order:
 * outer headers on the left, payload on the right, and FCS only for frames.
 */
export function ProtocolUnit({ kind, position = [0, 0, 0], caption, scale = 1 }: { kind: PacketUnitKind; position?: Position; caption?: string; scale?: number }) {
  const segments = SEGMENTS[kind]
  const gap = .05
  const defaultWidth = .56
  const widths = segments.map(segment => segment.width ?? defaultWidth)
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + gap * (segments.length - 1) + .24

  return <group position={position} scale={scale}>
    <mesh position={[0, 0, -.045]}>
      <boxGeometry args={[totalWidth, .56, .12]} />
      <meshStandardMaterial color="#f8fafc" roughness={.62} metalness={.14} />
    </mesh>
    <mesh position={[0, .245, .02]}>
      <boxGeometry args={[totalWidth, .045, .08]} />
      <meshStandardMaterial color="#475569" roughness={.52} metalness={.35} />
    </mesh>
    {segments.map((segment, index) => {
      const width = widths[index]
      const before = widths.slice(0, index).reduce((sum, value) => sum + value, 0) + gap * index
      const x = -totalWidth / 2 + .12 + before + width / 2
      return <group key={`${kind}-${segment.label}-${index}`} position={[x, -.015, .06]}>
        <mesh>
          <boxGeometry args={[width, .34, .08]} />
          <meshStandardMaterial color={segment.color} roughness={.7} metalness={.08} />
        </mesh>
        <Text position={[0, .005, .055]} fontSize={.085} color={segment.textColor} anchorX="center" maxWidth={width - .08}>{segment.label}</Text>
      </group>
    })}
    {caption && <Text position={[0, -.43, .08]} fontSize={.105} color="#e2e8f0" outlineWidth={.007} outlineColor="#0f172a" anchorX="center" maxWidth={3.3}>{caption}</Text>}
  </group>
}
