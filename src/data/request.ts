import type { RequestStage } from '../types/request'

export const REQUEST_STAGES: RequestStage[] = [
  { id: 'dns-query', title: 'DNS問い合わせを送る', shortTitle: 'DNS問い合わせ', range: [0, .09], protocol: 'DNS', fromNodeId: 'pc', toNodeId: 'dns-server', nodePath: ['pc', 'switch', 'home-router', 'dns-server'], description: 'PCはドメイン名をIPアドレスに変換するため、DNSリゾルバへ問い合わせます。ここではISP側にリゾルバがあるものとして描いています。', learningPoint: { title: '名前を調べる準備', body: 'URLに含まれるドメイン名の宛先を知るため、まずDNSへ問い合わせています。', focus: '右側の「DNS問い合わせ」を選ぶと、DNSサーバーの役割を確認できます。' } },
  { id: 'dns-answer', title: 'DNS応答でIPアドレスを受け取る', shortTitle: 'DNS応答', range: [.09, .17], protocol: 'DNS', fromNodeId: 'dns-server', toNodeId: 'pc', nodePath: ['dns-server', 'home-router', 'switch', 'pc'], description: 'この例では、A / AAAAレコードの問い合わせに対して名前に対応するIPアドレスを受け取ります。DNSはIPアドレス以外にもさまざまな情報を扱い、実際にはキャッシュや複数のDNSサーバーへの問い合わせが関わる場合があります。', learningPoint: { title: '名前をIPアドレスへ対応付ける', body: 'DNSは名前と情報を対応付ける仕組みです。この例ではA / AAAAレコードを代表例として扱います。', focus: '右側の「DNS問い合わせ / DNS応答」を選ぶと、DNSサーバーの内部へ進めます。' } },
  { id: 'tcp-syn', title: 'TCP SYNをサーバーへ送る', shortTitle: 'SYN', range: [.17, .27], protocol: 'TCP', fromNodeId: 'pc', toNodeId: 'web-server', nodePath: ['pc', 'switch', 'home-router', 'isp-router', 'internet-router', 'web-server'], description: 'クライアントは接続開始を示すSYNを送ります。このメッセージもEthernet、IPなどの層に包まれて運ばれます。', learningPoint: { title: 'TCP接続を始める', body: 'PCとサーバーが通信を始めるため、TCPの3ウェイハンドシェイクを進めています。', focus: '右側のSYNを選ぶと、TCPヘッダのフラグを確認できます。' } },
  { id: 'tcp-synack', title: 'TCP SYN + ACKが返る', shortTitle: 'SYN + ACK', range: [.27, .37], protocol: 'TCP', fromNodeId: 'web-server', toNodeId: 'pc', nodePath: ['web-server', 'internet-router', 'isp-router', 'home-router', 'switch', 'pc'], description: 'サーバーは接続開始を受け入れるSYN + ACKを返します。これにより両者は接続の準備を進めます。', learningPoint: { title: '接続開始を確認する', body: 'サーバーはSYNを受け取り、SYNとACKの両方を返して通信の準備をそろえます。', focus: '右側の「SYN + ACK」からTCPセグメントのフラグを確認できます。' } },
  { id: 'tcp-ack', title: 'TCP ACKで接続を確立', shortTitle: 'ACK', range: [.37, .45], protocol: 'TCP', fromNodeId: 'pc', toNodeId: 'web-server', nodePath: ['pc', 'switch', 'home-router', 'isp-router', 'internet-router', 'web-server'], description: 'クライアントがACKを返すと、一般的なTCP 3ウェイハンドシェイクが完了します。接続済みで再利用される場合もあります。', learningPoint: { title: 'TCP接続が使える状態になる', body: '一般的なTCPの接続確立が完了し、アプリケーションのデータを送る準備が整います。', focus: '右側のACKを選ぶと、TCPヘッダと受信確認の役割を確認できます。' } },
  { id: 'tls-client', title: 'TLS ClientHelloを送る', shortTitle: 'ClientHello', range: [.45, .55], protocol: 'TLS', fromNodeId: 'pc', toNodeId: 'web-server', nodePath: ['pc', 'switch', 'home-router', 'isp-router', 'internet-router', 'web-server'], description: 'HTTPSでは、クライアントが対応する暗号方式などを提示して、安全な通信の準備を開始します。', learningPoint: { title: 'TLSで保護する準備', body: 'HTTPリクエストを送る前に、暗号化と接続先確認のためのTLS処理を進めます。', focus: 'この画面ではTLSの詳細な暗号計算ではなく、通信の順番を学びます。' } },
  { id: 'tls-server', title: 'TLS ServerHelloと証明書を受け取る', shortTitle: 'ServerHello', range: [.55, .66], protocol: 'TLS', fromNodeId: 'web-server', toNodeId: 'pc', nodePath: ['web-server', 'internet-router', 'isp-router', 'home-router', 'switch', 'pc'], description: 'サーバーは選択した暗号方式や証明書などを返します。ブラウザは証明書の検証を行います。', learningPoint: { title: '接続先を確認する', body: 'サーバーはTLSの設定候補と証明書を返し、ブラウザは接続先を確認する処理を進めます。', focus: 'ここではTLSの順序を示しています。暗号計算の詳細は教育用に省略しています。' } },
  { id: 'tls-finish', title: 'TLSの準備を完了する', shortTitle: 'TLS確立', range: [.66, .73], protocol: 'TLS', fromNodeId: 'pc', toNodeId: 'web-server', nodePath: ['pc', 'switch', 'home-router', 'isp-router', 'internet-router', 'web-server'], description: '鍵の合意が完了すると、以後のHTTPメッセージを暗号化して運べる状態になります。', learningPoint: { title: '保護された通信を始められる', body: 'TLSの準備が整い、以後のHTTPメッセージを保護して送れる状態になります。', focus: '次は左側のHTTPリクエストとカプセル化図に注目してください。' } },
  { id: 'http-request', title: '暗号化されたHTTPリクエストを送る', shortTitle: 'HTTPリクエスト', range: [.73, .93], protocol: 'HTTPS', fromNodeId: 'pc', toNodeId: 'web-server', nodePath: ['pc', 'switch', 'home-router', 'isp-router', 'internet-router', 'web-server'], description: 'GETリクエストがTLSで保護され、TCP・IP・Ethernetに包まれて、LANスイッチと複数のルーターを経由して届きます。', learningPoint: { title: 'HTTPリクエストを運ぶ', body: 'アプリケーションの要求は、TCP・IP・Ethernetの順に必要な情報を付けて運ばれます。', focus: '左側のカプセル化図を選ぶと、それぞれのデータ構造を詳しく確認できます。' } },
  { id: 'server-process', title: 'サーバーでデカプセル化して処理', shortTitle: 'サーバー処理', range: [.93, 1], protocol: 'HTTP', fromNodeId: 'web-server', toNodeId: 'web-server', nodePath: ['web-server'], description: 'サーバー側はEthernet → IP → TCP → TLS → HTTPの順に必要な処理を行い、Webアプリケーションへリクエストを渡します。次はHTTPレスポンスが逆向きに返ります。', learningPoint: { title: '届いたデータを取り出す', body: 'サーバーでは受信時に、送信時とは逆の順番で必要な情報を外し、HTTPリクエストをアプリケーションへ渡します。', focus: 'Webサーバーを選ぶと、受信側の内部処理を探索できます。' } },
]

export function requestStageAt(progress: number | null) {
  if (progress === null) return null
  return REQUEST_STAGES.find((stage) => progress >= stage.range[0] && progress <= stage.range[1]) ?? REQUEST_STAGES.at(-1)!
}

export function stageProgress(stage: RequestStage | null, progress: number | null) {
  if (!stage || progress === null) return 0
  const [start, end] = stage.range
  return Math.max(0, Math.min(1, (progress - start) / (end - start)))
}

export function toRequestLine(url: string) {
  try {
    const parsed = new URL(url)
    return `GET ${(parsed.pathname || '/') + parsed.search} HTTP/1.1\nHost: ${parsed.host}`
  } catch {
    return 'URLを選択してください'
  }
}
