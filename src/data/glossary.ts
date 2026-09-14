import type { GlossaryBeginnerGuide, GlossaryCategory, GlossaryCategoryId, GlossaryDetailSection, GlossaryTerm } from '../types/glossary'

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  { id: 'computer', title: 'コンピュータ内部', description: 'CPUや命令実行など、PCの中で起きる処理です。' },
  { id: 'os', title: 'OS', description: 'プロセス、スケジューリング、仮想メモリなど、実行を調整する仕組みです。' },
  { id: 'database', title: 'データベース', description: 'データの整合性、検索、同時実行を支える仕組みです。' },
  { id: 'system', title: 'システム構成', description: '複数のサービスやサーバーを組み合わせて運用するための仕組みです。' },
  { id: 'algorithms', title: 'アルゴリズムとデータ構造', description: '問題を効率よく解く手順と、データの持ち方に関係する用語です。' },
  { id: 'web', title: 'Webアクセス', description: 'URLからHTTP/HTTPSでWebサーバーへ届くまでに関係する用語です。' },
  { id: 'security', title: 'セキュリティ', description: '通信やサービスを守るための、許可判断や防御に関係する用語です。' },
  { id: 'network', title: 'ネットワーク通信', description: 'データを端末からネットワークへ運ぶ仕組みをまとめた上位分類です。' },
  { id: 'transport', title: 'トランスポート層', description: 'TCPやUDP、ポート番号、到達確認に関係する用語です。', parent: 'network' },
  { id: 'ip-routing', title: 'IPとルーティング', description: 'IPアドレス、経路選択、NATなど、ネットワークを越える配送に関係する用語です。', parent: 'network' },
  { id: 'link', title: 'LANとリンク層', description: 'Ethernet、MACアドレス、Switch、無線LANなど、近い機器同士の接続に関係する用語です。', parent: 'network' },
  { id: 'access', title: '回線とISP', description: 'FTTH、ONU / ONT、ISPなど、家庭や組織を外部ネットワークへつなぐ用語です。', parent: 'network' },
]

const CATEGORY_BY_ID = new Map(GLOSSARY_CATEGORIES.map(category => [category.id, category]))

export function glossaryCategoryTrail(categoryId: GlossaryCategoryId): GlossaryCategory[] {
  const trail: GlossaryCategory[] = []
  let current = CATEGORY_BY_ID.get(categoryId)
  while (current) {
    trail.unshift(current)
    current = current.parent ? CATEGORY_BY_ID.get(current.parent) : undefined
  }
  return trail
}

