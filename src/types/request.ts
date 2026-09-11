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

export interface PacketJourney {
  nodePath: string[]
  progress: number
  /** Short stage name rendered next to the moving educational packet. */
  label: string
  protocol: string
}
