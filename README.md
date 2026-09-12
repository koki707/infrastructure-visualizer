# Infrastructure Simulator β

Webアクセスを入口に、PCからサーバーまでの通信やIT・コンピュータの見えない仕組みを、3Dシミュレーションとインタラクティブ図解で学ぶ個人開発の教育用Webアプリです。

> 見えないITインフラを、見て・触って・中に入って理解する。

URL選択、DNS、TCP、TLS、HTTP、Ethernet、PC内部、ルーター内部などを、ブラウザ内だけで動く教育用モデルとして表示します。さらに、ARP、CIDRによる経路選択、NAT / NAPTを操作できる図解教材として追加しています。**選択したURLへ実際にアクセスしたり、DNS問い合わせやパケット送信を行ったりすることはありません。**

特定の資格試験の完全対策や範囲網羅を目的としたサイトではありません。教科書や文章だけではイメージしにくい仕組みを、見て・動かして理解するための学習補助ツールです。

## 現在の主な機能

- PC、LAN Switch、Home/ISP/Internet Router、DNS Server、複数のWeb Serverを含む3Dネットワーク
- URL選択からDNS、TCP 3-way handshake、TLS、HTTP Request、サーバー処理までを追う通信シミュレーション
- 送信停止・再開、通信経路、Learning Point、カプセル化、必要なときに開くビット列の表示
- PC・Switch・Router・DNS Server・Web Serverの内部探索
- Network Stack、Ethernet Frame、IPv4 Packet、TCP Segment、MAC Address、Bitsまでの階層探索
- 階層・キーワード検索・詳細説明を備えた用語集、About、Guide、Topics、Notes、Privacy、Terms、404ページ
- 「学習を探す」から開ける、ARP・CIDR / Longest Prefix Match・NAT / NAPTのインタラクティブ教材
- 前提知識・関連教材・次に学ぶ内容をつなぐLearning Topicデータモデル

## 技術スタック

- React 19 / TypeScript / Vite
- Three.js / React Three Fiber / drei
- Tailwind CSS
- pnpm（lockfileを正とする）

主要依存ライブラリは React、Vite、Three.js、React Three Fiber、drei、Tailwind CSS です。各ライブラリのライセンスはそれぞれの配布元に従います。アプリ内の3Dモデル・図・教材文章は、このプロジェクト内で作成したものです。

## 必要環境

- Node.js `20.19.0` 以降
- pnpm `11` 以降

Node.js / pnpm の正確な推奨バージョンは `package.json` の `engines` と `packageManager` を参照してください。

## インストール

```bash
pnpm install --frozen-lockfile
```

## 開発サーバー

```bash
pnpm run dev
```

表示されたローカルURLをブラウザで開きます。停止するには、起動したターミナルで `Ctrl + C` を押してください。

## Production build / Preview

```bash
pnpm run lint
pnpm run build
pnpm run preview
```

`pnpm run preview` は production build をローカル確認するためのコマンドです。今回、外部環境へのデプロイは行いません。

## ページ構成

| Path | 内容 |
| --- | --- |
| `/` | トップページ |
| `/visualizer` | 3D通信シミュレーションと探索 |
| `/glossary` | 用語集 |
| `/glossary/:id` | 用語の詳細 |
| `/about` | このプロジェクトについて |
| `/guide` | 使い方 |
| `/topics` | 学習を探す（既存シミュレーションと追加教材の入口） |
| `/learn/arp` | ARPをステップで追う教材 |
| `/learn/routing` | CIDRとLongest Prefix Matchを操作する教材 |
| `/learn/nat-napt` | NAT / NAPTの変換を追う教材 |
| `/notes` | 教材上の注意・簡略化 |
| `/privacy` | プライバシーについて |
| `/terms` | 利用規約 |

未知のパスは専用の404ページを表示します。

## ディレクトリ構成

```text
public/                 # favicon、OGP、robots.txtなどの静的配布物
scripts/                # sitemap生成などの公開準備スクリプト
src/
├── components/
│   ├── scene/          # 最上位ネットワークとパケット
│   ├── exploration/    # 階層探索の3D世界
│   ├── learning/       # 個別テーマの2D / インタラクティブ教材
│   ├── site/           # Header / Footer / 共通レイアウト
│   └── ui/             # 操作、進捗、説明、用語リンク
├── data/               # ネットワーク構成、日本語教材、Learning Topicデータ
├── pages/              # サイト・用語・公開向けページ
├── types/              # 型定義
└── App.tsx             # ルーティングとシミュレーション状態
```

