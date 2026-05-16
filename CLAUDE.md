# my-watched-movies

自分が観た映画を管理する個人用の静的Webサイト。Filmarks のシンプル版。

公開URL: https://kohei075.github.io/my-watched-movies/

## アーキテクチャ

静的サイト + ビルド時一括メタデータ取得。サーバー・DB・フレームワークなし。

```
movies.json (タイトル一覧)
   │
   │  npm run fetch (ローカルで実行)
   │  └─ TMDB API を叩いて映画情報取得
   ▼
movies-data.json (メタデータ付き、コミット対象)
   │
   ▼
index.html / app.js / style.css が fetch して描画
   │
   ▼
GitHub Pages (main ブランチ / ルート)
```

- APIキーはローカルの `.env` にのみ保存し、クライアントには露出しない
- ポスター画像は TMDB の CDN を直接参照（自前ホストしない）

## ファイル構成

| ファイル | 役割 |
|---|---|
| `movies.json` | 観た映画のタイトル一覧（編集対象）。文字列または `{query, year?, id?}` のオブジェクト |
| `fetch-movies.js` | TMDB から情報取得するNodeスクリプト |
| `movies-data.json` | `fetch-movies.js` が生成するメタデータ（コミットしてデプロイに使う） |
| `index.html` / `app.js` / `style.css` | フロントエンド（依存なし、素のHTML/CSS/JS） |
| `.env` | `TMDB_API_KEY=...`（gitignore 済、コミット禁止） |
| `.env.example` | APIキーのテンプレート |
| `package.json` | `npm run fetch` で `node --env-file=.env fetch-movies.js` を実行 |

## 機能

- 映画のグリッド表示（ポスター／タイトル／公開年）
- カードクリックでモーダルを開きあらすじ表示
- サイドバー（モバイルはハンバーガーで開閉、デスクトップ≥900pxは常時表示）
  - タイトル検索（クエリ・邦題・原題に対して部分一致）
  - ソート: 公開年 / タイトル × 昇順 / 降順（初期は公開年の降順）
  - サイズスライダー（90〜320px、カード幅と文字サイズが連動）
- 設定は localStorage に保存

## movies.json の書き方

TMDB の検索は人気順で最新続編を返しがちなので、汎用的な単語のタイトルは ID か年を明示する。

```json
[
  "アイアンマン",                                   // 誤マッチしなければ文字列だけでOK
  { "query": "宇宙戦争", "year": 2005 },           // 年で絞り込み
  { "query": "アバター", "id": 19995 }             // 確実にしたい場合はTMDB IDを指定
]
```

TMDB ID の調べ方: https://www.themoviedb.org/ で映画を検索 → URL `/movie/<ID>` の数字。

## 運用手順

### 初回セットアップ

1. TMDB で API キー取得
2. `.env.example` をコピーして `.env` を作成し、キーを記入
3. `npm run fetch` で `movies-data.json` を生成

### 映画を追加する

1. `movies.json` に追記
2. `npm run fetch`（ログで誤マッチや未検出がないか確認）
3. 誤マッチしていたら `movies.json` を `{query, id}` 形式に書き換えて再実行
4. `git add movies.json movies-data.json && git commit && git push`
5. 1〜2分で GitHub Pages に反映

### デプロイ

main ブランチに push されれば自動で反映される（GitHub Pages: Branch main / root）。

## 制約・注意点

- `fetch-movies.js` は TMDB のレート制限を避けるため各リクエスト間に 120ms の待機を入れている
- `pickBest` は 完全一致 → 前方一致 → 含む の優先度で結果を選ぶが、邦題の表記揺れに弱いので手動でID指定が必要な場合がある
- `movies-data.json` はビルド成果物だがコミットする（GitHub Pages が静的配信するため）

## コミットメッセージ

日本語で記述。prefix（追加・修正・chore 等）は使ってよい。
