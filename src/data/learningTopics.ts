import type { LearningCategory, LearningPath, LearningTopic } from '../types/learning'

/**
 * Categories describe the subject map; only completed, interactive topics are
 * marked available. This keeps the catalogue useful without creating empty
 * lesson pages for every concept.
 */
export const LEARNING_CATEGORIES: LearningCategory[] = [
  { id: 'network', title: 'ネットワーク', description: 'ウェブアクセスシミュレーションとつながる、配送・接続・変換の仕組みです。', status: 'available' },
  { id: 'computer', title: 'コンピュータ構成', description: 'CPU、メモリ、命令実行など、PCの中で起きる仕組みです。まず命令実行を操作して学べます。', status: 'partial' },
  { id: 'os', title: 'OS', description: 'プロセス、メモリ、入出力を調整する仕組みです。まずスケジューリングと切り替えを操作して学べます。', status: 'partial' },
  { id: 'database', title: 'データベース', description: 'データの保存、検索、整合性を支える仕組みです。まずトランザクションと更新競合の考え方を追えます。', status: 'partial' },
  { id: 'security', title: 'セキュリティ', description: 'ファイアウォール（Firewall）とTLSの基本教材を公開しています。暗号化・認証・防御の仕組みを順に広げます。', status: 'partial' },
  { id: 'system', title: 'システム構成', description: '複数のサーバーやサービスを組み合わせる設計です。まず負荷分散の役割を操作して学べます。', status: 'partial' },
  { id: 'algorithms', title: 'アルゴリズムとデータ構造', description: '探索・並べ替え・木構造など、処理を組み立てる基礎です。まず二分探索を操作して学べます。', status: 'partial' },
]

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'dhcp',
    category: 'network',
    title: 'DHCP：ネットワークに参加するための設定を得る',
    shortTitle: 'DHCP',
    summary: '端末がIPv4アドレス、デフォルトゲートウェイ、DNSサーバーなどのネットワーク設定を受け取り、LANへ参加するまでの代表的な仕組みです。',
    why: '端末ごとにIPアドレスやDNSの設定を手作業で入力し続ける代わりに、ネットワーク側が必要な設定と利用期限をまとめて配布できるようにするためです。',
    visualization: 'step-animation',
    learningGoals: ['DHCPがIPアドレス以外の設定も配布できることを説明できる', 'ディスカバー（Discover）/ オファー（Offer）/ リクエスト（Request）/ ACKの役割を順に追える', '取得したデフォルトゲートウェイやDNSサーバーの情報が後のウェブアクセスにつながることを理解する'],
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
    summary: 'IPアドレスしか分からない状態から、同一LANでイーサネットフレームを送るためのMACアドレスを調べる仕組みです。',
    why: 'IPパケットをLAN上で送るには、まず次に受け取る機器のMACアドレスが必要です。宛先が別ネットワークにあるとき、PCは通常、ウェブサーバーではなくデフォルトゲートウェイのMACアドレスを調べます。',
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
    summary: 'ルーターが宛先IPアドレスとルーティングテーブルを照合し、最も具体的に一致する経路を選ぶ考え方です。',
    why: 'インターネットの全端末を1つの表に並べる代わりに、ネットワークのまとまりをプレフィックスで表し、ルーターが次の転送先を判断できるようにします。',
    visualization: 'interactive-2d',
    learningGoals: ['CIDRの / 数字が先頭から使うビット数であることを確認できる', '複数の候補から最長プレフィックス一致（Longest Prefix Match）を選べる', '一致がない場合にデフォルトルート（default route）が使われる理由を説明できる'],
    prerequisites: ['arp'],
    relatedTopics: ['dhcp', 'arp', 'dns-resolution', 'nat-napt', 'firewall'],
    nextTopics: ['dns-resolution'],
    glossaryTerms: ['ipv4', 'cidr', 'routing-table', 'longest-prefix-match', 'default-gateway', 'router'],
    status: 'available',
    simulatorPath: '/visualizer',
  },
  {
    id: 'dns-resolution',
    category: 'network',
    title: 'DNS：名前から接続先を見つける',
    shortTitle: 'DNS',
    summary: 'URLに含まれるホスト名を手がかりに、PCが設定済みのDNSリゾルバーへ問い合わせ、接続先の情報を得る代表的な流れです。',
    why: '人が覚えやすいドメイン名だけでは、IPネットワーク上で配送できません。名前とIPアドレスなどの情報を対応付ける仕組みが必要です。',
    visualization: 'hybrid-3d',
    learningGoals: ['DNSがURL全体ではなく主にホスト名を扱うことを説明できる', 'PC・再帰リゾルバ・上流DNSの役割を大まかに区別できる', 'DNS応答を受け取った後に、別途ウェブサーバーへの通信が始まることを理解する'],
    prerequisites: ['arp', 'routing'],
    relatedTopics: ['dhcp', 'arp', 'routing', 'tcp-connection'],
    nextTopics: ['tcp-connection'],
    glossaryTerms: ['url', 'dns', 'ip', 'udp', 'tcp', 'router', 'ipv4'],
    status: 'available',
    simulatorPath: '/visualizer',
  },
  {
    id: 'tcp-connection',
    category: 'network',
    title: 'TCP：接続を確立してデータを順番に運ぶ',
    shortTitle: 'TCP接続',
    summary: 'クライアントとウェブサーバーがSYN / SYN + ACK / ACKで初期状態を確認し、順序や確認を扱う接続を始める代表的な流れです。',
    why: 'IPだけでは、データが正しい順番で届いたか、途中で不足したかを扱えません。TCPは、通信の両端で順序・確認・再送などを行うための基盤を提供します。',
    visualization: 'step-animation',
    learningGoals: ['3-way handshakeの3つのメッセージの向きと役割を追える', 'Sequence NumberがTCPのバイトストリーム上の位置に関係することを説明できる', 'DNSで接続先を得た後に、別途TCP接続が始まることを理解する'],
    prerequisites: ['dns-resolution'],
    relatedTopics: ['dns-resolution', 'nat-napt', 'firewall'],
    nextTopics: ['firewall'],
    glossaryTerms: ['tcp', 'syn', 'ack', 'port', 'ip', 'tls', 'https'],
    status: 'available',
    simulatorPath: '/visualizer',
  },
  {
    id: 'nat-napt',
    category: 'network',
    title: 'NAT / NAPT：家庭内から外へ出るときの変換',
    shortTitle: 'NAT / NAPT',
    summary: '家庭用ルーターなどで、内部のプライベートIPアドレスと外部側のIPアドレス・ポートの対応を管理する代表的な仕組みです。',
    why: '複数の家庭内端末が限られた外部側アドレスを共有する場面では、返信をどの端末へ戻すかを区別する対応表が必要になります。',
    visualization: 'step-animation',
    learningGoals: ['NATとNAPTの関係を大まかに説明できる', '送信時の変換と返信時の逆変換を追える', '対応表が返信先を判断するために必要なことを理解する'],
    prerequisites: ['arp', 'routing'],
    relatedTopics: ['arp', 'routing', 'dns-resolution', 'tcp-connection', 'firewall'],
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
    title: 'ファイアウォール（Firewall）：通信を許可・拒否する判断を追う',
    shortTitle: 'ファイアウォール',
    summary: '通信の送信元・宛先・プロトコル・ポート・状態などを条件に、定められたルールにもとづいて許可・拒否を判断する仕組みです。',
    why: 'ネットワーク境界やサーバーへ届く通信を、必要なものに絞ることで、公開するサービスの範囲を管理し、不要な到達を減らすためです。',
    visualization: 'interactive-2d',
    learningGoals: ['ファイアウォールが通信の条件とルールを照合することを説明できる', '許可ルールとデフォルト拒否（default deny）の違いを例で確認できる', 'ステートフルファイアウォール（Stateful Firewall）が既存の通信状態を利用できることを大まかに理解する'],
    prerequisites: ['routing'],
    relatedTopics: ['routing', 'nat-napt', 'tcp-connection'],
    glossaryTerms: ['firewall', 'ip', 'tcp', 'router', 'nat'],
    status: 'available',
    simulatorPath: '/visualizer',
  },
  {
    id: 'cpu-instruction-cycle',
    category: 'computer',
    title: 'CPU：命令を読み、解釈し、実行する',
    shortTitle: 'CPU命令実行',
    summary: 'CPUが命令を取得（フェッチ）し、解読（デコード）し、ALUなどで実行し、結果を書き戻す代表的な流れを追う教材です。',
    why: 'プログラムはそのままでは動きません。CPUが小さな命令として読み取り、データを取り出し、計算結果を保存する手順が必要です。',
    visualization: 'step-animation',
    learningGoals: ['命令取得（Fetch）/ 解読（Decode）/ 実行（Execute）/ 書き戻し（Writeback）の役割を順に説明できる', 'レジスタ（Register）・ALU・メモリ（Memory）が命令実行で担う役割を区別できる', '実際のCPUでは命令の重なりやキャッシュなどでより複雑になることを理解する'],
    prerequisites: [],
    relatedTopics: ['cache-memory', 'process-scheduling'],
    nextTopics: ['cache-memory'],
    glossaryTerms: ['cpu', 'instruction', 'program-counter', 'instruction-register', 'control-unit', 'fetch', 'decode', 'execute', 'writeback', 'register', 'alu', 'cache', 'memory'],
    status: 'available',
    simulatorPath: '/visualizer',
  },
  {
    id: 'process-scheduling',
    category: 'os',
    title: 'OS：複数の処理を切り替えて進める',
    shortTitle: 'プロセスとスケジューラー',
    summary: 'OSがプロセス（Process）の状態を管理し、スケジューラー（Scheduler）がCPUを割り当て、必要に応じてコンテキストスイッチ（Context Switch）する代表的な流れを追う教材です。',
    why: '複数のアプリケーションが同じCPUや入出力装置を使うため、誰にいつ処理時間を渡すかを調整する必要があります。',
    visualization: 'step-animation',
    learningGoals: ['プロセス（Process）の実行可能・実行中・待機という状態を区別できる', 'スケジューラー（Scheduler）とコンテキストスイッチ（Context Switch）の役割を説明できる', 'スレッド（Thread）がプロセス内の実行単位として使われる理由を大まかに理解する'],
    prerequisites: ['virtual-memory-paging'],
    relatedTopics: ['cpu-instruction-cycle', 'cache-memory', 'virtual-memory-paging', 'database-transaction'],
    nextTopics: [],
    glossaryTerms: ['process', 'thread', 'scheduler', 'context-switch', 'ready-queue', 'io', 'time-slice', 'interrupt', 'virtual-memory'],
    status: 'available',
  },
  {
    id: 'database-transaction',
    category: 'database',
    title: 'データベース：更新をひとまとまりに保つ',
    shortTitle: 'トランザクション',
    summary: '口座間の振替を例に、トランザクション（Transaction）、ロック（Lock）、コミット（Commit）、ロールバック（Rollback）が更新の整合性をどう支えるかを追う教材です。',
    why: '複数の更新を別々に確定すると、障害や同時更新によって途中だけ反映された不整合な状態が残るおそれがあります。',
    visualization: 'step-animation',
    learningGoals: ['トランザクション（Transaction）が複数操作を1つの単位として扱う理由を説明できる', 'コミット（Commit）とロールバック（Rollback）の違いを追える', 'ロック（Lock）が同時更新の競合を減らす役割を大まかに理解する'],
    prerequisites: [],
    relatedTopics: ['process-scheduling', 'load-balancing', 'database-index'],
    nextTopics: ['database-index'],
    glossaryTerms: ['database', 'transaction', 'acid', 'lock', 'commit', 'rollback', 'isolation-level', 'mvcc', 'row-lock', 'index'],
    status: 'available',
  },
  {
    id: 'tls-handshake',
    category: 'security',
    title: 'TLS：接続先を確かめ、通信を保護する',
    shortTitle: 'TLSハンドシェイク',
    summary: 'クライアントとサーバーが対応方式を確認し、証明書（Certificate）を検証して、通信に使うセッション鍵（Session Key）を合意する代表的な流れを追う教材です。',
    why: 'インターネット上では経路を通る第三者から、通信内容を守り、接続先が意図した相手か確認する仕組みが必要です。',
    visualization: 'step-animation',
    learningGoals: ['TLSが暗号化だけでなく接続先の確認にも関係することを説明できる', '証明書（Certificate）・公開鍵（Public Key）・セッション鍵（Session Key）の役割を大まかに区別できる', 'TLSの実際の手順や暗号方式はバージョン・設定で異なることを理解する'],
    prerequisites: ['tcp-connection'],
    relatedTopics: ['tcp-connection', 'firewall', 'load-balancing', 'digital-signature'],
    nextTopics: ['load-balancing'],
    glossaryTerms: ['tls', 'certificate', 'public-key', 'private-key', 'shared-secret', 'session-key', 'sni', 'https', 'tcp'],
    status: 'available',
    simulatorPath: '/visualizer',
  },
  {
    id: 'load-balancing',
    category: 'system',
    title: 'システム構成：複数のサーバーへ処理を分ける',
    shortTitle: 'ロードバランサー',
    summary: 'ロードバランサー（Load Balancer）が入口でリクエスト（Request）を受け、ヘルスチェック（Health Check）を参考に複数のウェブサーバーへ振り分ける代表的な構成を操作する教材です。',
    why: '1台のサーバーだけに処理を集中させず、負荷や障害に備えて複数の処理先を使えるようにするためです。',
    visualization: 'interactive-2d',
    learningGoals: ['ロードバランサー（Load Balancer）が入口でリクエスト（Request）を振り分ける役割を説明できる', 'ヘルスチェック（Health Check）が送信先の判断に役立つことを理解する', 'ロードバランサーだけで可用性や性能が自動的に保証されるわけではないことを理解する'],
    prerequisites: [],
    relatedTopics: ['tls-handshake', 'database-transaction', 'system-failover'],
    nextTopics: ['database-transaction'],
    glossaryTerms: ['load-balancer', 'reverse-proxy', 'health-check', 'round-robin', 'least-connections', 'l4-l7', 'session-affinity', 'database', 'https'],
    status: 'available',
  },
  {
    id: 'binary-search',
    category: 'algorithms',
    title: 'アルゴリズム：整列済みの値を半分ずつ探す',
    shortTitle: '二分探索',
    summary: '整列済みの配列（Array）で中央の値を比較し、探索範囲を半分ずつ狭める二分探索（Binary Search）を1手ずつ操作する教材です。',
    why: '最初から順に確認するのではなく、データの並び順を利用して比較回数を減らせる場面があるためです。',
    visualization: 'interactive-2d',
    learningGoals: ['二分探索（Binary Search）で配列（Array）が整列済みである必要を説明できる', '中央との比較から左・右どちらを残すか判断できる', '探索範囲が半分ずつ減ることを操作して確認できる'],
    prerequisites: [],
    relatedTopics: ['database-transaction', 'graph-traversal'],
    nextTopics: ['graph-traversal'],
    glossaryTerms: ['algorithm', 'array', 'binary-search', 'time-complexity', 'index'],
    status: 'available',
  },
  {
    id: 'cache-memory',
    category: 'computer',
    title: 'キャッシュ（Cache）：CPUの待ち時間を小さくする',
    shortTitle: 'キャッシュとメモリ',
    summary: 'CPUが読みたいデータをキャッシュ（Cache）で探し、キャッシュヒット（Cache Hit）ならすぐに使い、キャッシュミス（Cache Miss）なら主記憶（Main Memory）から取り込む代表的な流れを追う教材です。',
    why: 'CPUと主記憶（Main Memory）では応答時間に差があるため、よく使う命令やデータの近くに高速なコピーを置き、待ち時間を減らす必要があります。',
    visualization: 'step-animation',
    learningGoals: ['キャッシュヒット（Cache Hit）とキャッシュミス（Cache Miss）の違いを説明できる', 'キャッシュライン（Cache Line）へデータを取り込む理由を大まかに理解する', 'キャッシュの効果はアクセスの局所性や方式に依存することを理解する'],
    prerequisites: ['cpu-instruction-cycle'],
    relatedTopics: ['cpu-instruction-cycle', 'virtual-memory-paging'],
    nextTopics: ['virtual-memory-paging'],
    glossaryTerms: ['cpu', 'cache', 'cache-line', 'cache-hit', 'cache-miss', 'memory'],
    status: 'available',
    simulatorPath: '/visualizer',
  },
  {
    id: 'virtual-memory-paging',
    category: 'os',
    title: '仮想メモリ（Virtual Memory）：アドレス空間を分けて扱う',
    shortTitle: '仮想メモリとページング',
    summary: 'プロセス（Process）が使う仮想アドレス（Virtual Address）をページテーブル（Page Table）で物理メモリ（Physical Memory）のフレーム（Frame）へ対応付け、必要なページがないときはページフォルト（Page Fault）を処理する代表例を追う教材です。',
    why: '各Processを隔離し、物理メモリ上の配置と独立した使いやすいアドレス空間を提供するためです。',
    visualization: 'step-animation',
    learningGoals: ['仮想アドレス（Virtual Address）と物理アドレス（Physical Address）の役割を区別できる', 'ページテーブル（Page Table）とページフォルト（Page Fault）の関係を追える', '実際のTLB・ページ置換・ストレージI/Oはより複雑であることを理解する'],
    prerequisites: ['cache-memory'],
    relatedTopics: ['cache-memory', 'process-scheduling'],
    nextTopics: ['process-scheduling'],
    glossaryTerms: ['virtual-memory', 'paging', 'page-table', 'page-fault', 'tlb', 'memory', 'process'],
    status: 'available',
  },
  {
    id: 'database-index',
    category: 'database',
    title: 'データベースインデックス：目的の行へ近道を作る',
    shortTitle: 'データベースインデックス',
    summary: 'B木（B-tree）系のインデックス（Index）をたどり、根ノード（Root）・中間ノード（Internal Node）・葉ノード（Leaf Node）から目的の行（Row）の位置へ近づく代表的な検索を操作する教材です。',
    why: '多くの行（Row）を最初から確認せず、検索条件に合うデータへ効率よく近づくためです。',
    visualization: 'interactive-2d',
    learningGoals: ['インデックス（Index）が検索の近道になる理由を説明できる', '根ノード（Root）・中間ノード（Internal Node）・葉ノード（Leaf Node）の役割を大まかに区別できる', 'インデックスにも更新コストや検索条件との相性があることを理解する'],
    prerequisites: ['database-transaction'],
    relatedTopics: ['database-transaction', 'binary-search'],
    nextTopics: [],
    glossaryTerms: ['database', 'index', 'b-tree', 'leaf-node', 'row', 'binary-search'],
    status: 'available',
  },
  {
    id: 'digital-signature',
    category: 'security',
    title: '電子署名（Digital Signature）：改ざんと署名者を確かめる',
    shortTitle: '電子署名',
    summary: 'データのハッシュ（Hash）を秘密鍵（Private Key）で署名し、公開鍵（Public Key）で検証することで、改ざん検出と署名者の確認を行う代表的な流れを追う教材です。',
    why: '通信や配布物が途中で書き換えられていないこと、意図した鍵の所有者が署名したことを確かめる仕組みが必要だからです。',
    visualization: 'step-animation',
    learningGoals: ['ハッシュ（Hash）・秘密鍵（Private Key）・公開鍵（Public Key）が署名で担う役割を区別できる', '署名の検証と改ざん検出の関係を説明できる', '電子署名（Digital Signature）と暗号化は別の目的を持つことを理解する'],
    prerequisites: ['tls-handshake'],
    relatedTopics: ['tls-handshake'],
    nextTopics: [],
    glossaryTerms: ['digital-signature', 'hash', 'private-key', 'public-key', 'certificate'],
    status: 'available',
  },
  {
    id: 'system-failover',
    category: 'system',
    title: 'フェイルオーバー（Failover）：障害時に役割を引き継ぐ',
    shortTitle: 'フェイルオーバー',
    summary: '稼働中のノード（Node）に障害が起きたとき、ヘルスチェック（Health Check）や監視をもとに待機系へ役割を切り替える代表的な流れを追う教材です。',
    why: '1つの機器やサービスの障害で、利用者がサービスを使えなくなる時間を減らすためです。',
    visualization: 'step-animation',
    learningGoals: ['冗長化とフェイルオーバー（Failover）の目的を説明できる', '障害検出から切替までに判断が必要なことを理解する', 'データ同期・誤検知・復旧設計も重要であることを理解する'],
    prerequisites: ['load-balancing'],
    relatedTopics: ['load-balancing', 'database-transaction'],
    nextTopics: [],
    glossaryTerms: ['failover', 'redundancy', 'health-check', 'active-standby', 'load-balancer'],
    status: 'available',
  },
  {
    id: 'graph-traversal',
    category: 'algorithms',
    title: 'グラフ（Graph）：つながりを順番にたどる',
    shortTitle: 'BFS / DFS',
    summary: 'グラフ（Graph）のノード（Node）とエッジ（Edge）をたどり、BFSではキュー（Queue）、DFSではスタック（Stack）を使って訪問順を変える基本的な探索を操作する教材です。',
    why: '経路、依存関係、ウェブページのリンクのように、値が単純な一直線に並ばないデータのつながりを調べるためです。',
    visualization: 'interactive-2d',
    learningGoals: ['グラフ（Graph）のノード（Node）とエッジ（Edge）の意味を説明できる', 'BFSとDFSで探索順が異なることを操作できる', 'BFSが無重みグラフの最短手数探索に使える条件を大まかに理解する'],
    prerequisites: ['binary-search'],
    relatedTopics: ['binary-search', 'routing'],
    nextTopics: [],
    glossaryTerms: ['graph', 'node', 'edge', 'bfs', 'dfs', 'queue', 'stack', 'algorithm'],
    status: 'available',
  },
]

