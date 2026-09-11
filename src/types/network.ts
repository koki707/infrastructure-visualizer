export type NodeKind = 'pc' | 'switch' | 'router' | 'dns' | 'server'
export type Position = [number, number, number]
export type LinkMedium = 'ethernet' | 'fiber' | 'backbone-fiber' | 'wireless'

export interface NetworkNode {
  id: string
  name: string
  type: NodeKind
  description: string
  position: Position
  detail: string
}

export interface Connection {
  from: string
  to: string
  /** The physical medium for this hop in the educational model. */
  medium: LinkMedium
  label: string
  /** Intermediate visual waypoints, not additional Layer-3 hops. */
  via?: Position[]
}

/** A local, selectable Web destination for the educational request simulation. */
export interface SimulationDestination {
  id: string
  url: string
  label: string
  description: string
  serverNodeId: string
}
