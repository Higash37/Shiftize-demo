# コーディング規約管理ツール比較 - MCP連携対応

## 📊 主要ツール比較表

| ツール | MCP対応 | 企業利用 | コスト | 学習曲線 | 推奨度 |
|--------|---------|----------|--------|----------|--------|
| **GitBook** | ✅ 公式対応 | ⭐⭐⭐⭐ | 無料〜$8/月 | 低 | ⭐⭐⭐⭐⭐ |
| **Confluence** | ✅ 公式対応 | ⭐⭐⭐⭐⭐ | $7.75/月〜 | 中 | ⭐⭐⭐⭐ |
| **Notion** | ✅ 公式対応 | ⭐⭐⭐⭐ | 無料〜$8/月 | 低 | ⭐⭐⭐⭐ |
| **GitHub Wiki** | ⚠️ 間接的 | ⭐⭐⭐ | 無料 | 低 | ⭐⭐⭐ |
| **Markdown (Git)** | ⚠️ 間接的 | ⭐⭐ | 無料 | 低 | ⭐⭐ |

---

## 🏆 推奨: GitBook

### なぜ GitBook が最適か

1. **MCP 公式対応**
   - GitBook が公式に MCP サーバーを提供
   - `llms.txt` と `llms-full.txt` で AI 最適化
   - ChatGPT、Google AI Overview と直接連携

2. **開発者向け設計**
   - Markdown ベースで Git と親和性が高い
   - コードブロック、シンタックスハイライト対応
   - バージョン管理機能

3. **コストパフォーマンス**
   - 無料プランで十分な機能
   - 有料プランも $8/月と手頃

4. **企業利用実績**
   - 多くの企業で採用実績あり
   - API が充実

### GitBook の設定例

```json
{
  "mcpServers": {
    "gitbook": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-gitbook"
      ],
      "env": {
        "GITBOOK_API_KEY": "${GITBOOK_API_KEY}",
        "GITBOOK_SPACE_ID": "${GITBOOK_SPACE_ID}"
      }
    }
  }
}
```

---

## 🥈 第2候補: Confluence

### Confluence の特徴

1. **企業標準**
   - 大企業で広く採用
   - Atlassian エコシステム（Jira 等）と統合

2. **MCP 公式対応**
   - Atlassian Rovo MCP Server が一般提供
   - エンタープライズグレードのセキュリティ
   - ドメイン/IP ホワイトリスト対応

3. **高度な権限管理**
   - 細かいアクセス制御
   - 監査ログ機能

### Confluence の設定例

```json
{
  "mcpServers": {
    "confluence": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-atlassian"
      ],
      "env": {
        "ATLASSIAN_API_TOKEN": "${ATLASSIAN_API_TOKEN}",
        "ATLASSIAN_DOMAIN": "${ATLASSIAN_DOMAIN}",
        "ATLASSIAN_SPACE_KEY": "${ATLASSIAN_SPACE_KEY}"
      }
    }
  }
}
```

---

## 🥉 第3候補: Notion

### Notion の特徴

1. **使いやすさ**
   - 直感的な UI
   - 柔軟なデータベース構造

2. **MCP 公式対応**
   - Notion MCP Server が利用可能
   - OAuth 認証対応

3. **コスト**
   - 無料プランあり
   - 個人利用なら十分

### Notion の設定例

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-notion"
      ],
      "env": {
        "NOTION_API_KEY": "${NOTION_API_KEY}",
        "NOTION_DATABASE_ID": "${NOTION_DATABASE_ID}"
      }
    }
  }
}
```

---

## 📝 その他の選択肢

### GitHub Wiki

**メリット:**
- 無料
- Git リポジトリと統合
- バージョン管理が容易

**デメリット:**
- MCP 直接対応なし（GitHub API 経由で間接的）
- 機能が限定的
- 企業利用には不十分

**MCP 連携:**
- GitHub MCP Server 経由で間接的にアクセス可能

### Markdown (Git リポジトリ内)

**メリット:**
- 完全無料
- Git でバージョン管理
- シンプル

**デメリット:**
- MCP 直接対応なし
- 検索・管理機能が限定的
- チーム共有が困難

**MCP 連携:**
- Filesystem MCP Server 経由でアクセス可能

---

## 🎯 推奨選択フローチャート

```
コーディング規約管理ツール選定

