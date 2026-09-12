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
  { id: 'security', title: 'セキュリティ', description: '通信やデータを守る暗号化・認証・防御の仕組みです。', status: 'planned' },
  { id: 'system', title: 'システム構成', description: '複数のサーバーやサービスを組み合わせる設計です。', status: 'planned' },
  { id: 'algorithms', title: 'アルゴリズムとデータ構造', description: '探索・並べ替え・木構造など、処理を組み立てる基礎です。', status: 'planned' },
]

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'arp',
    category: 'network',
    title: 'ARP：次の相手のMACアドレスを知る',
    shortTitle: 'ARP',
    summary: 'IPアドレスしか分からない状態から、同一LANでEthernet Frameを送るためのMACアドレスを調べる仕組みです。',
    why: 'IPパケットをLAN上で送るには、まず次に受け取る機器のMACアドレスが必要です。宛先が別ネットワークにあるとき、PCは通常、WebサーバーではなくデフォルトゲートウェイのMACアドレスを調べます。',
    visualization: 'interactive-2d',
    learningGoals: ['IPアドレスとMACアドレスの役割の違いを説明できる', 'ARP RequestとARP Replyの向きの違いを確認できる', 'ARPが同一のリンク内で使われ、ルーターを越えないことを理解する'],
    prerequisites: [],
    relatedTopics: ['routing', 'nat-napt'],
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
    relatedTopics: ['arp', 'nat-napt'],
    nextTopics: ['nat-napt'],
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
    relatedTopics: ['arp', 'routing'],
    glossaryTerms: ['nat', 'napt', 'ipv4', 'tcp', 'router'],
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