## 教材アーキテクチャ

既存の `ExplorationWorld` は、PC内部やEthernet Frameなど「3D空間へ段階的に入る」教材を担います。一方、新しい `LearningTopic` は、テーマごとに最適な表現を選ぶための小さな共通データモデルです。

- 3D探索に向くもの：PC内部、ネットワークの全体像、パケットの移動
- 2Dステップ図解に向くもの：ARP、NAT / NAPT、TCPの手順
- 操作できる図に向くもの：CIDR / Longest Prefix Match、Routing Table
- 文章と図を中心にするもの：仕様の比較や、将来追加する暗号・可用性の基礎

新しいテーマは `src/data/learningTopics.ts` にメタデータを置き、`/learn/:id` から必要な教材だけを読み込みます。既存の3Dシミュレーションは、このサイトの代表教材として独立して維持します。

## 公開前の設定

### SPA fallback

このアプリはSPA routingを利用しています。ホスティング環境では、`/visualizer`、`/glossary/tcp`、`/terms` などの実在しないファイルパスへのアクセスを `index.html` にfallbackする設定が必要です。設定方法は利用するホスティングサービスのドキュメントに従ってください。

### Sitemap

公開ドメインが決まったら、実在するURLを使って sitemap を生成します。仮のドメインをリポジトリに含めないため、`sitemap.xml` は事前生成していません。

```bash
# PowerShell の例
$env:SITE_URL = 'https://your-domain.example'
pnpm run generate:sitemap
```

生成された `public/sitemap.xml` を配布物に含め、`public/robots.txt` のコメントを `Sitemap: https://your-domain.example/sitemap.xml` に置き換えてください。

### 問い合わせ先

問い合わせフォームやメールアドレスはコードへ埋め込んでいません。公開時に、HTTPSのIssue Trackerまたは問い合わせページURLを環境変数で設定すると、Footerにリンクが表示されます。

```bash
# .env.local（Gitへ含めない）
VITE_CONTACT_URL=https://your-contact-page.example
```

`https://` のURLだけをFooterに表示します。未設定時は「お問い合わせ先は公開前に設定予定です」と表示します。

### OGP / favicon

- `public/favicon.svg`：サイト用favicon
- `public/ogp.svg`：1200 × 630 の軽量な共有用プレビュー

一部のSNSはSVGのOGP画像を表示しない場合があります。本公開時に最大限の互換性が必要なら、同じ内容の `1200 × 630` PNGを作成し、`index.html` の `og:image` と `twitter:image` を更新してください。

## Privacy / Security

- 現時点でアカウント、広告、決済、Analytics、外部API、バックエンドはありません。
- シミュレーションで選ぶURLは教材データです。外部リクエスト、URL遷移、DNS問い合わせは行いません。
- 秘密情報をリポジトリに含めないため、`.env` と `.env.*` を `.gitignore` 対象にしています（`.env.example` は除外しません）。
- 外部連絡先を追加する場合も、`VITE_CONTACT_URL` には秘密情報ではなく公開してよいHTTPS URLのみを設定してください。

## 第三者ライセンス

3Dシーンの日本語ラベルには Noto Sans Japanese を同梱しています。配布物に含まれるフォントと主要依存関係のライセンス情報は [NOTICE.md](NOTICE.md) を参照してください。

## 教材上の注意

このアプリは教育用シミュレーションです。実際のPC内部、通信経路、タイミング、符号化、ネットワーク構成を完全に再現するものではありません。HTTPSは TCP + TLS 上で利用する代表例を扱っていますが、HTTP/3 では QUIC / UDP が利用される場合があります。詳しくは `/notes` と `/privacy` を参照してください。

本サイトは各資格試験実施団体の公式教材ではなく、特定の試験範囲を網羅するものでもありません。ITの仕組みを理解する補助として利用してください。

## 配布物

`node_modules/`、`dist/`、`outputs/`、ローカル環境設定、IDE/OS固有ファイルはGit管理・配布対象から除外しています。`pnpm-lock.yaml` とソースコードから再現可能な構成を維持してください。