企業規模は？
├─ 大企業（100人以上）
│  └─ Confluence（エンタープライズ機能が必要）
│
├─ 中小企業（10-100人）
│  └─ GitBook（開発者向け、コストパフォーマンス良好）
│
└─ 小規模・個人（10人以下）
   ├─ 予算あり → Notion（使いやすさ重視）
   └─ 予算なし → GitHub Wiki または Markdown
```

---

## 💡 Shiftize プロジェクトへの推奨

### 推奨: **GitBook**（大学生・初心者向け）

**理由:**
1. **完全無料**: 無料プランで十分な機能を提供
2. **開発者向け**: React Native/TypeScript プロジェクトに最適
3. **MCP 公式対応**: 最新の MCP 機能を活用可能
4. **Git 統合**: 既存の Git ワークフローと親和性が高い
5. **AI 最適化**: `llms.txt` で AI エージェントが効率的に参照
6. **学習に最適**: エンタープライズで使われているツールを無料で学習可能
7. **ポートフォリオ**: 作成したドキュメントをポートフォリオとして公開可能

### 実装手順

1. **GitBook アカウント作成**（5分）
   - https://www.gitbook.com/ にアクセス
   - 無料アカウントを作成

2. **Space の作成**（10分）
   - 新しい Space を作成
   - 「Shiftize Coding Standards」という名前で作成

3. **MCP サーバーの設定**（15分）
   - API Key を取得
   - `.mcp.json` に設定を追加

4. **既存ドキュメントの移行**（1時間）
   - `CODE_REVIEW_REPORT.md` の内容を GitBook に移行
   - 構造化されたドキュメントに変換

---

## 📚 各ツールの詳細比較

### 機能比較

| 機能 | GitBook | Confluence | Notion | GitHub Wiki |
|------|---------|------------|--------|-------------|
| Markdown 対応 | ✅ | ⚠️ | ⚠️ | ✅ |
| コードブロック | ✅ | ✅ | ✅ | ✅ |
| バージョン管理 | ✅ | ✅ | ✅ | ✅ |
| 検索機能 | ✅ | ✅ | ✅ | ⚠️ |
| API | ✅ | ✅ | ✅ | ✅ |
| MCP 公式対応 | ✅ | ✅ | ✅ | ❌ |
| モバイルアプリ | ✅ | ✅ | ✅ | ❌ |
| コラボレーション | ✅ | ✅ | ✅ | ⚠️ |

### コスト比較

| プラン | GitBook | Confluence | Notion |
|--------|---------|------------|--------|
| 無料 | ✅ 5スペース | ❌ | ✅ 個人利用 |
| スタート | $8/月 | $7.75/月 | $8/月 |
| プロ | $15/月 | $15/月 | $10/月 |
| エンタープライズ | 要問い合わせ | $31/月 | $15/月 |

---

## 🔧 実装例: GitBook + MCP

### 1. GitBook Space の作成

```
Shiftize Coding Standards
├── 📋 命名規則
│   ├── ファイル名規則
│   ├── 変数名規則
│   └── 関数名規則
├── 📋 ディレクトリ構造
│   ├── ルートディレクトリ規則
│   └── src/ 構造規則
├── 📋 TypeScript 規則
│   ├── 型定義規則
│   └── any 型使用規則
└── 📋 テスト規則
    ├── テストファイル命名
    └── カバレッジ要件
```

### 2. MCP 設定

**`.mcp.json`:**

```json
{
  "mcpServers": {
    "gitbook": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-gitbook"
      ],
      "env": {
        "GITBOOK_API_KEY": "${GITBOOK_API_KEY}",
        "GITBOOK_SPACE_ID": "${GITBOOK_SPACE_ID}"
      }
    }
  }
}
```

### 3. 使用例

**Claude/Cursor での使用:**

```
@gitbook://coding-standards を参照して、このコードの命名規則を確認してください。

[コードを貼り付け]
```

---

## 🎯 最終推奨

### Shiftize プロジェクトには **GitBook** を推奨

**理由:**
1. ✅ 開発者向けツールで、技術ドキュメントに最適
2. ✅ MCP 公式対応で、最新機能を活用可能
3. ✅ 無料プランで十分な機能
4. ✅ Git と親和性が高く、既存ワークフローと統合しやすい
5. ✅ AI 最適化機能（llms.txt）で、AI エージェントが効率的に参照

**次のステップ:**
1. GitBook アカウント作成
2. Space 作成とドキュメント移行
3. MCP サーバー設定
4. 動作確認

---

**作成日**: 2025-01-30  
**最終更新**: 2025-01-30  
**推奨ツール**: GitBook
