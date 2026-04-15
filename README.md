# My Watched Movies

自分が観た映画を管理するシンプルな静的サイト。TMDB API からポスター・公開年・あらすじを取得して表示する。

## 使い方

### 1. TMDB API キーを取得

https://www.themoviedb.org/ に登録 → Settings → API → API Key (v3 auth) をコピー。

### 2. 依存なし、Node だけあればOK（v18+ 推奨）

### 3. メタデータ取得（ローカルで1回だけ）

Windows (bash / Git Bash):

```bash
export TMDB_API_KEY=あなたのキー
npm run fetch
```

PowerShell:

```powershell
$env:TMDB_API_KEY="あなたのキー"
npm run fetch
```

`movies-data.json` が生成される。未検出タイトルはコンソールに出るので `movies.json` を修正して再実行。

### 4. ローカル確認

```bash
npx serve .
# または python -m http.server
```

### 5. GitHub Pages にデプロイ

1. GitHub でリポジトリ作成（publicでOK、APIキーはコミットしていないので安全）
2. `git init && git add . && git commit -m "init" && git branch -M main`
3. `git remote add origin <repo-url> && git push -u origin main`
4. GitHub リポジトリの **Settings → Pages → Branch: main / root** を選択
5. 数十秒後 `https://<user>.github.io/<repo>/` で公開

## ファイル構成

- `movies.json` — 観た映画のタイトル一覧（編集対象）
- `fetch-movies.js` — TMDB から取得するスクリプト
- `movies-data.json` — 生成されるメタデータ（コミットしてOK、デプロイに必要）
- `index.html` / `app.js` / `style.css` — フロントエンド
