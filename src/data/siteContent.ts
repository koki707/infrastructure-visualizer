export const SITE = {
  name: 'Infrastructure Simulator',
  japaneseName: 'ITインフラシミュレーション',
  description: 'Webアクセスを入口に、IT・コンピュータの見えない仕組みをシミュレーションで学べる教育用Webアプリ。',
} as const

/** Public contact endpoint set by the deployer; never used by the URL simulation. */
export const CONTACT = {
  feedbackUrl: import.meta.env.VITE_CONTACT_URL?.trim() ?? '',
} as const

export const FEATURES = [
  { title: 'Webアクセスの裏側', body: '3つのURLから接続先を選び、Webページを取得するまでにDNS、TCP、IP、Ethernetがどう関わるかを追跡できます。', tag: 'URL → Server' },
  { title: 'PC内部から追える', body: 'アプリケーションからOS、Network Stack、NICへ、データが渡される流れを確認できます。', tag: 'PC → NIC' },
  { title: '通信データの中身を見る', body: 'Application Data、TCP Segment、IP Packet、Ethernet Frameの構造を順に確かめられます。', tag: 'Data Structure' },
  { title: '機器の中まで探索', body: 'PC、Switch、Router、DNS Server、Web Serverを選び、内部の役割まで段階的に学べます。', tag: 'Explore Inside' },
] as const

export const LEARNING_STEPS = [
  ['1. まず全体を見る', 'PCからWeb Serverまでの通信全体を、広い3D空間で確認します。'],
  ['2. 気になるものを選ぶ', 'PC、Router、TCP、Ethernetなど、気になる対象を選択します。'],
  ['3. 中へ入る', '「内部を見る」やクリック操作で、より具体的な世界へ進みます。'],
  ['4. データを追う', 'データが今どこにあり、どんな形かを画面の情報とあわせて確認します。'],
] as const

export const TOPIC_GROUPS = [
  { title: 'コンピュータ', items: ['PC内部', 'CPU', 'ALU', 'メモリ', 'Storage', 'NIC'] },
  { title: 'ネットワーク機器', items: ['LAN Switch', 'Home Router / ISP Router / Internet Router', 'DNS Server', 'Web Server'] },
  { title: 'プロトコルと通信', items: ['DNS Query / Answer', 'HTTP Request', 'TCP Segment', 'IPv4 Packet', 'Ethernet'] },
  { title: 'データ構造', items: ['Application Data', 'TCP Header', 'IP Header', 'Ethernet Frame', 'MAC Address', 'bit'] },
] as const

export const NEXT_TOPIC_GROUPS = [
  { title: 'ICMP', body: '到達確認やエラー通知が、IP通信の観測にどう役立つかを扱う予定です。' },
  { title: 'QUIC / HTTP/3', body: 'TCP + TLSとは異なる、UDP上のQUICを利用するWeb通信の代表例を扱う予定です。' },
  { title: 'NDP', body: 'IPv6 LANで、近隣機器や次のリンクの相手を見つける仕組みを、ARPとの違いとともに扱う予定です。' },
] as const
