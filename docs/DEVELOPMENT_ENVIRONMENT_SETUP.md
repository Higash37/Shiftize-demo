# 開発環境セットアップガイド - 大学生向け

## 📋 このガイドについて

このガイドは、Shiftize プロジェクトの開発環境をセットアップするための完全ガイドです。  
**大学生・初心者向け**に、本番環境に近い形で開発環境を構築する方法を説明します。

---

## 🎯 目標

1. **本番環境に近い開発環境**を構築
2. **エンタープライズで使われるツール**を学習
3. **将来の就職に役立つ**スキルを身につける
4. **React/TypeScript の難しい部分**を理解する

---

## 🛠️ 必要なツール一覧

### 必須ツール

| ツール | 用途 | 無料/有料 | インストール方法 |
|--------|------|-----------|------------------|
| **Node.js** | JavaScript 実行環境 | 無料 | [公式サイト](https://nodejs.org/) |
| **Git** | バージョン管理 | 無料 | [公式サイト](https://git-scm.com/) |
| **VS Code** | コードエディタ | 無料 | [公式サイト](https://code.visualstudio.com/) |
| **GitHub アカウント** | コードホスティング | 無料 | [GitHub](https://github.com/) |

### 推奨ツール

| ツール | 用途 | 無料/有料 | インストール方法 |
|--------|------|-----------|------------------|
| **GitBook** | ドキュメント管理 | 無料プランあり | [GitBook](https://www.gitbook.com/) |
| **Cursor** | AI 統合エディタ | 無料プランあり | [Cursor](https://cursor.sh/) |
| **Firebase Console** | バックエンド管理 | 無料プランあり | [Firebase](https://firebase.google.com/) |

---

## 📦 Step 1: Node.js のインストール

### 1.1 Node.js とは？

**Node.js** は、JavaScript をサーバーサイドで実行するための環境です。  
React アプリの開発には必須です。

### 1.2 インストール手順

1. **公式サイトにアクセス**
   - https://nodejs.org/ にアクセス

2. **LTS 版をダウンロード**
   - 「LTS」と書かれたバージョンを選択（推奨）
   - 現在の推奨: Node.js 20.x LTS

3. **インストーラーを実行**
   - ダウンロードしたファイルを実行
   - デフォルト設定でインストール

4. **インストール確認**
   ```bash
   node --version
   npm --version
   ```
   - 両方ともバージョンが表示されれば OK

### 1.3 トラブルシューティング

**問題**: `node` コマンドが認識されない  
**解決策**: 
- パソコンを再起動
- 環境変数 PATH を確認

---

## 📦 Step 2: Git のインストール

### 2.1 Git とは？

**Git** は、コードのバージョン管理システムです。  
エンタープライズでは必須のツールです。

### 2.2 インストール手順

1. **公式サイトにアクセス**
   - https://git-scm.com/ にアクセス

2. **ダウンロード**
   - OS に応じたインストーラーをダウンロード

3. **インストール**
   - デフォルト設定でインストール

4. **設定（初回のみ）**
   ```bash
   git config --global user.name "あなたの名前"
   git config --global user.email "your.email@example.com"
   ```

5. **インストール確認**
   ```bash
   git --version
   ```

### 2.3 GitHub アカウント作成

1. **GitHub にアクセス**
   - https://github.com/ にアクセス

2. **アカウント作成**
   - 「Sign up」から無料アカウントを作成
   - 学生メールアドレスを使用すると、Student Pack が利用可能（GitHub Pro が無料）

---

## 📦 Step 3: VS Code のインストールと設定

### 3.1 VS Code とは？

**Visual Studio Code** は、Microsoft が開発した無料のコードエディタです。  
エンタープライズで広く使われています。

### 3.2 インストール手順

1. **公式サイトにアクセス**
   - https://code.visualstudio.com/ にアクセス

2. **ダウンロード**
   - OS に応じたインストーラーをダウンロード

3. **インストール**
   - デフォルト設定でインストール

### 3.3 必須拡張機能のインストール

VS Code を開き、以下の拡張機能をインストール:

1. **ESLint**
   - コードの品質チェック
   - 検索: `ESLint`

2. **Prettier**
   - コードの自動フォーマット
   - 検索: `Prettier`

3. **TypeScript and JavaScript Language Features**
   - TypeScript のサポート（標準でインストール済み）

4. **GitLens**
   - Git の可視化
   - 検索: `GitLens`

5. **React snippets**
   - React のコード補完
   - 検索: `ES7+ React/Redux/React-Native snippets`

### 3.4 VS Code 設定

**設定ファイル** (`settings.json`) を開く:
- `Ctrl + Shift + P` (Mac: `Cmd + Shift + P`)
- 「Preferences: Open User Settings (JSON)」を選択

**推奨設定:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.updateImportsOnFileMove.enabled": "always",
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000
}
```

---

## 📦 Step 4: プロジェクトのセットアップ

### 4.1 リポジトリのクローン

```bash
# GitHub からプロジェクトをクローン
git clone https://github.com/your-username/Shiftize.git

# プロジェクトディレクトリに移動
cd Shiftize
```

### 4.2 依存関係のインストール

```bash
# npm パッケージをインストール
npm install

# Firebase Functions の依存関係もインストール
cd functions
npm install
cd ..
```

### 4.3 環境変数の設定

1. **`.env` ファイルを作成**
   ```bash
   # ルートディレクトリに .env ファイルを作成
   touch .env
   ```

2. **環境変数を設定**
   ```bash
   # .env ファイルに以下を追加（Firebase の設定値は Firebase Console から取得）
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Firebase Console から設定値を取得**
   - https://console.firebase.google.com/ にアクセス
   - プロジェクトを選択
   - プロジェクト設定 → 一般 → アプリ → 設定をコピー

---

## 📦 Step 5: 開発サーバーの起動

### 5.1 開発サーバーを起動

```bash
# 開発サーバーを起動
npm start

# または
npm run dev
```

### 5.2 ブラウザで確認

- ターミナルに表示される URL をブラウザで開く
- 通常は `http://localhost:8081` または `http://localhost:19006`

---

## 📚 Step 6: ドキュメント管理のセットアップ（GitBook）

### 6.1 GitBook とは？

**GitBook** は、開発者向けのドキュメント管理ツールです。  
エンタープライズで広く使われており、**無料プラン**があります。

### 6.2 GitBook アカウント作成

1. **GitBook にアクセス**
   - https://www.gitbook.com/ にアクセス

2. **アカウント作成**
   - 「Sign up」から無料アカウントを作成
   - GitHub アカウントで連携可能

3. **Space の作成**
   - 「New Space」をクリック
   - 「Shiftize Development Docs」という名前で作成

### 6.3 ドキュメントの構造

以下の構造でドキュメントを作成:

```
📚 Shiftize Development Docs
├── 📋 開発環境セットアップ
│   └── このガイド
├── 📋 React の難しい部分
│   ├── Hooks の使い方
│   ├── 状態管理
│   └── パフォーマンス最適化
├── 📋 TypeScript の基礎
│   ├── 型定義
│   ├── ジェネリクス
│   └── ユーティリティ型
├── 📋 Firebase の使い方
│   ├── Firestore の基本
│   ├── Authentication
│   └── Cloud Functions
└── 📋 コーディング規約
    ├── 命名規則
    ├── ディレクトリ構造
    └── エラーハンドリング
```

---

## 🎓 Step 7: React の難しい部分の学習

### 7.1 よくある問題と解決策

#### 問題1: 無限ループが発生する

**原因**: `useEffect` の依存配列が正しく設定されていない

**解決策:**
```typescript
// ❌ 悪い例
useEffect(() => {
  fetchData();
}, []); // 依存配列が空だが、fetchData が変更される

// ✅ 良い例
useEffect(() => {
  fetchData();
}, [fetchData]); // fetchData を依存配列に追加

// または
const fetchData = useCallback(async () => {
  // データ取得処理
}, []);
```

#### 問題2: 状態が更新されない

**原因**: 状態の更新が非同期で行われている

**解決策:**
```typescript
// ❌ 悪い例
setCount(count + 1);
setCount(count + 1); // count はまだ更新されていない

// ✅ 良い例
setCount(prev => prev + 1);
setCount(prev => prev + 1); // 前の状態を参照
```

#### 問題3: 再レンダリングが多すぎる

**原因**: 不要な再レンダリングが発生している

**解決策:**
```typescript
// ✅ useMemo で計算結果をメモ化
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// ✅ useCallback で関数をメモ化
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

### 7.2 学習リソース

1. **React 公式ドキュメント**
   - https://react.dev/
   - 日本語版: https://ja.react.dev/

2. **TypeScript 公式ドキュメント**
   - https://www.typescriptlang.org/docs/
   - 日本語版: https://www.typescriptlang.org/ja/docs/

3. **Firebase 公式ドキュメント**
   - https://firebase.google.com/docs
   - 日本語版: https://firebase.google.com/docs?hl=ja

---

## 🔧 Step 8: 開発ツールの高度な設定

### 8.1 ESLint の設定

**`eslint.config.js`** が既に設定されていますが、理解しておくと良い設定:

```javascript
// インポート順序の自動ソート（追加推奨）
// eslint-plugin-import をインストール
npm install --save-dev eslint-plugin-import

// eslint.config.js に追加
import importPlugin from 'eslint-plugin-import';

export default {
  plugins: {
    import: importPlugin,
  },
  rules: {
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index',
      ],
      'newlines-between': 'always',
    }],
  },
};
```

### 8.2 Prettier の設定

**`.prettierrc`** ファイルを作成:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 8.3 Git Hooks の設定（Husky）

**コミット前に自動チェック**を設定:

```bash
# Husky をインストール
npm install --save-dev husky

# Git hooks を初期化
npx husky init

# pre-commit フックを作成
echo "npm run lint" > .husky/pre-commit
```

---

## 🎯 Step 9: 本番環境に近い開発フロー

### 9.1 ブランチ戦略

**Git Flow** を使用（エンタープライズ標準）:

```
main          # 本番環境
├── develop   # 開発環境
├── feature/  # 機能開発
├── hotfix/   # 緊急修正
└── release/  # リリース準備
```

### 9.2 プルリクエストの作成

1. **ブランチを作成**
   ```bash
   git checkout -b feature/add-new-feature
   ```

2. **変更をコミット**
   ```bash
   git add .
   git commit -m "feat: 新機能を追加"
   ```

3. **プッシュ**
   ```bash
   git push origin feature/add-new-feature
   ```

4. **GitHub でプルリクエストを作成**
   - GitHub のリポジトリページで「New Pull Request」をクリック
   - レビューを依頼

### 9.3 コードレビューの習慣

- プルリクエストを作成する前に、自分でコードを確認
- コメントを追加して、なぜその実装にしたか説明
- レビューコメントに対して丁寧に対応

---

## 📊 Step 10: 学習の進め方

### 10.1 段階的な学習プラン

**Week 1-2: 基礎**
- React の基本（コンポーネント、JSX、Props）
- TypeScript の基本（型、インターフェース）

**Week 3-4: 中級**
- Hooks（useState, useEffect, useContext）
- 状態管理のパターン

**Week 5-6: 上級**
- パフォーマンス最適化（useMemo, useCallback）
- カスタムフックの作成

**Week 7-8: 実践**
- Firebase との連携
- エラーハンドリング
- テストの書き方

### 10.2 ポートフォリオとして活用

このプロジェクトを**ポートフォリオ**として活用:

1. **GitHub で公開**
   - コードを GitHub で公開
   - README を充実させる

2. **デプロイ**
   - Vercel や Netlify で無料デプロイ
   - 実際に動くアプリを公開

3. **ドキュメント**
   - GitBook で開発ドキュメントを公開
   - 学習過程を記録

---

## 🚀 次のステップ

1. ✅ 開発環境のセットアップ完了
2. 📚 GitBook でドキュメントを作成
3. 💻 コードを書いて学習
4. 📝 学んだことをドキュメントに記録
5. 🎯 ポートフォリオとして完成させる

---

## ❓ よくある質問

### Q: エラーが出た場合はどうすればいい？

**A:** 
1. エラーメッセージを Google で検索
2. Stack Overflow で同様の問題を探す
3. GitHub Issues で質問する
4. ChatGPT や Claude に聞く

### Q: どのくらいの時間をかければいい？

**A:**
- **毎日 1-2 時間**を継続するのが理想
- 週末にまとめて学習するのも OK
- **継続が重要**

### Q: 就職活動にどう活用すればいい？

**A:**
1. **GitHub のプロフィール**を充実させる
2. **ポートフォリオサイト**を作成
3. **技術ブログ**を書く（Qiita、Zenn 等）
4. **実際に動くアプリ**をデプロイ

---

## 📚 参考リソース

### 無料学習リソース

1. **freeCodeCamp**
   - https://www.freecodecamp.org/
   - 完全無料のプログラミング学習サイト

2. **MDN Web Docs**
   - https://developer.mozilla.org/
   - Web 開発の公式ドキュメント

3. **Zenn**
   - https://zenn.dev/
   - 日本の技術記事プラットフォーム

4. **Qiita**
   - https://qiita.com/
   - 日本の技術記事プラットフォーム

### 有料学習リソース（学生割引あり）

1. **Udemy**
   - 学生割引あり
   - 実践的なコースが多い

2. **Pluralsight**
   - 学生割引あり
   - エンタープライズ向けのコース

---

**作成日**: 2025-01-30  
**対象**: 大学生・初心者向け  
**目的**: 本番環境に近い開発環境の構築と学習