const DEEP_DIVES: Record<string, GlossaryDetailSection[]> = {
  alu: [
    { title: '内部で何をする？', body: 'ALUはレジスタから受け取ったビット列に対して、加算、減算、AND、OR、比較などを行います。命令の種類はControl Unitが指定し、結果はレジスタへ戻されます。' },
    { title: '計算結果以外の情報', body: '多くのCPUでは、結果が0か、桁あふれしたか、負になったかといった状態をフラグとして保持します。後続の条件分岐命令はこのフラグを参照できます。' },
  ],
  url: [
    { title: 'URLを分解すると', body: 'https://shop.example.test/products?category=pc なら、https は方式、shop.example.test はホスト名、/products はパス、?category=pc はクエリです。ブラウザはこれらから必要な通信処理を決めます。' },
    { title: '通信で使われない部分', body: 'URLの # 以降にあるフラグメントは、通常ブラウザ内の表示位置を示すための情報です。HTTPリクエストのターゲットとしてサーバーへ送られません。' },
  ],
  dns: [
    { title: '名前解決の流れ', body: 'クライアントは通常、設定済みのDNSリゾルバへ名前を問い合わせます。リゾルバはキャッシュを確認し、必要に応じて権威DNSなどをたどり、回答を返します。' },
    { title: 'IPアドレスだけではない', body: 'A・AAAAレコードはIPアドレスを扱う代表例です。DNSにはメール配送先を示すMX、別名を示すCNAME、サービス情報を示すSRVなど、さまざまなレコードがあります。' },
  ],
  tcp: [
    { title: '信頼性をどう作る？', body: 'TCPはSequence NumberとAcknowledgment Numberを使い、どのバイトまで届いたかを両端で共有します。欠けたデータを検出した場合は、状況に応じて再送します。' },
    { title: '接続の単位', body: 'TCPの通信は送信元IP・送信元Port・宛先IP・宛先Portとプロトコルの組み合わせで区別されます。同じ端末でも複数の接続を同時に扱えます。' },
  ],
  udp: [
    { title: 'TCPとの役割の違い', body: 'UDPはTCPのような接続確立、順序制御、再送を標準機能として持ちません。そのため、必要な信頼性や順序制御をアプリケーション側で選べます。' },
    { title: '速さを保証するものではない', body: 'UDPはヘッダが小さく処理が単純な場合がありますが、ネットワークの混雑やアプリケーションの実装によって遅延は変わります。「UDPなら必ず速い」という意味ではありません。' },
  ],
  ip: [
    { title: '配送と経路選択', body: 'IPパケットには送信元・宛先IPアドレスが含まれます。ルーターは主に宛先IPアドレスを参照し、Routing Tableから次の転送先を選びます。' },
    { title: 'IPだけで保証しないこと', body: 'IPはパケットの到達、順序、重複排除を保証しません。必要に応じてTCPやアプリケーションの仕組みが、その上で追加の制御を提供します。' },
  ],
  ipv4: [
    { title: '32ビットの表し方', body: 'IPv4アドレスは32ビットで、通常は8ビットずつを10進数で区切って表記します。192.168.1.10 は4つのオクテットから成ります。' },
    { title: 'ネットワークとホスト', body: 'CIDR表記の /24 などは、先頭から何ビットをネットワークの識別に使うかを表します。残りのビットは、そのネットワーク内のホストを区別するために使われます。' },
  ],
  ipv6: [
    { title: 'アドレス空間', body: 'IPv6は128ビットのアドレスを使い、16ビットごとに16進数で表記します。非常に大きなアドレス空間を持ち、IPv4と同じ形式のアドレスではありません。' },
    { title: 'IPv4との併用', body: '移行期にはIPv4とIPv6が併用されることがあります。どちらで接続するかは、端末・ネットワーク・相手先の対応状況により異なります。' },
  ],
  http: [
    { title: 'リクエストとレスポンス', body: 'HTTPではクライアントがメソッド、パス、ヘッダ、必要なら本文を送ります。サーバーはステータスコード、ヘッダ、本文を含むレスポンスを返します。' },
    { title: 'HTTPが扱う範囲', body: 'HTTPはWeb上の意味を持つメッセージの形式を定めます。実際にデータを運ぶためには、下位のTLS、TCPまたはQUIC、IP、リンク層などが協調します。' },
  ],
  https: [
    { title: 'HTTPSの構成', body: '一般的なHTTPSではHTTPメッセージをTLSで保護し、さらにTCPとIPの上で運びます。ただしHTTP/3ではTLSを組み込んだQUICがUDPの上で使われます。' },
    { title: '何を守る？', body: 'TLSは通信内容の機密性、改ざん検出、接続先の認証に役立ちます。安全性は証明書の検証、実装、利用者の操作など複数の要素にも依存します。' },
  ],
  tls: [
    { title: 'ハンドシェイク', body: '通信開始時、クライアントとサーバーは対応できる方式をすり合わせ、証明書を確認し、通信を保護する鍵を合意します。これをTLSハンドシェイクと呼びます。' },
    { title: '暗号化後の見え方', body: 'HTTPSでは通常、HTTPのリクエスト行やヘッダ、本文はTLSで暗号化されます。この教材のHTTP表示は、仕組みを学ぶために暗号化前の例として示しています。' },
  ],
  ethernet: [
    { title: 'リンクごとの単位', body: 'Ethernet Frameは同一リンク上でデータを運ぶ単位です。ルーターを越えると、IPパケットは次のリンクに適した新しいEthernet Frameへ包み直されます。' },
    { title: '主な構造', body: 'フレームには宛先MACアドレス、送信元MACアドレス、EtherType、Payload、FCSなどがあります。EtherTypeはPayloadをどの上位プロトコルとして扱うかの目安になります。' },
  ],
  mac: [
    { title: '48ビットの識別子', body: 'Ethernetで広く使われるMACアドレスは通常48ビットで、16進数6組として表示されます。先頭のビットにはユニキャスト・マルチキャストやローカル管理を示す意味があります。' },
    { title: '一意性について', body: 'ベンダー割り当てのアドレスが一般的ですが、ソフトウェアで設定するローカル管理アドレスや、プライバシー目的でランダム化されたアドレスもあります。世界で完全に一意と保証されるものではありません。' },
  ],
  nic: [
    { title: 'OSとの境界', body: 'NICはOSのネットワークスタックから渡されたデータを受け、EthernetやWi‑Fiなどのリンク方式で送受信します。受信時は逆に、上位層が扱えるデータとしてOSへ渡します。' },
    { title: '物理信号への変換', body: '物理層ではビット列をそのまま単純な電圧へ対応付けるのではなく、規格に応じて符号化・変調し、電気・光・無線などの信号として伝送します。' },
  ],
  lan: [
    { title: '範囲と境界', body: 'LANは家庭、オフィス、学校など比較的限られた範囲のネットワークです。ルーターがLANと外部ネットワークの境界となり、異なるIPネットワークの間を中継します。' },
    { title: 'EthernetとWi‑Fi', body: '有線LANではEthernetが、無線LANではWi‑Fiが使われることが一般的です。どちらもLANを構成できますが、媒体やアクセス制御の詳細は異なります。' },
  ],
  isp: [
    { title: '利用者をInternetへつなぐ', body: 'ISPは家庭や企業のネットワークを、より広い事業者ネットワークやインターネットへ接続します。回線事業者とISPが別の組織である場合もあります。' },
    { title: '実際の経路', body: 'どのISPや相互接続点を通るかは、契約、BGPなどの経路制御、障害、混雑などで変わります。この教材では代表的な1経路に簡略化しています。' },
  ],
  ftth: [
    { title: '光アクセス回線', body: 'FTTHでは家庭付近まで光ファイバを使って接続します。宅内側にはONUやONTが置かれ、光アクセス網と利用者側の機器の境界になります。' },
    { title: '宅内LANとは別の区間', body: 'PCと家庭用ルーターの間がEthernetの場合でも、ルーターから事業者網までがそのまま同じEthernetであるとは限りません。回線方式は契約や設備により異なります。' },
  ],
  onu: [
    { title: '光回線の終端', body: 'ONUは事業者の光アクセス網と宅内側の機器を接続する装置です。光ファイバで伝わる光信号を、利用者側のネットワーク機器と接続できる形へ変換します。' },
    { title: 'ルーターとの違い', body: 'ONU/ONTは回線の終端装置であり、通常はIP経路を選択するルーターとは役割が異なります。機器によっては複数の機能が一体化している場合もあります。' },
  ],
  ont: [
    { title: '名称の使われ方', body: 'ONTは光ネットワークの終端装置を指す名称です。環境や事業者によりONUとほぼ同じ文脈で使われることがあります。' },
    { title: '教材内での位置', body: 'このシミュレーションでは、家庭用ルーターとISP網の間にある光アクセス回線の境界として、ONU / ONTを表示しています。' },
  ],
  wifi: [
    { title: '無線LANの接続', body: 'Wi‑Fiは無線LANの相互運用性を示すブランド名で、IEEE 802.11規格群を利用します。端末はアクセスポイントを介してLANへ接続します。' },
    { title: '有線との違い', body: 'Wi‑Fiでは電波の品質、距離、干渉、利用端末数が通信状態へ影響します。有線Ethernetと同じIP通信を利用できても、リンク層の詳細や特性は異なります。' },
  ],
  router: [
    { title: '転送判断', body: 'ルーターは受信したフレームからIPパケットを取り出し、宛先IPアドレスをRouting Tableと照合します。一致する候補のうち、通常は最も長いPrefixに一致する経路を選びます。' },
    { title: 'リンク層は包み直す', body: '次のリンクへ送る前に、ルーターはそのリンクに必要な新しいフレームを作ります。MACアドレスはリンクごとに変わり得ますが、IPパケットの宛先は通常エンドツーエンドの配送に使われます。' },
  ],
  switch: [
    { title: 'MACアドレステーブル', body: 'Switchは受信したフレームの送信元MACアドレスと入力ポートを学習し、対応表を作ります。宛先MACアドレスが分かっていれば対応するポートだけへ転送します。' },
    { title: '宛先を知らない場合', body: '宛先MACアドレスが未学習の場合やブロードキャストの場合、同一VLAN内の複数ポートへ送るフラッディングが行われることがあります。この教材では代表的な既知宛先の転送を示しています。' },
  ],
  syn: [
    { title: '接続開始での役割', body: 'SYNはTCPヘッダのFlagsの1ビットです。クライアントは初期Sequence Numberを含むSYNを送り、サーバーはSYNとACKを含む応答を返します。' },
    { title: '3-way handshake', body: '最後にクライアントがACKを返すことで、双方が接続開始に必要な情報を確認します。既存接続の再利用や通信失敗など、実際には別の状況もあります。' },
  ],
  ack: [
    { title: '次に欲しいバイトを伝える', body: 'Acknowledgment Numberは、受信側が次に受信したいSequence Numberを示します。これより前の連続したデータを受信できたことを相手に知らせます。' },
    { title: 'FlagsとしてのACK', body: 'ACKはTCPヘッダのフラグ名でもあります。接続確立時だけでなく、確立後のデータ受信確認にも使われます。' },
  ],
  fcs: [
    { title: 'CRCによる誤り検出', body: 'EthernetではFCSとしてCRCを使い、受信側がフレームのビット誤りを検出します。計算した値とFCSが一致しなければ、そのフレームは通常破棄されます。' },
    { title: '再送の担当は別', body: 'FCSは誤りを検出しますが、Ethernet自体がエンドツーエンドの再送を保証するわけではありません。Web通信での再送や順序制御は、TCPや上位の仕組みが担う場合があります。' },
  ],
  nat: [
    { title: 'アドレス変換', body: 'NATはパケットのIPアドレスを書き換える仕組みです。家庭用ルーターでは、Portもあわせて変換するNAPTが使われることが一般的です。' },
    { title: '対応表を持つ', body: 'NAPTでは、内部の送信元IP・Portと外部側のIP・Portの対応をルーターが保持します。返信パケットはこの対応表を使って、家庭内の適切な端末へ戻されます。' },
  ],
  arp: [
    { title: '遠いサーバーのMACを調べるのではない', body: '宛先IPが同じIPネットワークにない場合、PCは通常、次の中継先であるDefault GatewayのMACアドレスを調べます。WebサーバーのMACアドレスをインターネット越しに取得するものではありません。' },
    { title: 'RequestとReplyの違い', body: 'ARP Requestは同一のブロードキャストドメイン内へ送られます。対象のIPアドレスを持つ機器は、通常、自分のMACアドレスを含むARP Replyを問い合わせ元へ返します。ARPはルーターを越えて転送されません。' },
  ],
  cidr: [
    { title: 'Prefixの意味', body: 'CIDRの /24 のような数字は、アドレスの先頭から何ビットをネットワークの識別に使うかを示します。IPv4では残りのビットが、そのネットワーク内のホストを区別するために使われます。' },
    { title: '経路をまとめる', body: 'CIDRを使うと、似た宛先を1つのPrefixでまとめてRouting Tableへ登録できます。これにより、個々の端末ごとの経路を大量に並べずに済みます。' },
  ],
  'routing-table': [
    { title: '何を持つ？', body: 'Routing Tableには、宛先Prefix、次に送る中継先（Next Hop）、送出に使うInterfaceなどが記録されます。実際にはメトリックや経路の由来など、さらに多くの情報を持つことがあります。' },
    { title: '最長一致', body: '複数の経路が宛先に一致する場合、通常はより長いPrefix、つまりより具体的なネットワークを表す経路を選びます。これをLongest Prefix Matchと呼びます。' },
  ],
  'longest-prefix-match': [
    { title: 'より具体的な住所を優先する', body: '10.0.0.0/8 と 10.20.0.0/16 の両方に 10.20.3.18 が一致する場合、/16 のほうが先頭ビットをより多く指定しており、より具体的なので選ばれます。' },
  ],
  'default-gateway': [
    { title: 'LANの外へ出る入口', body: 'PCは宛先が自分と同じIPネットワークにないと判断すると、通常はDefault Gatewayへパケットを送ります。Gatewayはルーターであり、次のネットワークに向けて経路選択を行います。' },
  ],
  napt: [
    { title: 'NATとの関係', body: 'NATはアドレス変換を広く指す言葉です。送信元または宛先のIPアドレスに加え、Transport層のPortも変換して複数の通信を区別する代表例をNAPTと呼びます。' },
    { title: '返信を戻すには', body: 'ルーターは内部側と外部側のIP・Portの組を対応表として保持します。外部から戻るパケットは、その対応表を使って内部の正しい端末・通信へ振り分けられます。' },
  ],
  dhcp: [
    { title: '何を渡す？', body: 'DHCPはIPアドレスだけでなく、Subnet Mask、Default Gateway、DNS Serverなどの設定を端末へ配布できます。配布内容と期限はネットワークの運用方針によって異なります。' },
    { title: '代表的な流れ', body: 'IPv4では、DHCP Discover、Offer、Request、ACKというメッセージ交換を代表例として説明することがあります。実際の再取得や更新、Relayの有無などで流れは変わります。' },
  ],
  ndp: [
    { title: 'ARPとの違い', body: 'NDPはIPv6で近隣の機器やルーターを見つけるためにICMPv6を利用する仕組みです。IPv4のARPと目的が近い部分はありますが、メッセージ形式や扱う役割は同じではありません。' },
    { title: 'LANでの役割', body: 'NDPには近隣探索のほか、ルーターの発見やアドレス設定に関係する機能があります。実際の動作は端末、ルーター、ネットワークの設定により異なります。' },
  ],
  port: [
    { title: 'IPアドレスだけでは足りない理由', body: 'IPアドレスは端末やネットワークへの配送先を示します。同じ端末上の複数の通信先を区別するため、TCPやUDPではPort番号を組み合わせます。' },
    { title: '通信を区別する組み合わせ', body: 'TCP/UDPの通信は、送信元IP・送信元Port・宛先IP・宛先PortとProtocolの組み合わせで区別できます。Port番号だけで「アプリケーションそのもの」を一意に表すわけではありません。' },
  ],
  firewall: [
    { title: '何を見て判断する？', body: 'Firewallは送信元・宛先のIPアドレス、Protocol、Port、通信の向き、接続状態などを条件として、定義されたルールと照合します。どの条件を使うかは製品・設定・配置によって異なります。' },
    { title: 'StatefulとStateless', body: 'Stateful Firewallは接続の状態を記録し、たとえば許可した通信への返信を区別できます。Statelessなフィルタは各パケットを個別に評価します。どちらが使われるかでルールの書き方や挙動は変わります。' },
  ],
  cpu: [
    { title: '命令を実行する流れ', body: 'CPUはメモリから命令を読み出し、意味を解釈し、必要なデータをレジスタへ取り込み、演算や分岐を実行します。命令セットや実装によって詳細は異なります。' },
    { title: '速さを決めるもの', body: 'クロック周波数だけでなく、命令の種類、パイプライン、キャッシュ、分岐予測、メモリ待ちなどが実行時間へ影響します。' },
  ],
  'program-counter': [
    { title: '次の命令を指す目印', body: 'Program Counterは、CPUが次に取り出す命令の位置を示すための状態です。命令の幅、分岐、例外などにより、どのように更新されるかはCPUの設計で異なります。' },
  ],
  'instruction-register': [
    { title: '読み出した命令を保持する', body: '教育用のCPUモデルでは、読み出した命令をInstruction Registerへ置いてDecodeすると説明することがあります。実際のCPUでは、同じ役割がパイプライン内の複数の保持場所へ分かれていることもあります。' },
  ],
  'control-unit': [
    { title: '回路を協調させる', body: 'Control Unitは命令の種類に応じて、レジスタ、ALU、メモリなどをいつ使うかを制御します。独立した1つの箱とは限らず、CPU内部に分散した制御回路やマイクロコードとして実現される場合もあります。' },
  ],
  interrupt: [
    { title: '通常の流れを一時的に切り替える', body: '割り込みを受けると、CPUは現在の実行状態を保存し、OSなどが用意した処理へ制御を移します。処理後に元の仕事へ戻れるよう、保存と復元が必要です。ソフトウェア例外とは区別して扱う設計もあります。' },
  ],
  cache: [
    { title: 'なぜ必要？', body: 'CPUと主記憶の速度差を小さく見せるため、最近使ったデータや命令をCPUの近くに保持します。キャッシュに見つかることをcache hit、見つからないことをcache missと呼びます。' },
  ],
  process: [
    { title: '実行中だけではない', body: 'プロセスは実行中・実行可能・待機などの状態を行き来します。OSは複数のプロセスへCPU時間を割り当て、入出力待ちの間には別の処理を進められます。' },
  ],
  'context-switch': [
    { title: '何を切り替える？', body: 'OSは次に実行する処理を変えるとき、レジスタやプログラムカウンタなどの実行状態を保存し、別の処理の状態を復元します。これには時間がかかるため、無制限に速く切り替えられるわけではありません。' },
  ],
  transaction: [
    { title: '途中の状態を見せないために', body: '複数の更新をひとまとまりとして扱い、すべて成功したときだけ確定することで、途中まで更新された不整合な状態を減らします。実際の隔離レベルや同時実行制御は製品・設定によって異なります。' },
  ],
  'isolation-level': [
    { title: '同時実行時の見え方を決める', body: 'Isolation Levelは、同時に動くトランザクションの変更をどの時点で読み取れるかや、どの競合を防ぐかに関係する設定・性質です。名称が同じでも、細かな挙動はDBMSによって異なり得ます。' },
  ],
  mvcc: [
    { title: '複数の版を使う考え方', body: 'MVCCでは、データの複数の版を使うことで、読み取りと更新が必要以上に互いを待たないようにします。どの版を読めるか、不要な版をいつ片付けるかはDBMSやIsolation Levelで変わります。' },
  ],
  'row-lock': [
    { title: '更新対象を限定して守る', body: 'Row Lockは、特定の行を更新する間に競合する操作を調整する代表的なLockです。実際には行・ページ・表など、Lockの粒度や取得方法はDBMSと実行計画によって変わります。' },
  ],
  lock: [
    { title: '同時更新との関係', body: '複数のトランザクションが同じデータを更新するとき、Lockなどの仕組みで競合を調整できます。待ち合わせが循環するとdeadlockになることがあるため、DBMSは検出や回避を行う場合があります。' },
  ],
  certificate: [
    { title: '接続先を確認する材料', body: 'TLSではサーバーが証明書を提示し、クライアントは信頼できる認証局の連鎖、名前、有効期限などを検証します。暗号化だけでなく、意図した相手へ接続しているかを確かめるためにも使われます。' },
  ],
  'private-key': [
    { title: '公開してはいけない鍵', body: 'Private Keyは対応するPublic Keyと組になる秘密の鍵です。TLSではサーバーが秘密鍵を持つことを署名などで示し、接続先の認証を助けます。鍵交換や暗号化への使われ方は方式とTLSの版により異なります。' },
  ],
  'shared-secret': [
    { title: '双方だけが導く材料', body: 'Shared Secretは、鍵交換によってクライアントとサーバーの双方が導く秘密の値です。通常はこの値そのものを送るのではなく、そこから通信方向ごとの保護鍵を導出します。' },
  ],
  sni: [
    { title: '接続したい名前を先に知らせる', body: 'SNIはTLSのClientHelloに含められる拡張で、接続したいホスト名をサーバーへ知らせます。複数のWebサイトを同じIPアドレスで運用するときに、適切な証明書を選ぶ助けになります。暗号化されたClientHelloを使う方式では保護される場合もあります。' },
  ],
  'load-balancer': [
    { title: '1台に集中させない', body: 'Load Balancerは、受け取ったリクエストを複数のサーバーへ振り分けます。振り分け方式、ヘルスチェック、セッションの扱いは構成によって変わります。' },
  ],
  'l4-l7': [
    { title: '判断材料の深さが異なる', body: 'L4の振り分けは、IPアドレスやPortなどのTransport層までの情報を主に扱います。L7の振り分けは、HTTPのHostやPathなどアプリケーション層の情報も条件にできます。実際に使える機能は製品と構成によって異なります。' },
  ],
  'session-affinity': [
    { title: '同じ利用者を同じ送信先へ寄せる', body: 'Session Affinityは、同じ利用者からの後続リクエストを同じバックエンドへ送りやすくする仕組みです。状態を持つアプリケーションに役立つ場合がありますが、負荷の偏りや障害時の扱いも考える必要があります。' },
  ],
  'binary-search': [
    { title: '半分ずつ絞る', body: '整列済みの配列で中央の値を比較し、探す範囲を半分ずつ捨てていく探索方法です。データが並んでいない場合は、この前提をそのまま使えません。' },
  ],
  'time-complexity': [
    { title: '入力が増えたときの伸び方を見る', body: 'Time Complexityは、入力の大きさに対して計算回数がどのように増えるかを表す目安です。O(log n)は、二分探索のように候補をほぼ半分ずつ減らす処理で現れる代表例です。実行時間そのものは、定数項や実装、環境にも左右されます。' },
  ],
}

