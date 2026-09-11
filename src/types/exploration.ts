export type ExplorationWorldId = 'pc' | 'cpu' | 'alu' | 'memory' | 'stack' | 'ethernet' | 'frame' | 'header' | 'mac' | 'bits' | 'appdata' | 'tcp' | 'ip' | 'switch' | 'dns' | 'router' | 'server'

export interface ExplorationItem {
  id: string
  title: string
  subtitle: string
  description: string
  accent: string
  next?: ExplorationWorldId
}

export interface ExplorationWorld {
  id: ExplorationWorldId
  breadcrumb: string[]
  title: string
  lead: string
  note?: string
  items: ExplorationItem[]
}