/**
 * A short, plain-language doorway for each lesson.  The full lesson still
 * contains the precise explanation and interactive diagram; this data only
 * helps a reader who has not encountered the vocabulary yet decide where to
 * begin.
 */
export type BeginnerTopicGuide = {
  beforeYouStart: string
  keyTerms: Array<{
    termId: string
    label: string
    explanation: string
  }>
  connection: string
}

export const BEGINNER_TOPIC_GUIDES: Record<string, BeginnerTopicGuide> = {
  dhcp: {
    beforeYouStart: '新しいPCやスマートフォンをWi-Fiや有線LANにつなぐと、すぐ通信できることがあります。その「通信に必要な住所や出口の情報は、どこから来るのだろう？」という疑問から始めます。',
    keyTerms: [
      { termId: 'dhcp', label: 'DHCP', explanation: 'ネットワークに参加する機器へ、必要な設定を渡す仕組みです。' },
      { termId: 'ipv4', label: 'IPアドレス', explanation: 'ネットワーク上で、届け先を表すための住所のような情報です。' },
      { termId: 'default-gateway', label: 'デフォルトゲートウェイ', explanation: '別のネットワークへ出るときに、まず渡す出口の機器です。' },
    ],
    connection: 'ここで受け取るIPアドレス・DNSサーバー・デフォルトゲートウェイの情報が、次のARP、名前解決、ウェブアクセスの出発点になります。',
  },
  arp: {
    beforeYouStart: 'PCがウェブサーバーへ送る前には、まず家庭内LANで「次に渡す相手」を見つける必要があります。IPアドレスと、LANで使う宛先情報は別のものだと考えるところから始めましょう。',
    keyTerms: [
      { termId: 'ipv4', label: 'IPアドレス', explanation: '最終的にどのネットワーク・機器へ届けるかを考えるための住所です。' },
      { termId: 'mac', label: 'MACアドレス', explanation: '同じLANの次の相手へフレームを渡すときに使う宛先情報です。' },
      { termId: 'ethernet', label: 'イーサネット', explanation: '家庭や職場の有線LANなどで、機器どうしをつなぐ代表的な仕組みです。' },
    ],
    connection: 'ARPで次の相手のMACアドレスが分かると、PCはイーサネットフレームをホームルーターへ送り、ルーターが次の経路を選べるようになります。',
  },
  routing: {
    beforeYouStart: '郵便物を送るときに、配達員が地図を見て次の中継地点を選ぶように、ルーターも宛先を見て次の送り先を決めます。1台のPCを直接探すのではなく、ネットワークのまとまりを手がかりにします。',
    keyTerms: [
      { termId: 'ipv4', label: 'IPアドレス', explanation: 'ルーターが「どのネットワークへ向けるか」を判断する手がかりです。' },
      { termId: 'routing-table', label: 'ルーティングテーブル', explanation: '宛先のまとまりと、次に渡す先を並べた案内表です。' },
      { termId: 'default-gateway', label: 'デフォルトゲートウェイ', explanation: '家庭内PCから外部ネットワークへ出るための最初の出口です。' },
    ],
    connection: '経路が選べると、DNSサーバーやウェブサーバーへ向かうパケットが、ルーターをまたいで次のネットワークへ進めます。',
  },
  'dns-resolution': {
    beforeYouStart: 'ブラウザに入力する「example.com」のような名前は、人には覚えやすい一方で、ネットワークが配送に使う住所とは別です。名前から接続先を知る流れを見ていきます。',
    keyTerms: [
      { termId: 'url', label: 'URL', explanation: 'ブラウザへ渡すウェブ上の場所を表す文字列です。' },
      { termId: 'dns', label: 'DNS', explanation: '名前とIPアドレスなどの情報を対応付ける仕組みです。' },
      { termId: 'ip', label: 'IPアドレス', explanation: 'ネットワーク上で接続先をたどるための住所です。' },
    ],
    connection: 'DNSで接続先の情報を得たあと、PCはその相手へTCP接続を始め、続いてTLSやHTTPの通信へ進みます。',
  },
  'tcp-connection': {
    beforeYouStart: '宛先のIPアドレスが分かっても、アプリケーション同士がすぐに安心してデータを送り合えるわけではありません。TCPは、両端が通信を始める準備をそろえる役目です。',
    keyTerms: [
      { termId: 'tcp', label: 'TCP', explanation: '順番・確認・再送などを扱いながら、アプリケーション間の通信を支える仕組みです。' },
      { termId: 'syn', label: 'SYN', explanation: 'TCP接続を始めるときに使う、最初の合図の一つです。' },
      { termId: 'port', label: 'ポート番号', explanation: '同じPCの中で、どの通信先を扱うかを区別する番号です。' },
    ],
    connection: 'TCP接続ができると、その上でTLSが接続先を確かめて通信を保護し、HTTPのリクエストを送れるようになります。',
  },
  'nat-napt': {
    beforeYouStart: '家庭内のPCには、家庭の外からはそのまま使わない住所が割り当てられることがよくあります。ホームルーターが内側と外側の情報をどう対応させるかを追います。',
    keyTerms: [
      { termId: 'nat', label: 'NAT', explanation: '内側と外側で使うIPアドレスを対応付ける、アドレス変換の考え方です。' },
      { termId: 'napt', label: 'NAPT', explanation: 'IPアドレスだけでなく、ポート番号も使って複数の通信を区別する代表例です。' },
      { termId: 'router', label: 'ホームルーター', explanation: '家庭内LANとインターネット側の境目で、転送や変換を行う機器です。' },
    ],
    connection: 'NAT / NAPTの対応表があることで、外側から返ってきた通信を、正しい家庭内PCの通信へ戻すことができます。',
  },
  ipv6: {
    beforeYouStart: 'IPアドレスには、見慣れた「192.168...」形式のIPv4だけでなく、より長い16進数表記を使うIPv6があります。まずは住所の書き方が違うものだと捉えて大丈夫です。',
    keyTerms: [
      { termId: 'ipv6', label: 'IPv6', explanation: '128ビットのアドレスを使うIPの方式です。' },
      { termId: 'ipv4', label: 'IPv4', explanation: '32ビットのアドレスを使う、現在も広く使われるIPの方式です。' },
      { termId: 'router', label: 'ルーター', explanation: '宛先のネットワークへ向けて、パケットを次の機器へ渡します。' },
    ],
    connection: 'IPv6でも、宛先に向けてルーターが経路を選ぶ考え方は重要です。ただしLAN内の近隣探索にはARPではなくNDPを使います。',
  },
  firewall: {
    beforeYouStart: 'ネットワークにつながるだけでは、すべての通信を無条件に受け入れるべきとは限りません。ファイアウォールは「どの通信を通してよいか」を条件で考える門番のような役割です。',
    keyTerms: [
      { termId: 'firewall', label: 'ファイアウォール', explanation: '通信の条件をルールと照合し、許可や拒否を判断する仕組みです。' },
      { termId: 'ip', label: 'IPアドレス', explanation: '送信元や宛先を条件として見るときの情報の一つです。' },
      { termId: 'port', label: 'ポート番号', explanation: 'ウェブなど、どの種類の通信を扱うかを区別する手がかりです。' },
    ],
    connection: 'ファイアウォールを通過した通信は、目的のサービスへ届きます。TCPやTLSと組み合わせて、必要な通信だけを安全に扱うことにつながります。',
  },
  'cpu-instruction-cycle': {
    beforeYouStart: 'アプリを開いたり文字を入力したりすると、PCの中ではCPUが小さな命令を順に実行しています。「プログラムが動く」を、命令を読む・意味を決める・計算するという流れに分けて見ます。',
    keyTerms: [
      { termId: 'cpu', label: 'CPU', explanation: '命令を読み取り、計算や判断を実行する中心の部品です。' },
      { termId: 'instruction', label: '命令', explanation: 'CPUに「何をするか」を伝える、小さな処理の単位です。' },
      { termId: 'register', label: 'レジスタ', explanation: 'CPUの内部で、計算に使う値を短時間置いておく高速な場所です。' },
    ],
    connection: 'CPUが命令を実行するときは、キャッシュやメモリからデータを読みます。その土台の上でOSが複数の処理を切り替えます。',
  },
  'cache-memory': {
    beforeYouStart: 'CPUはとても速く計算できますが、必要なデータが届くまで待つと力を発揮しにくくなります。よく使うものを近くに置く「キャッシュ」という工夫を見ます。',
    keyTerms: [
      { termId: 'cpu', label: 'CPU', explanation: '計算を実行するため、データや命令を取り出して使います。' },
      { termId: 'cache', label: 'キャッシュ', explanation: 'CPUの近くに、よく使うデータのコピーを置く高速な記憶領域です。' },
      { termId: 'memory', label: '主記憶', explanation: '実行中のプログラムやデータを置く、CPUより大きな記憶領域です。' },
    ],
    connection: 'キャッシュと主記憶の役割の違いを知ると、仮想メモリや「CPUがメモリ待ちになる」場面を理解しやすくなります。',
  },
  'virtual-memory-paging': {
    beforeYouStart: 'アプリごとに大きな連続したメモリを使えているように見えても、実際のメモリの置き場所はもっと細かく管理されています。その見え方と実体をつなぐ仕組みを見ます。',
    keyTerms: [
      { termId: 'virtual-memory', label: '仮想メモリ', explanation: '各プロセスが使う住所と、実際のメモリの置き場所を分けて扱う仕組みです。' },
      { termId: 'paging', label: 'ページング', explanation: 'メモリを一定の大きさに分けて対応付ける考え方です。' },
      { termId: 'process', label: 'プロセス', explanation: 'OSが管理する、実行中または実行できるプログラムの単位です。' },
    ],
    connection: '仮想メモリにより、複数のプロセスは互いの領域を分けて使えます。そのプロセスをCPUへ順番に割り当てるのが次のOSの役目です。',
  },
  'process-scheduling': {
    beforeYouStart: 'PCではブラウザ、音楽再生、保存処理など、複数の仕事が同時に進んでいるように見えます。CPUの時間をどの仕事へ渡すかをOSが調整する視点で見ていきます。',
    keyTerms: [
      { termId: 'process', label: 'プロセス', explanation: 'OSが仕事として管理する、プログラムの実行単位です。' },
      { termId: 'scheduler', label: 'スケジューラー', explanation: '次にどの処理へCPUを使わせるかを選ぶOSの仕組みです。' },
      { termId: 'context-switch', label: 'コンテキストスイッチ', explanation: 'CPUが別の処理へ切り替わるときに、必要な状態を保存・復元することです。' },
    ],
    connection: 'CPUの命令実行や仮想メモリと組み合わさることで、複数のアプリが1台のPCを安全に共有して動けるようになります。',
  },
  'database-transaction': {
    beforeYouStart: 'ネット通販の注文や口座振替では、いくつかのデータ更新が「全部成功」か「全部失敗」になってほしい場面があります。途中だけ変更される困りごとから考えます。',
    keyTerms: [
      { termId: 'database', label: 'データベース', explanation: 'アプリが使うデータを、保存・検索・更新できる形で扱う仕組みです。' },
      { termId: 'transaction', label: 'トランザクション', explanation: '複数の更新を、ひとまとまりの処理として扱う単位です。' },
      { termId: 'lock', label: 'ロック', explanation: '同じデータを同時に変えて矛盾しないように、順番を調整する仕組みです。' },
    ],
    connection: 'トランザクションが更新の正しさを支え、インデックスが必要な行を速く見つける手助けをします。ウェブサービスの裏側では両方が使われます。',
  },
  'database-index': {
    beforeYouStart: '住所録から名前を探すとき、最初のページから順に読むより索引を使うほうが早いことがあります。データベースのインデックスも、目的の行への近道です。',
    keyTerms: [
      { termId: 'database', label: 'データベース', explanation: '多くのデータを保存し、条件に合うものを検索・更新する仕組みです。' },
      { termId: 'index', label: 'インデックス', explanation: '目的のデータの場所へ近づくための補助的な構造です。' },
      { termId: 'row', label: '行', explanation: '表形式のデータベースで、1件分のデータを表す単位です。' },
    ],
    connection: 'インデックスは検索を速くしますが、追加・更新のたびに整える仕事も必要です。トランザクションと合わせて、速さと正しさの両方を考える入口になります。',
  },
  'tls-handshake': {
    beforeYouStart: 'HTTPSの鍵マークを見るとき、ブラウザは単に文字を暗号化しているだけではありません。通信を始める前に、相手が意図したサーバーかを確かめ、共有する秘密を準備します。',
    keyTerms: [
      { termId: 'tls', label: 'TLS', explanation: '通信内容を守り、接続先の確認にも使う仕組みです。' },
      { termId: 'certificate', label: '証明書', explanation: '接続先の公開鍵などを、信頼の仕組みと結び付ける情報です。' },
      { termId: 'session-key', label: 'セッション鍵', explanation: '実際の通信データを効率よく守るために使う、一時的な共通の鍵です。' },
    ],
    connection: 'TCPで通信を始めたあとにTLSが保護を整え、その上でHTTPのリクエストやレスポンスを安全にやり取りします。',
  },
  'digital-signature': {
    beforeYouStart: 'ダウンロードしたファイルや受け取った情報が、途中で書き換えられていないかを確かめたい場面があります。電子署名は「内容」と「署名した人」を確かめるための仕組みです。',
    keyTerms: [
      { termId: 'digital-signature', label: '電子署名', explanation: '改ざん検出と、対応する秘密鍵の所有者による署名を確かめる仕組みです。' },
      { termId: 'hash', label: 'ハッシュ', explanation: 'データから作る短い要約値で、内容が変わると通常は値も変わります。' },
      { termId: 'public-key', label: '公開鍵', explanation: '署名を確かめるために共有できる鍵です。秘密鍵とは役割が異なります。' },
    ],
    connection: '電子署名の考え方は、TLSで証明書を検証するときにも関わります。暗号化と署名は目的が違うことを比べてみましょう。',
  },
  'load-balancing': {
    beforeYouStart: 'たくさんの人が同じウェブサイトを使うと、1台のサーバーだけでは処理が集中することがあります。入口でリクエストを分ける役割を、交通整理のように見ます。',
    keyTerms: [
      { termId: 'load-balancer', label: 'ロードバランサー', explanation: '受け取ったリクエストを複数のサーバーへ振り分ける仕組みです。' },
      { termId: 'health-check', label: 'ヘルスチェック', explanation: '送り先のサーバーが応答できそうかを確かめるための確認です。' },
      { termId: 'https', label: 'HTTPS', explanation: 'ウェブの通信をTLSで保護して使う代表的な方法です。' },
    ],
    connection: 'ロードバランサーの先に複数のウェブサーバーを置くと、負荷を分けたり、一部の障害時に別のサーバーへ回したりする設計につながります。',
  },
  'system-failover': {
    beforeYouStart: '使っているサービスの機器が1台故障しても、できるだけ止まらないでほしい場面があります。異常を見つけ、別の機器へ役割を渡すまでを見ます。',
    keyTerms: [
      { termId: 'failover', label: 'フェイルオーバー', explanation: '障害が起きたときに、別の健全な系へ役割を切り替える仕組みです。' },
      { termId: 'redundancy', label: '冗長化', explanation: '1つが故障しても続けられるよう、予備や複数の系を用意する考え方です。' },
      { termId: 'health-check', label: 'ヘルスチェック', explanation: '機器やサービスが正常に応答できるかを確認する仕組みです。' },
    ],
    connection: 'ロードバランサーによる振り分けとフェイルオーバーを組み合わせると、障害があってもサービスを続けやすいシステム構成につながります。',
  },
  'binary-search': {
    beforeYouStart: '辞書で単語を探すとき、最初から1ページずつ読むより、真ん中を開いて探す範囲を半分にするほうが速いことがあります。その考え方を配列で試します。',
    keyTerms: [
      { termId: 'array', label: '配列', explanation: '値を順番に並べて扱う、基本的なデータの入れ物です。' },
      { termId: 'binary-search', label: '二分探索', explanation: '中央と比べながら、探す範囲を半分ずつ小さくする方法です。' },
      { termId: 'algorithm', label: 'アルゴリズム', explanation: '問題を解くための、手順の組み立て方です。' },
    ],
    connection: '二分探索は「値が整列している」ことを利用します。この考え方は、データベースのインデックスや木構造を理解する土台にもなります。',
  },
  'graph-traversal': {
    beforeYouStart: '路線図や人間関係のように、情報が一直線に並ばず、複数のつながりを持つことがあります。グラフは、そのような「点と線」の関係を表す方法です。',
    keyTerms: [
      { termId: 'graph', label: 'グラフ', explanation: '点と、それらを結ぶ線で、つながりを表すデータ構造です。' },
      { termId: 'node', label: 'ノード', explanation: 'グラフの中の点で、駅・人・機器などを表せます。' },
      { termId: 'edge', label: 'エッジ', explanation: 'ノードどうしのつながりを表す線です。' },
    ],
    connection: 'グラフ探索は、ネットワークの経路、サービスの依存関係、地図など、つながりを順に調べる多くの場面につながります。',
  },
}

