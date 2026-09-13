import type { LearningCategory, LearningTopic } from '../types/learning'

/**
 * The first three topics are intentionally small and complete. Future areas
 * are represented as categories, rather than placeholder lesson pages.
 */
export const LEARNING_CATEGORIES: LearningCategory[] = [
  { id: 'network', title: 'ネットワーク', description: '既存のWebアクセスシミュレーションとつながる、配送・接続・変換の仕組みです。', status: 'available' },
  { id: 'computer', title: 'コンピュータ構成', description: 'CPU、メモリ、命令実行など、PCの中で起きる仕組みです。', status: 'planned' },
  { id: 'os', title: 'OS', description: 'プロセス、メモリ、入出力を調整する仕組みです。', status: 'planned' },
  { id: 'database', title: 'データベース', description: 'データの保存、検索、整合性を支える仕組みです。', status: 'planned' },
  { id: 'security', title: 'セキュリティ', description: 'Firewallの基本教材を公開しています。暗号化・認証・防御の仕組みを順に広げます。', status: 'partial' },
  { id: 'system', title: 'システム構成', description: '複数のサーバーやサービスを組み合わせる設計です。', status: 'planned' },
  { id: 'algorithms', title: 'アルゴリズムとデータ構造', description: '探索・並べ替え・木構造など、処理を組み立てる基礎です。', status: 'planned' },
]

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'dhcp',
    category: 'network',
    title: 'DHCP：ネットワークに参加するための設定を得る',
    shortTitle: 'DHCP',
    summary: '端末がIPv4アドレス、Default Gateway、DNS Serverなどのネットワーク設定を受け取り、LANへ参加するまでの代表的な仕組みです。',
    why: '端末ごとにIPアドレスやDNSの設定を手作業で入力し続ける代わりに、ネットワーク側が必要な設定と利用期限をまとめて配布できるようにするためです。',
    visualization: 'step-animation',
    learningGoals: ['DHCPがIPアドレス以外の設定も配布できることを説明できる', 'Discover / Offer / Request / ACKの役割を順に追える', '取得したDefault GatewayやDNS Serverの情報が後のWebアクセスにつながることを理解する'],
    prerequisites: [],
    relatedTopics: ['arp', 'routing'],
    nextTopics: ['arp'],
    glossaryTerms: ['dhcp', 'ipv4', 'default-gateway', 'dns', 'router'],
    status: 'available',
    simulatorPath: '/visualizer',
  },
  {
    id: 'arp',
    category: 'network',
    title: 'ARP：次の相手のMACアドレスを知る',
    shortTitle: 'ARP',
    summary: 'IPアドレスしか分からない状態から、同一LANでEthernet Frameを送るためのMACアドレスを調べる仕組みです。',
    why: 'IPパケットをLAN上で送るには、まず次に受け取る機器のMACアドレスが必要です。宛先が別ネットワークにあるとき、PCは通常、WebサーバーではなくデフォルトゲートウェイのMACアドレスを調べます。',
    visualization: 'hybrid-3d',
    learningGoals: ['IPアドレスとMACアドレスの役割の違いを説明できる', 'ARP RequestとARP Replyの向きの違いを確認できる', 'ARPが同一のリンク内で使われ、ルーターを越えないことを理解する'],
    prerequisites: [],
    relatedTopics: ['dhcp', 'routing', 'nat-napt'],
    nextTopics: ['routing'],
    glossaryTerms: ['arp', 'mac', 'ethernet', 'router', 'switch', 'ipv4'],
    status: 'available',
    simulatorPath: '/visualizer',
  },
  {
    id: 'routing',
    category: 'network',
    title: 'CIDRと経路選択：Longest Prefix Match',
    shortTitle: '経路選択',
    summary: 'ルーターが宛先IPアドレスとRouting Tableを照合し、最も具体的に一致する経路を選ぶ考え方です。',
    why: 'インターネットの全端末を1つの表に並べる代わりに、ネットワークのまとまりをPrefixで表し、ルーターが次の転送先を判断できるようにします。',
    visualization: 'interactive-2d',
    learningGoals: ['CIDRの / 数字が先頭から使うビット数であることを確認できる', '複数の候補からLongest Prefix Matchを選べる', '一致がない場合にdefault routeが使われる理由を説明できる'],
    prerequisites: ['arp'],
    relatedTopics: ['dhcp', 'arp', 'nat-napt', 'firewall'],
    nextTopics: ['nat-napt', 'firewall'],
    glossaryTerms: ['ipv4', 'cidr', 'routing-table', 'longest-prefix-match', 'default-gateway', 'router'],
    status: 'available',
    simulatorPath: '/visualizer',
  },
  {
    id: 'nat-napt',
    category: 'network',
    title: 'NAT / NAPT：家庭内から外へ出るときの変換',
    shortTitle: 'NAT / NAPT',
    summary: '家庭用ルーターなどで、内部のPrivate IPアドレスと外部側のIPアドレス・Portの対応を管理する代表的な仕組みです。',
    why: '複数の家庭内端末が限られた外部側アドレスを共有する場面では、返信をどの端末へ戻すかを区別する対応表が必要になります。',
    visualization: 'step-animation',
    learningGoals: ['NATとNAPTの関係を大まかに説明できる', '送信時の変換と返信時の逆変換を追える', '対応表が返信先を判断するために必要なことを理解する'],
    prerequisites: ['arp', 'routing'],
    relatedTopics: ['arp', 'routing', 'firewall'],
    nextTopics: ['firewall'],
    glossaryTerms: ['nat', 'napt', 'ipv4', 'tcp', 'router', 'firewall'],
    status: 'available',
    simulatorPath: '/visualizer',
  },
  {
    id: 'ipv6',
    category: 'network',
    title: 'IPv6：128ビットのアドレスとIPv4との共存',
    shortTitle: 'IPv6',
    summary: '128ビットのIPv6アドレスを、16ビットごとの16進数表記・省略表記・LAN内での役割から確認する教材です。',
    why: 'ネットワークを越えて届けるためのアドレス方式にはIPv4だけでなくIPv6もあります。両者の表記やLANでの仕組みの違いを知ると、現実の接続環境を理解しやすくなります。',
    visualization: 'interactive-2d',
    learningGoals: ['IPv6アドレスが128ビット・8つの16ビットグループで表されることを確認できる', '先頭の0と連続した0グループの省略表記を読める', 'IPv6 LANではARPではなくNDPが使われること、IPv4と併用される場合があることを説明できる'],
    prerequisites: [],
    relatedTopics: ['dhcp', 'arp', 'routing'],
    glossaryTerms: ['ipv6', 'ipv4', 'arp', 'dhcp', 'router'],
    status: 'available',
    simulatorPath: '/visualizer',
  },
  {
    id: 'firewall',
    category: 'network',
    title: 'Firewall：通信を許可・拒否する判断を追う',
    shortTitle: 'Firewall',
    summary: '通信の送信元・宛先・Protocol・Port・状態などを条件に、定められたルールにもとづいて許可・拒否を判断する仕組みです。',
    why: 'ネットワーク境界やサーバーへ届く通信を、必要なものに絞ることで、公開するサービスの範囲を管理し、不要な到達を減らすためです。',
    visualization: 'interactive-2d',
    learningGoals: ['Firewallが通信の条件とルールを照合することを説明できる', '許可ルールとdefault denyの違いを例で確認できる', 'Stateful Firewallが既存の通信状態を利用できることを大まかに理解する'],
    prerequisites: ['routing'],
    relatedTopics: ['routing', 'nat-napt'],
    glossaryTerms: ['firewall', 'ip', 'tcp', 'router', 'nat'],
    status: 'available',
    simulatorPath: '/visualizer',
  },
]

export const LEARNING_TOPIC_BY_ID = new Map(LEARNING_TOPICS.map(topic => [topic.id, topic]))

export function learningTopicFromPath(path: string) {
  if (!path.startsWith('/learn/')) return null
  try {
    return LEARNING_TOPIC_BY_ID.get(decodeURIComponent(path.slice('/learn/'.length))) ?? null
  } catch {
    return null
  }
}
