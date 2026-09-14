import type { Connection, NetworkNode, Position, SimulationDestination } from '../types/network'

export const NETWORK_NODES: NetworkNode[] = [
  { id: 'pc', name: 'PC', type: 'pc', position: [-9, -2.9, 1.5], detail: '送信元 · 有線LAN', description: 'この代表例では、PCはカテゴリ6 Ethernetケーブルで家庭内LANへ接続しています。アプリケーションで作られたデータが、ネットワークへ送り出される出発点です。' },
  { id: 'switch', name: 'LANスイッチ', type: 'switch', position: [-5.8, -1.4, .8], detail: 'Ethernet転送', description: '宅内のEthernet（電気信号）を受け、宛先MACアドレスを参照して適切なポートへEthernetフレームを転送します。' },
  { id: 'home-router', name: 'ホームルーター', type: 'router', position: [-2.7, -.1, -.2], detail: '家庭内LAN → FTTH', description: '家庭内ネットワークの出口です。宅内ではEthernetやWi‑Fiを使い、回線終端装置（ONU/ONT）側では光アクセス回線へつながる代表例として表しています。' },
  { id: 'dns-server', name: 'DNSサーバー', type: 'dns', position: [-.7, 3.7, -3.4], detail: '名前解決', description: 'ドメイン名に対応するIPアドレスを返すDNSリゾルバを、学習用に独立した機器として表しています。' },
  { id: 'isp-router', name: 'ISPルーター', type: 'router', position: [1.6, 1.5, .5], detail: 'ISP光アクセス網', description: '回線事業者／ISPのネットワーク内のエッジルーターです。多くの区間で光ファイバを使い、次の経路へIPパケットを転送します。' },
  { id: 'internet-router', name: 'インターネットルーター', type: 'router', position: [4.8, -1.3, 1.8], detail: '光バックボーン', description: 'インターネット上の中継ルーターです。実際には多数の事業者ネットワークと光回線が相互接続されています。' },
  { id: 'web-server', name: 'ドキュメントWebサーバー', type: 'server', position: [8.6, 2.7, -1.8], detail: 'docs.example.test · データセンター内', description: 'ドキュメントサイトを提供する、データセンターのラック内にあるWebサーバーです。ラック内のスイッチ／サーバー間も通常はEthernetまたは高速な光接続で構成されます。' },
  { id: 'shop-web-server', name: 'ショップWebサーバー', type: 'server', position: [10.2, .2, .75], detail: 'shop.example.test · データセンター内', description: 'オンラインストアを提供するWebサーバーです。選択したURLの代表的な接続先として、同じデータセンター領域に配置しています。' },
  { id: 'status-web-server', name: 'ステータスWebサーバー', type: 'server', position: [7.25, .5, .15], detail: 'status.example.test · データセンター内', description: 'サービスの稼働状況を表示するWebサーバーです。選択したURLに応じて、通信の到着先として強調されます。' },
]

export const CONNECTIONS: Connection[] = [
  { from: 'pc', to: 'switch', medium: 'ethernet', label: 'カテゴリ6 Ethernet · 電気信号', via: [[-7.8, -3.2, 1.28]] },
  { from: 'switch', to: 'home-router', medium: 'ethernet', label: '宅内 Ethernet', via: [[-4.25, -2.35, .15]] },
  { from: 'home-router', to: 'isp-router', medium: 'fiber', label: 'FTTH · 光アクセス回線', via: [[-.85, -2.55, -.15], [.15, -1.42, .2]] },
  { from: 'isp-router', to: 'internet-router', medium: 'backbone-fiber', label: 'ISP / バックボーン光回線', via: [[3.25, -.05, 1.5]] },
  { from: 'internet-router', to: 'web-server', medium: 'backbone-fiber', label: 'データセンター接続 · 光回線', via: [[6.8, -.55, .15]] },
  { from: 'internet-router', to: 'shop-web-server', medium: 'backbone-fiber', label: 'データセンター接続 · 光回線', via: [[7.35, -1.15, 1.35], [9.25, -.95, 1.1]] },
  { from: 'internet-router', to: 'status-web-server', medium: 'backbone-fiber', label: 'データセンター接続 · 光回線', via: [[6.2, -.8, .9]] },
  { from: 'home-router', to: 'dns-server', medium: 'fiber', label: 'ISP網内の光接続', via: [[-1.8, 1.45, -2.0]] },
]

export const SIMULATION_DESTINATIONS: SimulationDestination[] = [
  { id: 'docs', url: 'https://docs.example.test/guide?topic=network', label: 'ドキュメントサイト', description: 'ネットワーク入門ガイドを読む代表例です。', serverNodeId: 'web-server' },
  { id: 'shop', url: 'https://shop.example.test/products?category=pc', label: 'オンラインストア', description: '商品の一覧を取得する代表例です。', serverNodeId: 'shop-web-server' },
  { id: 'status', url: 'https://status.example.test/availability', label: 'ステータスサイト', description: 'サービスの稼働状況を確認する代表例です。', serverNodeId: 'status-web-server' },
]

export function connectionPoints(fromId: string, toId: string): Position[] {
  const connection = CONNECTIONS.find(item => (item.from === fromId && item.to === toId) || (item.to === fromId && item.from === toId))
  const from = NETWORK_NODES.find(node => node.id === fromId)
  const to = NETWORK_NODES.find(node => node.id === toId)
  if (!from || !to) return []
  if (!connection) return [from.position, to.position]
  const forward = connection.from === fromId
  const via = connection.via ?? []
  return [from.position, ...(forward ? via : [...via].reverse()), to.position]
}
export const ANIMATION_DURATION_MS = 18000
