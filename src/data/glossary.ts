import type { GlossaryCategory, GlossaryCategoryId, GlossaryDetailSection, GlossaryTerm } from '../types/glossary'

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  { id: 'computer', title: 'コンピュータ内部', description: 'CPUや命令実行など、PCの中で起きる処理です。' },
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
}

const TERM_CATEGORIES: Record<string, GlossaryCategoryId> = {
  alu: 'computer',
  url: 'web', dns: 'web', http: 'web', https: 'web', tls: 'web',
  tcp: 'transport', udp: 'transport', syn: 'transport', ack: 'transport', port: 'transport',
  ip: 'ip-routing', ipv4: 'ip-routing', ipv6: 'ip-routing', router: 'ip-routing', nat: 'ip-routing', napt: 'ip-routing', cidr: 'ip-routing', 'routing-table': 'ip-routing', 'longest-prefix-match': 'ip-routing', 'default-gateway': 'ip-routing', dhcp: 'ip-routing',
  ethernet: 'link', mac: 'link', nic: 'link', lan: 'link', switch: 'link', wifi: 'link', fcs: 'link', arp: 'link', ndp: 'link',
  isp: 'access', ftth: 'access', onu: 'access', ont: 'access',
  firewall: 'security',
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
].map(term => ({ ...term, category: TERM_CATEGORIES[term.id] ?? 'link', deepDive: DEEP_DIVES[term.id] ?? [] }))

export function glossaryTermsFor(context: string[]) {
  const text = context.join(' ')
  const matches = GLOSSARY_TERMS.filter(item => item.matches.some(value => text.includes(value)))
  return matches.length > 0 ? matches.slice(0, 9) : GLOSSARY_TERMS.filter(item => ['url', 'dns', 'tcp', 'ip', 'ethernet'].includes(item.id))
}
