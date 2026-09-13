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
  { title: '処理の進み方を止めて見る', body: 'CPUの命令実行、OSの切り替え、DatabaseのTransactionなど、途中の状態を止めながら因果関係を確かめられます。', tag: 'Step by Step' },
  { title: '判断の違いを操作する', body: 'Cache Hit / Miss、Load Balancing、Failover、Binary Search、Graph探索など、条件によって結果が変わる仕組みを操作できます。', tag: 'Interactive' },
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
  { title: 'Virtual Memory', body: '仮想アドレス、Paging、Page Faultが、限られたMemoryをどう使いやすくするかを扱う予定です。' },
  { title: 'Database Index', body: '大量のRowから必要なデータを探すとき、Indexがどのように探索を助けるかを扱う予定です。' },
  { title: 'Digital Signature', body: 'HashとPublic Keyを使い、改ざん検出や署名者の確認をどう行うかを扱う予定です。' },
  { title: 'Graph Search', body: 'ネットワークや経路のようなつながりを、BFSやDFSでどうたどるかを扱う予定です。' },
] as const