/**
 * 「まずひとことで」を届けるための入口です。比喩は理解の足場として
 * 使い、実際の通信での位置と注意点を必ず併記します。
 */
const BEGINNER_GUIDES: Record<string, GlossaryBeginnerGuide> = {
  url: {
    japaneseName: 'ウェブアドレス', pronunciation: 'ユーアールエル',
    inOneSentence: 'ウェブ上で「どの相手の、どの情報を、どの方法で受け取りたいか」を表す、住所のような文字列です。',
    whyNeeded: '人は example.com や /news のような名前で目的地を指定したほうが扱いやすく、ブラウザはそこから接続先と要求する情報を読み取れます。',
    everydayImage: '建物の住所に、部屋番号や用件を添えた案内のようなものです。ドメイン名が建物、パスが部屋やページ、クエリが追加の条件に当たります。',
    whenItAppears: 'ウェブアクセスの最初です。ブラウザがURLを読み、まずドメイン名をDNSで調べてから通信を始めます。',
    beginnerNote: 'URLそのものがネットワークを流れて相手を探すわけではありません。# の後ろのフラグメントは多くの場合ブラウザだけで使われ、HTTPリクエストには送られません。',
  },
  dns: {
    japaneseName: 'ドメイン名の名前解決', pronunciation: 'ディーエヌエス',
    inOneSentence: '人が読みやすいドメイン名と、通信で使うIPアドレスなどの情報を対応付ける仕組みです。',
    whyNeeded: 'ネットワークの配送にはIPアドレスが必要ですが、人が数字だけを覚えるのは大変です。名前を使えるようにするため、対応を調べる役割が必要です。',
    everydayImage: '連絡先の名前から電話番号を探す電話帳のようなものです。ただしDNSは世界中に分散した仕組みで、単一の電話帳ではありません。',
    whenItAppears: 'URLに書かれたホスト名へ接続する前に登場します。すでに端末やDNSリゾルバのキャッシュに答えがあれば、外部への問い合わせを省けることもあります。',
    beginnerNote: 'DNSはIPアドレスだけを返す仕組みではありません。この教材ではA・AAAAレコードによるIPアドレス取得を代表例として扱っています。',
  },
  ip: {
    japaneseName: 'インターネット上の住所と配送ルール', pronunciation: 'アイピー',
    inOneSentence: '異なるネットワークをまたいで、宛先へパケットを届けるための共通の住所と配送ルールです。',
    whyNeeded: '家庭内LAN、事業者網、データセンターなど、別々のネットワークを越えて届けるには、途中のルーターが共通に読める宛先情報が必要です。',
    everydayImage: '遠方まで荷物を送るときの住所に近い役割です。途中の配送拠点は住所を見て次の拠点を決めます。',
    whenItAppears: 'TCPなどで包まれたデータにIPヘッダが付くとき、そして各ルーターが次の経路を選ぶときに使われます。',
    beginnerNote: 'IPだけでは到達・順序・重複のない受信を保証しません。またIPアドレスとMACアドレスは同じ種類の住所ではなく、担当する範囲が異なります。',
  },
  ipv4: {
    japaneseName: 'IPバージョン4', pronunciation: 'アイピーブイフォー',
    inOneSentence: '32ビットのIPアドレスを使う、現在も広く使われているIPの方式です。',
    whyNeeded: 'ルーターが宛先ネットワークと宛先の端末を区別し、パケットをどちらへ送るか決める基準になります。',
    everydayImage: '192.168.1.10 のように4つの数字で書く住所表記です。ただし4つに区切るのは人が読みやすくするための表し方で、内部では32ビットの値です。',
    whenItAppears: 'PCがIPパケットを作るときや、ルーターが宛先への経路を選ぶときに使われます。',
    beginnerNote: '192.168.x.x のようなアドレスには、家庭や組織の内部で使うための範囲があります。インターネット全体でそのまま使えるアドレスとは限りません。',
  },
  ethernet: {
    japaneseName: '有線LANで広く使われる通信方式', pronunciation: 'イーサネット',
    inOneSentence: '同じLANや1本のリンク上でデータを運ぶための代表的な技術で、データはEthernetフレームとして送られます。',
    whyNeeded: 'PCからスイッチ、ルーターなど、次に直接つながる相手へデータを渡すには、リンク上で使う宛先と誤り検出の仕組みが必要です。',
    everydayImage: '近くの配送拠点まで荷物を渡すための封筒のようなものです。遠方まで同じ封筒が運ばれ続けるわけではありません。',
    whenItAppears: 'NICから有線LANへ送るときや、ルーターが次のリンクへ送り直すときに登場します。',
    beginnerNote: 'Ethernetフレームはインターネット全体を同じ形のまま通り抜けません。ルーターを越えるごとに、次のリンクに合うフレームへ包み直されます。',
  },
  mac: {
    japaneseName: 'リンク内の宛先アドレス', pronunciation: 'マック',
    inOneSentence: 'Ethernetなどの同一リンク内で、フレームを次の相手へ渡すために使うアドレスの仕組みです。',
    whyNeeded: 'IPアドレスで次の中継先を決めても、Ethernetフレームをどの機器へ渡すかをリンク上で示す必要があります。',
    everydayImage: '建物の中で次の受取人へ荷物を渡すときの宛名に近い役割です。遠方の最終目的地ではなく、まず次に渡す相手を示します。',
    whenItAppears: 'Ethernetフレームを作るときに宛先MACアドレスとして入ります。IPv4では、ARPで次の相手のMACアドレスを調べることがあります。',
    beginnerNote: 'MACアドレスは世界で完全に一意と保証されるものではありません。遠いウェブサーバーのMACアドレスをインターネット越しに調べるものでもありません。',
  },
  tcp: {
    japaneseName: '順序と到達確認を扱う通信方式', pronunciation: 'ティーシーピー',
    inOneSentence: 'アプリケーション間のデータを、順序をそろえながら届けるためのトランスポート層プロトコルです。',
    whyNeeded: 'IPだけでは、途中で失われたか、順番が入れ替わったかを扱いません。TCPは受信確認や再送などで、アプリケーションが扱いやすいバイト列を作ります。',
    everydayImage: 'ページ番号付きの書類を送り、受取人から「ここまで受け取った」と返事をもらうやり方に近いものです。',
    whenItAppears: 'このサイトで扱う代表的なHTTPS通信では、DNSの後にTCP接続を作り、その上でTLSやHTTPのデータを運びます。',
    beginnerNote: 'TCPのSequence Numberはパケットの通し番号ではなく、TCPのバイト列の位置に関係する番号です。HTTP/3ではTCPではなくQUICとUDPを使います。',
  },
  port: {
    japaneseName: '端末内の通信先番号', pronunciation: 'ポート',
    inOneSentence: 'TCPやUDPで、同じ端末の中にある通信先を区別するための番号です。',
    whyNeeded: 'IPアドレスだけでは端末までしか分かりません。ウェブブラウザ、メール、別のアプリケーションなど、端末内のどの通信へ渡すかを区別する必要があります。',
    everydayImage: '建物の住所だけでなく、部屋番号や受付窓口まで指定することに近い役割です。',
    whenItAppears: 'TCPまたはUDPのヘッダに送信元ポート番号と宛先ポート番号として入ります。ウェブのHTTPSでは443番がよく使われます。',
    beginnerNote: 'ポート番号だけで通信全体を一意に決めるわけではありません。実際のTCP通信は送信元・宛先のIPアドレス、ポート番号、プロトコルなどの組み合わせで区別されます。',
  },
  router: {
    japaneseName: 'ネットワークの間をつなぐ中継機器', pronunciation: 'ルーター',
    inOneSentence: '宛先IPアドレスを見て、データを次にどのネットワークへ送るかを決める機器です。',
    whyNeeded: '家庭内LANだけでは遠いサーバーへ届きません。別のネットワークの間をつなぎ、次の行き先を選ぶ役割が必要です。',
    everydayImage: '宛先の住所を見て、次の配送拠点へ振り分ける仕分け所に近い役割です。',
    whenItAppears: 'PCがLAN外のウェブサーバーへ送るとき、まずデフォルトゲートウェイであるルーターへ渡します。その後もネットワークの境界ごとにルーターが登場します。',
    beginnerNote: 'ルーターは受け取ったEthernetフレームをそのまま遠方へ送るのではありません。IPパケットを見て次を決め、次のリンク用の新しいフレームを作ります。',
  },
  switch: {
    japaneseName: 'LAN内の振り分け機器', pronunciation: 'スイッチ',
    inOneSentence: '同じLANの機器をつなぎ、主にMACアドレスを手がかりにEthernetフレームを適切なポートへ渡す機器です。',
    whyNeeded: 'LAN内のすべての機器へ毎回同じデータを送らず、必要な相手がつながるポートへ届けやすくするためです。',
    everydayImage: '同じ建物の中で、宛名を見て各部屋へ郵便物を振り分ける受付のようなものです。',
    whenItAppears: 'PCが家庭や組織内のLANから、同一LAN上の相手や最初のルーターへフレームを送るときに登場します。',
    beginnerNote: 'スイッチは通常、ルーターのようにインターネット全体のIP経路を選びません。宛先MACアドレスを知らないときは、同じVLAN内へフラッディングすることもあります。',
  },
  nic: {
    japaneseName: 'ネットワーク接続口', pronunciation: 'エヌアイシー',
    inOneSentence: 'PCやサーバーをネットワークへつなぎ、OSのデータをEthernetやWi-Fiで送受信するための窓口です。',
    whyNeeded: 'アプリケーションやOSが作ったデータを、ケーブル・光・電波などの実際の通信媒体へ渡し、受信したデータをOSへ戻す境界が必要です。',
    everydayImage: '建物の中の作業と外の配送網をつなぐ、荷物の出入口と通訳の役割を合わせたようなものです。',
    whenItAppears: 'PCから最初のLANへ出る直前、またはネットワークからPCへ届いた直後に登場します。',
    beginnerNote: 'NICは必ずしも後から挿すカードではありません。機器に内蔵されることや、仮想的なネットワークインターフェースとして作られることもあります。',
  },
  http: {
    japaneseName: 'ウェブの要求と応答の約束', pronunciation: 'エイチティーティーピー',
    inOneSentence: 'ウェブブラウザとウェブサーバーが、「何をほしいか」と「何を返すか」をやり取りするための約束です。',
    whyNeeded: 'URLで指定したページや画像などを受け取るには、GETやPOST、応答の状態など、双方が同じ意味で読めるメッセージの形式が必要です。',
    everydayImage: 'レストランで注文内容を伝え、店から料理や結果を受け取るための注文票に近い役割です。',
    whenItAppears: '代表的なHTTPS通信では、接続とTLSの準備ができた後に、HTTPリクエストとレスポンスとして登場します。',
    beginnerNote: 'HTTP自体は暗号化やケーブル上の配送を担当しません。内容を守るTLSや、実際に運ぶTCPまたはQUIC、IP、リンク層と協調します。',
  },
  https: {
    japaneseName: '保護されたウェブ通信', pronunciation: 'エイチティーティーピーエス',
    inOneSentence: 'HTTPのやり取りをTLSで保護して行うウェブ通信です。',
    whyNeeded: 'インターネット上の経路を通るときに、通信内容を読まれたり書き換えられたりしにくくし、接続先の確認にも役立てるためです。',
    everydayImage: '内容が見えにくく、開けた跡も分かる封印付きの封筒を、相手の身元の確認と一緒に使うイメージです。',
    whenItAppears: 'DNSで接続先を調べ、接続やTLSの準備をした後に、ブラウザとウェブサーバーの間でHTTPを安全に扱う場面に登場します。',
    beginnerNote: 'HTTPSは多くの場合443番ポートを使いますが、絶対の決まりではありません。HTTP/3ではTLSを組み込んだQUICがUDPの上で使われます。',
  },
  tls: {
    japaneseName: '通信内容を守る仕組み', pronunciation: 'ティーエルエス',
    inOneSentence: '通信内容を暗号化し、改ざんの検出と接続先の確認を助けるための仕組みです。',
    whyNeeded: '途中のネットワークを完全には信用できない環境でも、アプリケーションのデータを保護してやり取りするためです。',
    everydayImage: '鍵をかけた封筒に、途中で開けられたら分かる封印と、受取人を確かめる身分証を組み合わせるイメージです。',
    whenItAppears: 'このサイトの代表的なHTTPS通信では、TCP接続を作った後、HTTPを送る前にTLSハンドシェイクとして登場します。',
    beginnerNote: 'TLSで暗号化されていても、サイトの内容が安全・正確であることまで自動で保証するわけではありません。HTTP/3ではTLSはQUICと一体で使われます。',
  },
  dhcp: {
    japaneseName: 'ネットワーク設定の配布', pronunciation: 'ディーエイチシーピー',
    inOneSentence: 'ネットワークへ参加する端末に、IPアドレスや出口となるルーター、DNSの設定を配る仕組みです。',
    whyNeeded: '端末ごとに住所や出口を手作業で設定すると、入力ミスや重複が起きやすくなります。必要な設定をまとめて渡せるようにします。',
    everydayImage: '新しい建物に入った人へ、部屋番号、出口の案内、問い合わせ先を受付が渡すようなものです。',
    whenItAppears: '端末がネットワークへ接続したときや、設定の有効期限を更新するときに登場します。通常のウェブアクセスより前に済んでいることが多いです。',
    beginnerNote: 'すべての端末がDHCPを使うわけではありません。固定IPアドレスを手動で設定する場合もあり、配られる設定の内容はネットワークごとに異なります。',
  },
  arp: {
    japaneseName: 'IPv4で次の相手のMACアドレスを調べる仕組み', pronunciation: 'アープ',
    inOneSentence: 'IPv4のLAN内で、次にフレームを渡す相手のIPアドレスからMACアドレスを調べる仕組みです。',
    whyNeeded: 'IPアドレスで次の中継先を決めても、Ethernetフレームには宛先MACアドレスが必要です。その対応を知る必要があります。',
    everydayImage: '近くにいる人へ「この住所を持っている人は、どの宛名ですか」と尋ねる案内に近いものです。',
    whenItAppears: 'PCが送信先またはデフォルトゲートウェイへEthernetフレームを送る前に、対応表へ必要なMACアドレスがないときに登場します。',
    beginnerNote: 'ARPは同じブロードキャストドメイン内だけで使われ、ルーターを越えません。遠いウェブサーバーのMACアドレスを調べるものではなく、IPv6ではNDPが同様の役割を担います。',
  },
  nat: {
    japaneseName: 'ネットワーク境界でのアドレス変換', pronunciation: 'ナット',
    inOneSentence: 'ネットワークの境界で、パケットに書かれたIPアドレスなどを対応表に基づいて書き換える仕組みです。',
    whyNeeded: '家庭や組織の内部で使うプライベートIPアドレスと、外部ネットワークで使うアドレスをつなぎ、複数の端末が外部接続を共有しやすくするためです。',
    everydayImage: '建物の受付が、部屋番号と外線番号の対応表を持ち、帰ってきた連絡を正しい部屋へ戻すようなものです。',
    whenItAppears: '家庭用ルーターなどが、内部ネットワークから外部へパケットを出すときや、その返信を内部へ戻すときに登場します。',
    beginnerNote: '家庭用ルーターでよく使われるのは、ポート番号も変換するNAPTです。NATそのものが通信を安全にする機能と同じ意味ではありません。',
  },
  'default-gateway': {
    japaneseName: 'LANの外へ出る最初のルーター', pronunciation: 'デフォルトゲートウェイ',
    inOneSentence: 'PCが自分のLANの外にある相手へ送るとき、最初にデータを渡すルーターです。',
    whyNeeded: 'PCは遠いネットワークの細かな経路をすべて知る必要はありません。まず近くの出口へ渡し、その先の経路選択をルーターに任せられます。',
    everydayImage: '自分の町の外へ郵便を出すときに、最初に持ち込む地域の郵便局のようなものです。',
    whenItAppears: '宛先IPアドレスが自分と同じIPネットワークにないとPCが判断したときに、次の相手として選ばれます。ARPでこのルーターのMACアドレスを調べることがあります。',
    beginnerNote: 'デフォルトゲートウェイは「必ず家庭用ルーター」を意味しません。組織のネットワークなどでは別のルーターや設定された経路が使われることがあります。',
  },
  cpu: {
    japaneseName: '中央処理装置', pronunciation: 'シーピーユー',
    inOneSentence: 'プログラムの命令を順に読み取り、計算や判断を行うコンピュータの中心的な処理装置です。',
    whyNeeded: 'メモリにあるプログラムの手順を実際に実行し、入力に応じて結果を作る役割が必要です。',
    everydayImage: 'レシピを一つずつ読み、必要な道具を使って作業を進める料理人に近い役割です。',
    whenItAppears: 'ブラウザがURLを処理するときも、OSが通信を準備するときも、各ソフトウェアの命令はCPUによって実行されます。',
    beginnerNote: 'CPUがすべてのデータを内部に持つわけではありません。レジスタ、キャッシュ、メモリ、入出力装置と役割を分けながら処理します。',
  },
  process: {
    japaneseName: '実行中のプログラムのまとまり', pronunciation: 'プロセス',
    inOneSentence: 'OSが実行中のプログラムを管理するための、独立した作業単位です。',
    whyNeeded: '複数のアプリケーションが同時に動いても、使うメモリや資源を分け、問題が広がりにくくするためです。',
    everydayImage: '同じ作業場にいる複数の仕事チームのようなものです。それぞれに使える場所や道具の管理があります。',
    whenItAppears: 'ブラウザやDNS問い合わせを行うソフトウェアも、OS上では1つ以上のプロセスとして動き、CPU時間やメモリを受け取ります。',
    beginnerNote: 'プロセスとスレッドは同じではありません。1つのプロセスの中に複数のスレッドがあり、メモリなどを共有して働く場合があります。',
  },
  database: {
    japaneseName: 'データを安全に扱う仕組み', pronunciation: 'データベース',
    inOneSentence: 'アプリケーションが使うデータを、検索・更新・整合性の仕組みとともに保存し、取り出せるようにするシステムです。',
    whyNeeded: '利用者、商品、投稿などの大量の情報を、複数の処理から矛盾しにくい形で扱う必要があるためです。',
    everydayImage: '単なるノートの束ではなく、探しやすい索引と、同時に書き換えるときのルールを備えた記録室のようなものです。',
    whenItAppears: 'ウェブサーバーがリクエストを処理し、利用者情報やコンテンツを読み書きする必要があるときに、背後のシステムとして登場します。',
    beginnerNote: 'すべてのウェブサイトが必ずデータベースを使うわけではありません。またデータベースは表形式だけではなく、用途に応じたさまざまな種類があります。',
  },
  certificate: {
    japaneseName: '接続先を確かめる電子証明書', pronunciation: 'サーティフィケート',
    inOneSentence: 'TLSで、接続先の名前と公開鍵などを示し、相手の確認に使う電子的な証明書です。',
    whyNeeded: '暗号化だけでは「誰と暗号化しているか」が分かりません。意図したウェブサイトへ接続しているかを確認する手がかりが必要です。',
    everydayImage: '相手の名前と身元を確認するための、信頼できる発行者の署名付き身分証に近いものです。',
    whenItAppears: 'HTTPSのTLSハンドシェイクで、サーバーがブラウザへ提示し、ブラウザが名前や有効期限、発行者などを確認します。',
    beginnerNote: '証明書が有効でも、そのサイトの内容や運営がすべて安全であることを自動で保証するわけではありません。ブラウザは複数の条件を確認します。',
  },
  'load-balancer': {
    japaneseName: '負荷分散の入口', pronunciation: 'ロードバランサー',
    inOneSentence: '利用者からのリクエストを受け、複数のサーバーへ振り分ける役割を持つ仕組みです。',
    whyNeeded: '1台のサーバーへ処理が集中しすぎないようにし、障害中のサーバーを避けながらサービスを続けやすくするためです。',
    everydayImage: '複数の窓口がある受付で、空いていて対応できる窓口へ順に案内する係に近い役割です。',
    whenItAppears: '大きなウェブサービスでは、利用者からのHTTPSリクエストがウェブサーバーへ届く前の入口として登場することがあります。',
    beginnerNote: 'すべてのウェブサイトにロードバランサーがあるわけではありません。どの情報を見て振り分けるか、TLSをどこで扱うかは構成によって異なります。',
  },
  algorithm: {
    japaneseName: '問題を解く手順', pronunciation: 'アルゴリズム',
    inOneSentence: '目的の答えを得るために、入力をどの順番で処理するかを決めた明確な手順です。',
    whyNeeded: '同じ結果を求める場合でも、手順によって必要な時間やメモリが大きく変わるため、目的に合う進め方を選ぶ必要があります。',
    everydayImage: '料理のレシピのようなものです。同じ料理でも、材料を切る順番や加熱方法によって手間や結果が変わります。',
    whenItAppears: 'ネットワークの経路選択、データベースの検索、画面表示など、コンピュータが何かを処理するときのあらゆる場所で使われます。',
    beginnerNote: 'アルゴリズムはプログラミング言語そのものではありません。同じアルゴリズムを複数の言語で実装できます。',
  },
  'binary-search': {
    japaneseName: '二分探索', pronunciation: 'バイナリーサーチ',
    inOneSentence: '整列済みのデータで、中央と比べながら探す範囲を半分ずつ絞る探索方法です。',
    whyNeeded: '最初から1件ずつ確かめるより、データが多いときの比較回数を大きく減らせる場合があります。',
    everydayImage: '辞書で単語を探すとき、最初のページからめくらずに中央を開き、前半か後半かを決めていく方法に近いものです。',
    whenItAppears: '索引、探索、プログラムの内部処理など、すでに順番に並んだデータから目的の値を探す場面で登場します。',
    beginnerNote: '二分探索が使えるのは、比較できる順にデータが整列しているときです。並んでいないデータへそのまま使うことはできません。',
  },
}