export const LEARNING_TOPIC_BY_ID = new Map(LEARNING_TOPICS.map(topic => [topic.id, topic]))

/**
 * This is an optional recommended route, not a protocol dependency graph or
 * the exact order in which every web request is processed.
 */
export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'network-foundations',
    title: 'ウェブアクセスの土台を学ぶ',
    description: '3Dシミュレーションで全体像を見た後に、ネットワークへ参加してから名前を解決し、通信を始めるまでを理解しやすい順番でたどります。',
    topicIds: ['dhcp', 'arp', 'routing', 'dns-resolution', 'tcp-connection'],
    branches: [
      { fromTopicId: 'routing', title: '家庭や組織の境界を学ぶ', topicIds: ['nat-napt', 'firewall'] },
      { fromTopicId: 'arp', title: 'IPv6と比較して学ぶ', topicIds: ['ipv6'] },
    ],
  },
  {
    id: 'computer-os-foundations',
    title: 'PCの中で処理が進む仕組みを学ぶ',
    description: '命令を実行するCPUから、複数の仕事を切り替えるOSまでを、理解しやすい順番でたどります。',
    topicIds: ['cpu-instruction-cycle', 'cache-memory', 'virtual-memory-paging', 'process-scheduling'],
  },
  {
    id: 'web-service-foundations',
    title: 'ウェブサービスを支える仕組みを学ぶ',
    description: '通信を保護するTLS、入口で分けるロードバランサー、データを整合的に更新するトランザクションとインデックスをつなげて学びます。',
    topicIds: ['tls-handshake', 'load-balancing', 'database-transaction', 'database-index'],
    branches: [
      { fromTopicId: 'tls-handshake', title: '署名の仕組みを深める', topicIds: ['digital-signature'] },
    ],
  },
  {
    id: 'system-resilience',
    title: '止まりにくいサービスを考える',
    description: '入口で処理を分けるロードバランサーから、障害時に役割を引き継ぐフェイルオーバーまでをたどります。',
    topicIds: ['load-balancing', 'system-failover'],
  },
  {
    id: 'algorithm-foundations',
    title: 'データを効率よく探す考え方を学ぶ',
    description: '整列済みデータを半分ずつ絞る方法と、つながりを順番にたどる方法を操作して比べます。',
    topicIds: ['binary-search', 'graph-traversal'],
  },
]

export function learningPathForTopic(topicId: string) {
  return LEARNING_PATHS.find(path => path.topicIds.includes(topicId) || path.branches?.some(branch => branch.topicIds.includes(topicId))) ?? null
}

export function learningTopicFromPath(path: string) {
  if (!path.startsWith('/learn/')) return null
  try {
    return LEARNING_TOPIC_BY_ID.get(decodeURIComponent(path.slice('/learn/'.length))) ?? null
  } catch {
    return null
  }
}
