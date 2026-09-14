export interface RequestStage {
  id: string
  title: string
  shortTitle: string
  range: [number, number]
  description: string
  protocol: string
  fromNodeId: string
  toNodeId: string
  nodePath: string[]
  learningPoint?: { title: string; body: string; focus: string }
}

/**
 * A deterministic pause point along the educational request journey.
 *
 * A stop represents the packet reaching one of the devices in a stage's
 * `nodePath`.  The playback UI can use these points to advance one device at
 * a time without maintaining a second, independent version of the route.
 */
export interface RequestStop {
  id: string
  stageId: string
  progress: number
  nodeId: string
  nodeIndex: number
  label: string
}

/** How the main Web access simulation advances through its route. */
export type RequestPlaybackMode = 'continuous' | 'step'

export interface PacketJourney {
  nodePath: string[]
  progress: number
  /** Short stage name rendered next to the moving educational packet. */
  label: string
  protocol: string
}