const TERM_CATEGORIES: Record<string, GlossaryCategoryId> = {
  alu: 'computer', cpu: 'computer', register: 'computer', instruction: 'computer', cache: 'computer', memory: 'computer', 'program-counter': 'computer', 'instruction-register': 'computer', 'control-unit': 'computer', fetch: 'computer', decode: 'computer', execute: 'computer', writeback: 'computer', 'cache-line': 'computer', 'cache-hit': 'computer', 'cache-miss': 'computer',
  process: 'os', thread: 'os', scheduler: 'os', 'context-switch': 'os', 'virtual-memory': 'os', paging: 'os', 'ready-queue': 'os', io: 'os', 'time-slice': 'os', interrupt: 'os', 'page-table': 'os', 'page-fault': 'os', tlb: 'os',
  database: 'database', transaction: 'database', acid: 'database', lock: 'database', commit: 'database', rollback: 'database', index: 'database', 'isolation-level': 'database', mvcc: 'database', 'row-lock': 'database', 'b-tree': 'database', 'leaf-node': 'database', row: 'database',
  'load-balancer': 'system', 'reverse-proxy': 'system', 'health-check': 'system', 'round-robin': 'system', 'least-connections': 'system', 'l4-l7': 'system', 'session-affinity': 'system', failover: 'system', redundancy: 'system', 'active-standby': 'system',
  algorithm: 'algorithms', 'binary-search': 'algorithms', array: 'algorithms', 'time-complexity': 'algorithms', graph: 'algorithms', node: 'algorithms', edge: 'algorithms', bfs: 'algorithms', dfs: 'algorithms', queue: 'algorithms', stack: 'algorithms',
  url: 'web', dns: 'web', http: 'web', https: 'web', tls: 'web',
  tcp: 'transport', udp: 'transport', syn: 'transport', ack: 'transport', port: 'transport',
  ip: 'ip-routing', ipv4: 'ip-routing', ipv6: 'ip-routing', router: 'ip-routing', nat: 'ip-routing', napt: 'ip-routing', cidr: 'ip-routing', 'routing-table': 'ip-routing', 'longest-prefix-match': 'ip-routing', 'default-gateway': 'ip-routing', dhcp: 'ip-routing',
  ethernet: 'link', mac: 'link', nic: 'link', lan: 'link', switch: 'link', wifi: 'link', fcs: 'link', arp: 'link', ndp: 'link',
  isp: 'access', ftth: 'access', onu: 'access', ont: 'access',
  firewall: 'security', certificate: 'security', 'public-key': 'security', 'session-key': 'security', 'private-key': 'security', 'shared-secret': 'security', sni: 'security',
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  { id: 'alu', term: 'ALU', expansion: 'Arithmetic Logic Unit', summary: 'CPU内で加算・減算・比較・論理演算などを行う演算回路です。', why: 'プログラムの命令が要求する計算を、ビット単位の電気回路として実行するためです。', related: ['CPU', 'Register', 'Carry'], matches: ['ALU', 'Arithmetic Logic Unit'] },
  { id: 'url', term: 'URL', expansion: 'Uniform Resource Locator', summary: 'Web上のページや資源の場所を表す識別子です。例：`https://example.com`。', why: 'ブラウザはURLから接続先のホスト名、使う方式（HTTPSなど）、要求するパスを読み取ります。', related: ['DNS', 'HTTP', 'HTTPS'], matches: ['URL'] },
  { id: 'dns', term: 'DNS', expansion: 'Domain Name System', summary: 'ドメイン名（example.com）を、IPアドレスなどの情報へ対応付ける仕組みです。このシミュレーションではA / AAAAレコードによるIPアドレス取得を代表例として扱います。', why: 'ネットワーク上ではIPアドレスを使って配送するため、人が読みやすい名前を対応する情報へ変換する必要があります。', related: ['IP', 'DNS Server'], matches: ['DNS'] },
  { id: 'tcp', term: 'TCP', expansion: 'Transmission Control Protocol', summary: 'アプリケーション間で、順序・到達・再送などを扱うトランスポート層のプロトコルです。', why: 'IPだけでは、順番どおりに届いたかや失われたかを保証しません。TCPがその上の信頼性を担います。', related: ['IP', 'Port', 'SYN', 'ACK'], matches: ['TCP'] },
  { id: 'udp', term: 'UDP', expansion: 'User Datagram Protocol', summary: '接続確立や再送を標準では行わない、軽量なトランスポート層プロトコルです。', why: 'アプリケーション側で必要な制御を選べるため、用途によってはTCPより適しています。速さが必ず保証されるわけではありません。', related: ['TCP', 'DNS'], matches: ['UDP'] },
  { id: 'port', term: 'Port', summary: 'TCPやUDPで、同じ端末内の通信先を区別するために使われる16ビットの番号です。', why: 'IPアドレスだけでは端末までしか配送先を絞れません。複数の通信を区別するために、送信元・宛先のPort番号も組み合わせます。', related: ['TCP', 'UDP', 'IP'], matches: ['Port', 'ポート番号'] },
  { id: 'ip', term: 'IP', expansion: 'Internet Protocol', summary: '異なるネットワークをまたいで、宛先IPアドレスに向けてパケットを配送する仕組みです。', why: 'ルーターが宛先を見て次の経路を選べるように、ネットワークを越えて共通に使える住所が必要です。', related: ['IPv4', 'IPv6', 'Router'], matches: ['IP', 'IPv4', 'IPv6'] },
  { id: 'ipv4', term: 'IPv4', expansion: 'Internet Protocol version 4', summary: '32ビットのIPアドレスを使う、広く利用されているIPの版です。例：192.0.2.1。', why: '宛先ネットワークと宛先ホストを区別し、ルーターが配送先を決める基準になります。', related: ['IP', 'Router'], matches: ['IPv4'] },
  { id: 'ipv6', term: 'IPv6', expansion: 'Internet Protocol version 6', summary: '128ビットのIPアドレスを使う、IPv4の後継となるIPの版です。', why: 'IPv4アドレスの不足などを背景に設計され、IPv4とは別のアドレス形式と運用上の特徴があります。', related: ['IP', 'IPv4'], matches: ['IPv6'] },
  { id: 'http', term: 'HTTP', expansion: 'Hypertext Transfer Protocol', summary: 'WebブラウザとWebサーバーが、要求と応答を交換するためのアプリケーション層プロトコルです。', why: 'URLで指定された資源を、GETやPOSTなどの意味を持つメッセージとしてやり取りするために必要です。', related: ['HTTPS', 'URL', 'Web Server'], matches: ['HTTP'] },
  { id: 'https', term: 'HTTPS', expansion: 'Hypertext Transfer Protocol Secure', summary: 'TLSで保護されたHTTP通信です。TCPの443番ポートを使う構成が一般的ですが、HTTP/3ではQUICとUDPが使われます。', why: '通信内容の盗聴・改ざんの防止と、接続先の確認に役立ちます。', related: ['HTTP', 'TLS', 'TCP'], matches: ['HTTPS'] },
  { id: 'tls', term: 'TLS', expansion: 'Transport Layer Security', summary: 'HTTPなどのアプリケーションデータを暗号化し、相手の認証と改ざん検出を提供する仕組みです。', why: 'インターネット上の経路を通っても、第三者に内容を読まれたり変更されたりしにくくするためです。', related: ['HTTPS', 'TCP'], matches: ['TLS'] },
  { id: 'ethernet', term: 'Ethernet', summary: 'LANで広く使われるデータリンク層の技術です。データはEthernet Frameとしてリンク上を流れます。', why: '同じリンク上の機器へ届けるため、MACアドレスや誤り検出用のFCSを持つ単位が必要です。', related: ['MAC', 'Ethernet Frame', 'Switch'], matches: ['Ethernet'] },
  { id: 'mac', term: 'MAC', expansion: 'Media Access Control', summary: 'Ethernetなどのリンク上で使われるアドレスの仕組みです。MACアドレスは多くの場合48ビットで表され、ベンダー割り当てのほかローカル管理やランダム化もあります。', why: '同一LAN内で、フレームをどの機器へ渡すかを判別するためです。IPアドレスとは担当する範囲が異なります。', related: ['Ethernet', 'Switch', 'ARP'], matches: ['MAC'] },
  { id: 'nic', term: 'NIC', expansion: 'Network Interface Card', summary: 'PCやサーバーをネットワークへ接続するためのインターフェースです。', why: 'OSが作ったフレームを、EthernetやWi‑Fiなどの実際の信号として送受信する窓口になるためです。', related: ['Ethernet', 'MAC', 'Wi‑Fi'], matches: ['NIC'] },
  { id: 'lan', term: 'LAN', expansion: 'Local Area Network', summary: '家庭・オフィス・建物内などの比較的狭い範囲にあるネットワークです。', why: 'PC、スイッチ、ルーターなどを近距離で接続し、インターネットへの出口を共有できます。', related: ['Ethernet', 'Wi‑Fi', 'Switch'], matches: ['LAN'] },
  { id: 'isp', term: 'ISP', expansion: 'Internet Service Provider', summary: '利用者にインターネット接続を提供する事業者です。', why: '家庭・企業の回線を、より広いインターネットのネットワークへ接続する役割を持ちます。', related: ['FTTH', 'Router'], matches: ['ISP'] },
  { id: 'ftth', term: 'FTTH', expansion: 'Fiber To The Home', summary: '光ファイバを家庭まで引き込むアクセス回線の方式です。', why: '光の信号を使うことで、家庭と通信事業者網の間を高速・長距離に接続できます。', related: ['ONU', 'ONT', 'ISP'], matches: ['FTTH'] },
  { id: 'onu', term: 'ONU', expansion: 'Optical Network Unit', summary: '光回線と宅内側の機器をつなぐための回線終端装置です。', why: '光ファイバ上の光信号と、宅内で利用するEthernetなどの信号を接続する境界になるためです。', related: ['ONT', 'FTTH', 'Ethernet'], matches: ['ONU'] },
  { id: 'ont', term: 'ONT', expansion: 'Optical Network Terminal', summary: '光回線の終端に置かれる装置を指す名称です。ONUとほぼ同じ文脈で使われることがあります。', why: '事業者の光アクセス網と利用者側のネットワークを接続するためです。', related: ['ONU', 'FTTH'], matches: ['ONT'] },
  { id: 'wifi', term: 'Wi‑Fi', summary: '無線LANの接続方式を示すブランド名です。正式な略語の展開はありません。', why: 'ケーブルを使わずに家庭内LANへ接続できます。ただし電波状況や混雑により品質は変化します。', related: ['LAN', 'NIC', 'Ethernet'], matches: ['Wi‑Fi', 'WiFi'] },
  { id: 'router', term: 'Router', summary: '宛先IPアドレスをRouting Tableと照合し、通常は最も長いPrefixに一致する経路を選んで次のネットワークや中継先へ送る機器です。', why: 'LANの外にある宛先へデータを届けるには、複数のネットワークをまたぐ経路選択が必要です。', related: ['IP', 'ISP', 'NAT'], matches: ['Router', 'ルーター'] },
  { id: 'switch', term: 'Switch', summary: '主にMACアドレスを参照し、LAN内でEthernet Frameを適切なポートへ転送する機器です。', why: '同じLAN内の通信を効率よく届けるためです。通常、ルーターのようにIP経路を選択する役割とは異なります。', related: ['MAC', 'Ethernet', 'LAN'], matches: ['Switch', 'スイッチ'] },
  { id: 'syn', term: 'SYN', expansion: 'Synchronize', summary: 'TCPヘッダのフラグの1つで、接続開始時に使われます。', why: 'TCP通信で双方の初期状態をそろえ、接続を始めるための3-way handshakeに使われます。', related: ['TCP', 'ACK'], matches: ['SYN'] },
  { id: 'ack', term: 'ACK', expansion: 'Acknowledgment', summary: 'TCPヘッダのフラグの1つで、受信確認を表します。', why: '相手から届いたデータや接続開始要求を確認し、TCPの信頼性を支えるためです。', related: ['TCP', 'SYN'], matches: ['ACK'] },
  { id: 'fcs', term: 'FCS', expansion: 'Frame Check Sequence', summary: 'Ethernet Frameの末尾に置かれる誤り検出用の値です。Ethernetでは通常CRCを利用します。', why: 'リンク上を流れる間にフレームが壊れていないかを受信側が検査するためです。誤りを検出したフレームは通常破棄され、Ethernet自体が再送を保証するわけではありません。', related: ['Ethernet', 'Ethernet Frame', 'TCP'], matches: ['FCS'] },
  { id: 'nat', term: 'NAT', expansion: 'Network Address Translation', summary: 'プライベートIPアドレスとグローバルIPアドレスなどを変換する仕組みです。', why: '家庭内の複数機器がインターネット接続を共有する場面などで使われます。', related: ['IP', 'Router'], matches: ['NAT'] },
  { id: 'arp', term: 'ARP', expansion: 'Address Resolution Protocol', summary: 'IPv4の同一リンク内で、IPアドレスに対応するMACアドレスを調べるための仕組みです。', why: 'Ethernet Frameを次の相手へ送るにはMACアドレスが必要です。PCがIPアドレスしか知らないとき、ARPがその対応を知る手がかりになります。', related: ['MAC', 'Ethernet', 'Switch', 'Router', 'IPv4'], matches: ['ARP'] },
  { id: 'cidr', term: 'CIDR', expansion: 'Classless Inter-Domain Routing', summary: 'IPアドレスのネットワーク部分をPrefix長で表し、経路をまとめる方法です。例：192.168.1.0/24。', why: 'ネットワークのまとまりを表してRouting Tableを効率よく扱い、ルーターが宛先に合う経路を選べるようにするためです。', related: ['IPv4', 'Routing Table', 'Longest Prefix Match'], matches: ['CIDR'] },
  { id: 'routing-table', term: 'Routing Table', summary: 'ルーターなどが、宛先Prefix・Next Hop・Interfaceなどを記録し、次の転送先を選ぶための表です。', why: '宛先IPアドレスだけでは次にどこへ送るか決まりません。対応する経路の情報を保持する必要があります。', related: ['Router', 'CIDR', 'Longest Prefix Match', 'Default Gateway'], matches: ['Routing Table', 'ルーティングテーブル'] },
  { id: 'longest-prefix-match', term: 'Longest Prefix Match', summary: '複数の経路が宛先IPアドレスに一致するとき、通常は最も長いPrefixを持つ、より具体的な経路を選ぶ考え方です。', why: '広いネットワーク向けの一般的な経路と、より狭いネットワーク向けの個別の経路を共存させるためです。', related: ['Routing Table', 'CIDR', 'Router'], matches: ['Longest Prefix Match', '最長一致'] },
  { id: 'default-gateway', term: 'Default Gateway', summary: 'PCが自分と異なるIPネットワークにある宛先へ送るとき、通常最初に渡すルーターです。', why: 'LAN内に直接いない相手へ送るには、次のネットワークに出るための入口が必要です。', related: ['Router', 'ARP', 'IPv4'], matches: ['Default Gateway', 'デフォルトゲートウェイ'] },
  { id: 'napt', term: 'NAPT', expansion: 'Network Address and Port Translation', summary: 'IPアドレスに加えてPortも変換し、複数の内部通信を外部側のアドレス・Portと対応付ける仕組みです。', why: '1つまたは少数の外部側IPアドレスを複数端末で共有する場合に、返信をどの通信へ戻すか区別するためです。', related: ['NAT', 'TCP', 'Router'], matches: ['NAPT'] },
  { id: 'dhcp', term: 'DHCP', expansion: 'Dynamic Host Configuration Protocol', summary: '端末へIPアドレスやDefault Gateway、DNS Serverなどのネットワーク設定を配布する仕組みです。', why: '端末ごとに設定を手作業で入力せず、ネットワークへ参加するために必要な情報を管理しやすくするためです。', related: ['IPv4', 'Default Gateway', 'DNS'], matches: ['DHCP'] },
  { id: 'ndp', term: 'NDP', expansion: 'Neighbor Discovery Protocol', summary: 'IPv6の同一リンク内で、近隣機器やルーターを見つけるためにICMPv6を利用する仕組みです。', why: 'IPv6で次の相手へデータを送るには、近隣機器やルーターの情報を知る必要があります。IPv4のARPとは別の仕組みです。', related: ['IPv6', 'ARP', 'Router'], matches: ['NDP', 'Neighbor Discovery Protocol'] },
  { id: 'firewall', term: 'Firewall', summary: '通信の条件をルールと照合し、許可・拒否などを判断する防御の仕組みです。', why: '公開するサービスやネットワークへ届く通信を必要な範囲に絞り、不要な到達を減らすためです。Firewallだけで安全性をすべて保証するものではありません。', related: ['IP', 'TCP', 'Port', 'Router'], matches: ['Firewall', 'ファイアウォール'] },
  { id: 'cpu', term: 'CPU', expansion: 'Central Processing Unit', summary: 'プログラムの命令を読み取り、演算・比較・分岐などを実行する処理装置です。', why: 'ソフトウェアで記述された手順を、実際の計算や制御として進める中心が必要だからです。', related: ['Instruction', 'Register', 'ALU', 'Cache'], matches: ['CPU'] },
  { id: 'instruction', term: 'Instruction', summary: 'CPUへ「加算する」「メモリから読む」「分岐する」などを指示する、機械語の基本単位です。', why: 'プログラムの処理をCPUが解釈・実行できる小さな操作へ表すためです。', related: ['CPU', 'Register', 'ALU'], matches: ['Instruction', '命令'] },
  { id: 'program-counter', term: 'Program Counter', summary: 'CPUが次に取り出す命令の位置を示すための状態です。PCと略されることがあります。', why: '命令を順番に進めたり、分岐先へ移動したりするには、次に読む命令を示す目印が必要だからです。', related: ['Instruction', 'Instruction Register', 'Control Unit'], matches: ['Program Counter', 'プログラムカウンタ'] },
  { id: 'instruction-register', term: 'Instruction Register', summary: '読み出した命令を保持し、解釈に使うための場所を表す教育用のCPUモデルです。IRと略されることがあります。', why: '命令のビット列を、制御回路が扱える状態として保持してから、次の処理へ渡すためです。', related: ['Instruction', 'Program Counter', 'Control Unit'], matches: ['Instruction Register', '命令レジスタ'] },
  { id: 'control-unit', term: 'Control Unit', summary: '命令を解釈し、CPU内のどの回路をいつ動かすかを制御する仕組みです。', why: 'レジスタ、ALU、メモリなどの複数の部分が、命令に応じて正しい順序で協調する必要があるためです。', related: ['Instruction', 'ALU', 'Register'], matches: ['Control Unit', '制御装置'] },
  { id: 'fetch', term: 'Fetch', summary: 'Program Counterが示す位置から、次に実行する命令を読み出す段階です。', why: 'CPUが実行する内容を知るには、まず命令のビット列を取り出す必要があるためです。', related: ['Program Counter', 'Instruction', 'Memory'], matches: ['Fetch', '命令取得'] },
  { id: 'decode', term: 'Decode', summary: '読み出した命令のビット列を解釈し、必要な操作やデータ経路を決める段階です。', why: '同じビット列でも、命令セットで定められた意味に従って、どの回路を使うか決める必要があるためです。', related: ['Instruction Register', 'Control Unit', 'Execute'], matches: ['Decode', '命令解釈'] },
  { id: 'execute', term: 'Execute', summary: '命令に従って演算、比較、分岐、メモリ操作などを行う段階を表す呼び方です。', why: 'Decodeで決まった処理を実際に進め、プログラムの状態を変えるためです。', related: ['ALU', 'Control Unit', 'Writeback'], matches: ['Execute', '命令実行'] },
  { id: 'writeback', term: 'Writeback', summary: '演算などで得た結果を、Registerなどへ戻して後続の命令が使えるようにする段階です。', why: '計算結果をCPUの状態として保存し、次の処理へ引き継ぐためです。', related: ['Execute', 'Register', 'Instruction'], matches: ['Writeback', '書き戻し'] },
  { id: 'register', term: 'Register', summary: 'CPU内部にある非常に高速で小容量の記憶場所です。計算中の値や次の命令の位置などを保持します。', why: '演算に使う値へ素早くアクセスし、命令実行を進めるためです。', related: ['CPU', 'ALU', 'Instruction'], matches: ['Register', 'レジスタ'] },
  { id: 'cache', term: 'Cache', summary: 'CPUの近くに、よく使うデータや命令のコピーを保持する高速な記憶領域です。', why: 'CPUが主記憶の応答を待つ時間を減らし、平均的な処理速度を高めるためです。', related: ['CPU', 'Memory'], matches: ['Cache', 'キャッシュ'] },
  { id: 'memory', term: 'Memory', summary: '実行中のプログラムやデータを保持する記憶領域です。通常は主記憶（RAM）を指す文脈で使われます。', why: 'CPUが実行する命令や扱うデータを、必要なときに読み書きできるようにするためです。', related: ['CPU', 'Cache', 'Virtual Memory'], matches: ['Memory', 'メモリ', 'RAM'] },
  { id: 'process', term: 'Process', summary: 'OSが管理する、実行中または実行可能なプログラムの単位です。メモリ空間や資源の情報を持ちます。', why: '複数のプログラムを安全に並行して扱い、CPUやメモリを割り当てるためです。', related: ['Thread', 'Scheduler', 'Context Switch'], matches: ['Process', 'プロセス'] },
  { id: 'thread', term: 'Thread', summary: 'Processの中で実行される、より小さな処理の流れです。同じProcess内の資源を共有できます。', why: '1つのアプリケーションの中で複数の作業を並行して進めやすくするためです。', related: ['Process', 'Context Switch'], matches: ['Thread', 'スレッド'] },
  { id: 'scheduler', term: 'Scheduler', summary: 'OSの中で、どのProcessやThreadへ次にCPU時間を割り当てるかを決める仕組みです。', why: '複数の処理がCPUを公平かつ効率よく使えるようにするためです。', related: ['Process', 'Context Switch'], matches: ['Scheduler', 'スケジューラ'] },
  { id: 'context-switch', term: 'Context Switch', summary: 'CPUが実行するProcessやThreadを切り替える際、現在の実行状態を保存し、次の状態を復元する処理です。', why: '1つのCPUでも複数の処理を交互に進められるようにするためです。', related: ['Process', 'Thread', 'Scheduler'], matches: ['Context Switch', 'コンテキストスイッチ'] },
  { id: 'virtual-memory', term: 'Virtual Memory', summary: '各Processに連続した大きなアドレス空間があるように見せ、物理メモリを管理する仕組みです。', why: 'Processどうしを分離し、限られた物理メモリを柔軟に扱うためです。', related: ['Memory', 'Paging', 'Process'], matches: ['Virtual Memory', '仮想メモリ'] },
  { id: 'paging', term: 'Paging', summary: '仮想メモリを一定サイズのページに分け、物理メモリ上の配置と対応付ける管理方式です。', why: '各Processの連続したアドレス空間を、実際のメモリ配置から分離して扱うためです。', related: ['Virtual Memory', 'Memory'], matches: ['Paging', 'ページング'] },
  { id: 'ready-queue', term: 'Ready Queue', summary: '実行できる状態だが、CPUが空くのを待つProcessやThreadを並べておく考え方です。', why: '1つのCPUコアが同時に実行できる仕事には限りがあるため、次に動かす候補を管理する必要があります。', related: ['Scheduler', 'Process', 'Thread'], matches: ['Ready Queue', 'レディキュー'] },
  { id: 'io', term: 'I/O', expansion: 'Input / Output', summary: 'ディスク、ネットワーク、キーボードなど、CPUやメモリの外側とデータをやり取りする処理です。', why: 'プログラムは計算だけで完結せず、保存・通信・利用者操作など外部とのやり取りが必要になるためです。', related: ['Process', 'Interrupt', 'Memory'], matches: ['I/O', '入出力'] },
  { id: 'time-slice', term: 'Time Slice', summary: 'OSが実行可能な仕事へ一度に割り当てるCPU時間の目安です。タイムクォンタムとも呼ばれます。', why: '1つの処理がCPUを長く占有し続けず、複数の処理が応答性を保ちながら進められるようにするためです。', related: ['Scheduler', 'Context Switch', 'Process'], matches: ['Time Slice', 'タイムスライス', 'タイムクォンタム'] },
  { id: 'interrupt', term: 'Interrupt', summary: '外部装置などからの通知をきっかけに、CPUが通常の実行を一時中断して必要な処理へ移る仕組みです。', why: 'I/Oの完了などをCPUが常に確認し続けず、必要なときに対応できるようにするためです。', related: ['I/O', 'Context Switch', 'Scheduler'], matches: ['Interrupt', '割り込み'] },
  { id: 'database', term: 'Database', summary: 'アプリケーションが使うデータを、検索・更新・整合性の仕組みとともに保持するシステムです。', why: '複数の利用者や処理が必要なデータを、管理可能な形で安全に扱うためです。', related: ['Transaction', 'Index', 'Lock'], matches: ['Database', 'データベース', 'DB'] },
  { id: 'transaction', term: 'Transaction', summary: '複数のデータ操作を、まとめて成功または失敗として扱う処理単位です。', why: '途中までしか更新されない不整合な状態を減らすためです。', related: ['Commit', 'Rollback', 'Lock', 'ACID'], matches: ['Transaction', 'トランザクション'] },
  { id: 'acid', term: 'ACID', expansion: 'Atomicity, Consistency, Isolation, Durability', summary: 'トランザクションを考えるときの代表的な性質をまとめた呼び方です。', why: '更新のまとまり、整合性、同時実行、障害後の扱いを整理して考えるためです。', related: ['Transaction', 'Commit', 'Rollback'], matches: ['ACID'] },
  { id: 'lock', term: 'Lock', summary: '同じデータを複数の処理が同時に更新するとき、競合を調整するための仕組みです。', why: '更新が互いに上書きし合ったり、不整合な途中状態を読んだりすることを減らすためです。', related: ['Transaction', 'Rollback'], matches: ['Lock', 'ロック'] },
  { id: 'commit', term: 'Commit', summary: 'Transactionで行った変更を確定する操作です。', why: '一連の更新が成功したことを明示し、他の処理から整合した状態として扱えるようにするためです。', related: ['Transaction', 'Rollback'], matches: ['Commit', 'コミット'] },
  { id: 'rollback', term: 'Rollback', summary: 'Transactionで行った未確定の変更を取り消し、開始前の状態へ戻す操作です。', why: '途中で失敗した更新を残さず、整合した状態に戻すためです。', related: ['Transaction', 'Commit'], matches: ['Rollback', 'ロールバック'] },
  { id: 'index', term: 'Index', summary: 'データの場所を探しやすくするための補助的な構造です。DBではB-treeなどがよく使われます。', why: '大量の行を最初から順に調べず、必要なデータへ効率よくたどるためです。', related: ['Database', 'Binary Search'], matches: ['Index', 'インデックス'] },
  { id: 'isolation-level', term: 'Isolation Level', summary: '同時に動くTransactionどうしで、どの変更をどの時点で読めるかなどに関係する設定・性質です。', why: '複数の更新や読み取りが重なるとき、整合性と待ち時間のバランスを設計する必要があるためです。', related: ['Transaction', 'Lock', 'MVCC'], matches: ['Isolation Level', '分離レベル', '隔離レベル'] },
  { id: 'mvcc', term: 'MVCC', expansion: 'Multi-Version Concurrency Control', summary: 'データの複数の版を使い、読み取りと更新の競合を抑えるための同時実行制御の考え方です。', why: '読み取りと更新が必要以上に互いを待たずに済むようにしつつ、Transactionごとに一貫した見え方を作るためです。', related: ['Transaction', 'Isolation Level', 'Lock'], matches: ['MVCC', 'Multi-Version Concurrency Control'] },
  { id: 'row-lock', term: 'Row Lock', summary: '特定の行を更新する間に、競合する操作を調整するためのLockの代表例です。', why: '無関係なデータまで止めずに、同じデータへの同時更新による不整合を減らすためです。', related: ['Lock', 'Transaction', 'Isolation Level'], matches: ['Row Lock', '行ロック'] },
  { id: 'certificate', term: 'Certificate', summary: 'TLSで接続先の公開鍵や名前などを示し、認証に使う電子的な証明書です。', why: '暗号化する相手が意図したサーバーであるかを検証する手がかりにするためです。', related: ['TLS', 'Public Key'], matches: ['Certificate', '証明書'] },
  { id: 'public-key', term: 'Public Key', summary: '公開してよい鍵です。対応する秘密鍵と組み合わせて、暗号や署名の仕組みに使われます。', why: '安全に共有できる情報を使い、相手の確認や鍵合意を行うためです。', related: ['TLS', 'Certificate', 'Session Key'], matches: ['Public Key', '公開鍵'] },
  { id: 'session-key', term: 'Session Key', summary: '通信のセッションごとに使う共通鍵です。TLSでは、鍵合意によって得た鍵を使いデータを効率よく保護します。', why: '大量の通信データを、効率よく暗号化・復号するためです。', related: ['TLS', 'Public Key'], matches: ['Session Key', 'セッション鍵'] },
  { id: 'private-key', term: 'Private Key', summary: '対応するPublic Keyと組になる、外部へ公開してはいけない鍵です。', why: 'TLSではServerが正しい秘密鍵を持つことを示すことで、接続先の認証を助けるためです。', related: ['Public Key', 'Certificate', 'TLS'], matches: ['Private Key', '秘密鍵'] },
  { id: 'shared-secret', term: 'Shared Secret', summary: '鍵交換を通じてClientとServerの双方が導く、通信を保護する鍵の材料です。', why: '値そのものをネットワークへ送らずに、双方で保護鍵を導き出せるようにするためです。', related: ['TLS', 'Session Key', 'Public Key'], matches: ['Shared Secret', '共有秘密'] },
  { id: 'sni', term: 'SNI', expansion: 'Server Name Indication', summary: 'TLS接続を始めるときに、接続したいホスト名をServerへ知らせるための拡張です。', why: '複数のWebサイトが同じIPアドレスを共有する場合でも、Serverが適切な証明書を選べるようにするためです。', related: ['TLS', 'Certificate', 'HTTPS'], matches: ['SNI', 'Server Name Indication'] },
  { id: 'load-balancer', term: 'Load Balancer', summary: '受け取ったリクエストを複数のサーバーへ振り分ける役割を持つ仕組みです。', why: '1台への負荷集中を避け、障害時にも処理を続けやすくするためです。', related: ['Reverse Proxy', 'Health Check', 'Web Server'], matches: ['Load Balancer', 'ロードバランサー'] },
  { id: 'reverse-proxy', term: 'Reverse Proxy', summary: '利用者からのリクエストを受け、内側のWeb Serverなどへ代理で転送する仕組みです。', why: '公開する入口をまとめ、TLS終端・負荷分散・キャッシュなどの役割を分けるためです。', related: ['Load Balancer', 'Web Server'], matches: ['Reverse Proxy', 'リバースプロキシ'] },
  { id: 'health-check', term: 'Health Check', summary: 'サーバーやサービスが応答できるかを確認し、正常な送信先を判断するための検査です。', why: '障害やメンテナンス中のサーバーへ、不要なリクエストを送らないためです。', related: ['Load Balancer'], matches: ['Health Check', 'ヘルスチェック'] },
  { id: 'round-robin', term: 'Round Robin', summary: '利用可能なServerを順番に1台ずつ選ぶ、Load Balancerの代表的な振り分け方式です。', why: '単純な規則でリクエストを分散できるためです。ただしServerごとの処理時間や接続数の差までは直接考慮しません。', related: ['Load Balancer', 'Least Connections', 'Health Check'], matches: ['Round Robin', 'ラウンドロビン'] },
  { id: 'least-connections', term: 'Least Connections', summary: '現在の接続数が少ないServerを優先して選ぶ、Load Balancerの代表的な振り分け方式です。', why: '長く処理中の接続が多いServerへ新しい通信を集中させにくくするためです。接続数の数え方や重み付けは製品により異なります。', related: ['Load Balancer', 'Round Robin', 'Health Check'], matches: ['Least Connections', '最小接続数'] },
  { id: 'l4-l7', term: 'L4 / L7', summary: 'Load Balancerなどが、IP・Portまでの情報で判断するか、HTTPなどアプリケーション層の情報まで見るかを表す区分です。', why: '振り分けに使える情報、TLSの扱い、PathやHostでの分岐など、設計上の選択肢を整理するためです。', related: ['Load Balancer', 'TCP', 'HTTP'], matches: ['L4/L7', 'L4 / L7'] },
  { id: 'session-affinity', term: 'Session Affinity', summary: '同じ利用者からの後続リクエストを、同じServerへ送りやすくする仕組みです。スティッキーセッションとも呼ばれます。', why: 'Server側に一時的な状態を持つ構成で、利用者の処理を継続しやすくするためです。一方で負荷の偏りや障害時の切り替えも考える必要があります。', related: ['Load Balancer', 'Health Check', 'Session Key'], matches: ['Session Affinity', 'セッションアフィニティ', 'スティッキーセッション'] },
  { id: 'algorithm', term: 'Algorithm', summary: '問題を解くための、明確な手順や計算方法です。', why: '同じ目的でも、入力の大きさに応じて必要な時間やメモリが大きく変わるため、手順を比較して選ぶ必要があります。', related: ['Array', 'Binary Search'], matches: ['Algorithm', 'アルゴリズム'] },
  { id: 'array', term: 'Array', summary: '要素を順序付きで並べ、位置（添字）でアクセスできるデータ構造です。', why: '複数の値をまとまりとして扱い、特定の位置の値へ素早くアクセスするためです。', related: ['Binary Search', 'Algorithm'], matches: ['Array', '配列'] },
  { id: 'binary-search', term: 'Binary Search', summary: '整列済みの配列で、中央と比較しながら探索範囲を半分ずつ絞るアルゴリズムです。', why: '最初から順に比較するより、必要な比較回数を大幅に減らせる場合があるためです。', related: ['Array', 'Algorithm', 'Index'], matches: ['Binary Search', '二分探索'] },
  { id: 'time-complexity', term: 'Time Complexity', summary: '入力の大きさに応じて、計算回数がどのように増えるかを表す目安です。', why: '同じ目的のAlgorithmでも、データ量が増えたときの扱いやすさを比較するためです。実際の秒数だけを直接示すものではありません。', related: ['Algorithm', 'Binary Search', 'Index'], matches: ['Time Complexity', '計算量', 'O(log n)'] },
  { id: 'cache-line', term: 'Cache Line', summary: 'CacheとMain Memoryの間で、まとまりとして読み書きされるデータの単位です。', why: '近くのデータも続けて使われやすい性質を利用し、1回のメモリアクセスを効率よく使うためです。', related: ['Cache', 'Memory', 'Cache Hit'], matches: ['Cache Line', 'キャッシュライン'] },
  { id: 'cache-hit', term: 'Cache Hit', summary: 'CPUが必要とするデータや命令が、すでにCache内に見つかる状態です。', why: 'Main Memoryまで待たずに済むため、平均的なアクセス時間を小さくできます。', related: ['Cache', 'Cache Miss', 'Cache Line'], matches: ['Cache Hit', 'キャッシュヒット'] },
  { id: 'cache-miss', term: 'Cache Miss', summary: 'CPUが必要とするデータや命令がCache内に見つからず、下位のMemory階層から取得する必要がある状態です。', why: 'Cacheにすべてのデータは収まらないため、必要なときに取り込む仕組みが必要です。', related: ['Cache', 'Cache Hit', 'Memory'], matches: ['Cache Miss', 'キャッシュミス'] },
  { id: 'page-table', term: 'Page Table', summary: 'Virtual Addressのページ番号を、Physical Memory上のFrameなどへ対応付けるための表です。', why: 'Processごとに独立したアドレス空間を見せつつ、実際のメモリ配置をOSが管理するためです。', related: ['Virtual Memory', 'Paging', 'Page Fault'], matches: ['Page Table', 'ページテーブル'] },
  { id: 'page-fault', term: 'Page Fault', summary: 'Virtual Addressに対応するページが、必要な形でPhysical Memoryにないときに起きる例外・処理です。', why: '必要なページをストレージなどから読み込んだり、アクセスの正しさを確認したりする必要があるためです。', related: ['Virtual Memory', 'Paging', 'Page Table'], matches: ['Page Fault', 'ページフォールト'] },
  { id: 'tlb', term: 'TLB', expansion: 'Translation Lookaside Buffer', summary: '最近使ったVirtual AddressからPhysical Addressへの変換結果を保持する高速なキャッシュです。', why: '毎回Page Tableをたどる負担を減らし、アドレス変換を速くするためです。', related: ['Virtual Memory', 'Page Table', 'Cache'], matches: ['TLB', 'Translation Lookaside Buffer'] },
  { id: 'b-tree', term: 'B-tree', summary: '複数の子を持つNodeを使い、ディスクやページ単位のデータを効率よく探索するためによく使われる木構造の一種です。', why: '木の高さを小さく保ち、多くのデータから必要な範囲へ少ない段階で近づくためです。', related: ['Index', 'Leaf Node', 'Database'], matches: ['B-tree', 'B-tree系', 'B木'] },
  { id: 'leaf-node', term: 'Leaf Node', summary: '木構造の末端にあるNodeです。B-tree系のIndexでは、検索対象のキーやデータ位置への参照を持つことがあります。', why: '上位のNodeで候補を絞ったあと、実際の目的のデータ位置へたどり着くためです。', related: ['B-tree', 'Index', 'Row'], matches: ['Leaf Node', '葉ノード'] },
  { id: 'row', term: 'Row', summary: 'Tableの中で、1件分のデータを表す横方向のまとまりです。Recordと呼ばれることもあります。', why: '複数のColumnに分かれた属性を、1つの対象に対応するデータとしてまとめるためです。', related: ['Database', 'Index', 'Transaction'], matches: ['Row', '行', 'Record', 'レコード'] },
  { id: 'hash', term: 'Hash', summary: '任意の長さのデータから、決まった長さの値を計算する関数や、その結果を指す言葉です。', why: 'データが変わると結果も変わる性質を利用し、改ざん検出やデータ構造の設計に使うためです。', related: ['Digital Signature', 'Certificate'], matches: ['Hash', 'ハッシュ'] },
  { id: 'digital-signature', term: 'Digital Signature', summary: 'HashなどをPrivate Keyで署名し、Public Keyで検証することで、改ざん検出と署名者の確認に使う仕組みです。', why: '受け取ったデータが途中で書き換えられていないことと、対応する秘密鍵の所有者が署名したことを確かめるためです。', related: ['Hash', 'Private Key', 'Public Key', 'Certificate'], matches: ['Digital Signature', '電子署名'] },
  { id: 'failover', term: 'Failover', summary: '稼働中の機器やサービスに障害が起きたとき、待機系や別の健全な系へ役割を切り替える仕組みです。', why: '1つの障害点によってサービス全体が止まる時間を減らすためです。', related: ['Redundancy', 'Active / Standby', 'Health Check'], matches: ['Failover', 'フェイルオーバー'] },
  { id: 'redundancy', term: 'Redundancy', summary: '同じ役割を担える機器・経路・データを複数用意して、障害に備える考え方です。', why: '一部が故障しても、残りの要素でサービスを継続できる可能性を高めるためです。', related: ['Failover', 'Load Balancer'], matches: ['Redundancy', '冗長化'] },
  { id: 'active-standby', term: 'Active / Standby', summary: '通常はActiveが処理を担当し、Standbyが障害時に引き継げるよう準備する構成です。', why: '役割を明確にしながら、障害時に別の系へ切り替えられるようにするためです。', related: ['Failover', 'Redundancy'], matches: ['Active / Standby', 'Active/Standby', 'アクティブ／スタンバイ'] },
  { id: 'graph', term: 'Graph', summary: 'Nodeと、それらを結ぶEdgeで、つながりを表すデータ構造です。', why: '経路、依存関係、SNSの関係のように、値が単純な1列ではない構造を表すためです。', related: ['Node', 'Edge', 'BFS', 'DFS'], matches: ['Graph', 'グラフ'] },
  { id: 'node', term: 'Node', summary: 'Graphや木構造を構成する1つの要素です。Vertexと呼ばれることもあります。', why: '対象どうしのつながりを、個別の地点や要素として表すためです。', related: ['Graph', 'Edge'], matches: ['Node', 'ノード', 'Vertex'] },
  { id: 'edge', term: 'Edge', summary: 'GraphでNodeどうしの関係や接続を表す線です。', why: 'どのNodeからどのNodeへ移動・参照できるかを表現するためです。', related: ['Graph', 'Node'], matches: ['Edge', 'エッジ'] },
  { id: 'bfs', term: 'BFS', expansion: 'Breadth-First Search', summary: '近いNodeから順に幅を広げるように探索するGraph探索の方法です。通常はQueueを使って次の候補を管理します。', why: '無重みGraphで辺の本数が最も少ない経路を調べるなど、近い関係から順に確認したいときに役立つためです。', related: ['Graph', 'Queue', 'DFS'], matches: ['BFS', 'Breadth-First Search', '幅優先探索'] },
  { id: 'dfs', term: 'DFS', expansion: 'Depth-First Search', summary: '1つの経路をできるだけ深く進んでから戻るように探索するGraph探索の方法です。再帰やStackで表現できます。', why: '連結している範囲を調べたり、探索木を作ったりするために使われます。', related: ['Graph', 'Stack', 'BFS'], matches: ['DFS', 'Depth-First Search', '深さ優先探索'] },
  { id: 'queue', term: 'Queue', summary: '先に入れた要素から先に取り出す、First In First Outのデータ構造です。', why: 'BFSのように、先に見つけた候補から順に処理したい場合に使うためです。', related: ['BFS', 'Graph'], matches: ['Queue', 'キュー'] },
  { id: 'stack', term: 'Stack', summary: '最後に入れた要素から先に取り出す、Last In First Outのデータ構造です。', why: 'DFSのように、直近の分岐から先に深くたどりたい場合に使うためです。', related: ['DFS', 'Graph'], matches: ['Stack', 'スタック'] },
].map(term => ({
  ...term,
  category: TERM_CATEGORIES[term.id] ?? 'link',
  beginnerGuide: BEGINNER_GUIDES[term.id],
  deepDive: DEEP_DIVES[term.id] ?? [],
}))

export function glossaryTermsFor(context: string[]) {
  const text = context.join(' ')
  const matches = GLOSSARY_TERMS.filter(item => item.matches.some(value => text.includes(value)))
  return matches.length > 0 ? matches.slice(0, 9) : GLOSSARY_TERMS.filter(item => ['url', 'dns', 'tcp', 'ip', 'ethernet'].includes(item.id))
}
