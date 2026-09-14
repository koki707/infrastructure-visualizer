export const SITE = {
  name: 'ITインフラシミュレーター',
  japaneseName: 'ITインフラシミュレーション',
  description: 'ウェブアクセスを入口に、IT・コンピュータの見えない仕組みをシミュレーションで学べる教育用ウェブアプリ。',
} as const

/** Public contact endpoint set by the deployer; never used by the URL simulation. */
export const CONTACT = {
  feedbackUrl: import.meta.env.VITE_CONTACT_URL?.trim() ?? '',
} as const

export const FEATURES = [
  { title: 'ウェブアクセスの裏側', body: '3つのURLから接続先を選び、ウェブページを取得するまでにDNS、TCP、IP、Ethernetがどう関わるかを追跡できます。', tag: 'URL → サーバー' },
  { title: 'PC内部から追える', body: 'アプリケーションからOS、ネットワークスタック、NICへ、データが渡される流れを確認できます。', tag: 'PC → NIC' },
  { title: '通信データの中身を見る', body: 'アプリケーションデータ、TCPセグメント、IPパケット、Ethernetフレームの構造を順に確かめられます。', tag: 'データ構造' },
  { title: '機器の中まで探索', body: 'PC、スイッチ、ルーター、DNSサーバー、ウェブサーバーを選び、内部の役割まで段階的に学べます。', tag: '内部を探索' },
  { title: '処理の進み方を止めて見る', body: 'CPUの命令実行、OSの切り替え、データベースのトランザクションなど、途中の状態を止めながら因果関係を確かめられます。', tag: 'ステップごと' },
  { title: '判断の違いを操作する', body: 'キャッシュヒット / ミス、負荷分散、フェイルオーバー、二分探索、グラフ探索など、条件によって結果が変わる仕組みを操作できます。', tag: '操作型' },
] as const

export const LEARNING_STEPS = [
  ['1. まず3Dで全体を見る', 'PCからウェブサーバーまでの通信全体を、広い3D空間で確認します。'],
  ['2. 通信の仕組みを深掘りする', 'DNS、TCP、IP、Ethernetなど、3Dで登場した仕組みを通信の順にたどります。'],
  ['3. 機器やデータの中へ入る', '「内部を見る」やクリック操作で、より具体的な世界へ進みます。'],
  ['4. 他のIT分野へ広げる', 'PC、OS、データベース、セキュリティ、システム構成、アルゴリズムへつなげます。'],
] as const

export const TOPIC_GROUPS = [
  { title: 'コンピュータ', items: ['PC内部', 'CPU', 'ALU', 'メモリ', 'ストレージ', 'NIC'] },
  { title: 'ネットワーク機器', items: ['LANスイッチ', 'ホームルーター / ISPルーター / インターネットルーター', 'DNSサーバー', 'ウェブサーバー'] },
  { title: 'プロトコルと通信', items: ['DNS問い合わせ / DNS応答', 'HTTPリクエスト', 'TCPセグメント', 'IPv4パケット', 'Ethernet'] },
  { title: 'データ構造', items: ['アプリケーションデータ', 'TCPヘッダー', 'IPヘッダー', 'Ethernetフレーム', 'MACアドレス', 'ビット'] },
] as const

export const NEXT_TOPIC_GROUPS = [
  { title: 'ICMP', body: '到達確認やエラー通知が、IP通信の観測にどう役立つかを扱う予定です。' },
  { title: 'QUIC / HTTP/3', body: 'TCPとTLSの組み合わせとは異なる、UDP上のQUICを利用するウェブ通信の代表例を扱う予定です。' },
  { title: 'デッドロック', body: '複数の処理が互いの資源待ちになったとき、なぜ先へ進めなくなるのかを扱う予定です。' },
  { title: 'データベースの正規化', body: 'データの重複や更新時の矛盾を減らすために、表の構造をどう分けるかを扱う予定です。' },
  { title: '暗号化とハッシュ', body: '守りたい情報に応じて、暗号化とハッシュをどう使い分けるかを扱う予定です。' },
  { title: '木構造とヒープ', body: '探索や優先順位付けで使われる木構造を、操作しながら扱う予定です。' },
] as const
