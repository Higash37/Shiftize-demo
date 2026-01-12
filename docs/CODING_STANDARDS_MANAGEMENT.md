# コーディング規約管理システム - GitBook + MCP 連携提案

> **注意**: このドキュメントは GitBook を推奨ツールとして記載していますが、Notion、Confluence など他のツールも選択可能です。  
> 詳細な比較は `CODING_STANDARDS_TOOLS_COMPARISON.md` を参照してください。

## 📋 概要

大企業的な視点で、コーディング規約やルールを **GitBook**（推奨）などの外部サービスで管理し、MCP（Model Context Protocol）経由で AI エージェント（Claude、Cursor 等）が参照・適用できるシステムを構築します。

**推奨ツール**: GitBook（開発者向け、MCP 公式対応、無料プランあり）  
**代替ツール**: Confluence（エンタープライズ向け）、Notion（使いやすさ重視）

---

## 🎯 目的

1. **規約の一元管理**: コーディング規約を Notion で一元管理
2. **AI エージェント連携**: MCP 経由で AI が規約を参照・適用
3. **自動チェック**: CI/CD パイプラインでの自動検証
4. **チーム共有**: チーム全体で規約を共有・更新

---

## 🏗️ アーキテクチャ

```
┌─────────────────┐
│   GitBook       │  ← コーディング規約の管理（推奨）
│   (規約DB)      │  または Notion / Confluence
└────────┬────────┘
         │ MCP Protocol
         ▼
┌─────────────────┐
│   MCP Server    │  ← GitBook API 連携
│   (GitBook MCP) │  または Notion / Confluence MCP
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Agents      │  ← Claude, Cursor 等
│  (Claude/Cursor)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Code Review    │  ← 自動チェック
│  CI/CD          │
└─────────────────┘
```

---

## 📝 GitBook Space 設計（推奨）

> **注意**: 以下は GitBook を例に記載していますが、Notion や Confluence でも同様の構造が可能です。

### 1. GitBook Space 構造

**Space 構造:**

```
📚 Shiftize Coding Standards
├── 📋 命名規則
│   ├── ファイル名規則
│   ├── 変数名規則
│   ├── 関数名規則
│   └── クラス名規則
├── 📋 ディレクトリ構造
│   ├── ルートディレクトリ規則
│   ├── src/ 構造規則
│   └── functions/ 構造規則
├── 📋 インポート規則
│   ├── インポート順序
│   ├── パスエイリアス使用規則
│   └── 型インポート規則
├── 📋 エラーハンドリング
│   ├── エラーログ規則
│   ├── カスタムエラー規則
│   └── エラーメッセージ規則
├── 📋 TypeScript 規則
│   ├── 型定義規則
│   ├── any 型使用規則
│   └── 型アサーション規則
└── 📋 テスト規則
    ├── テストファイル命名
    ├── テスト構造規則
    └── カバレッジ要件
```

### 2. GitBook での構造化

**Markdown ベースの構造:**

各規約を Markdown ページとして作成し、以下のメタデータを含めます:

```markdown
---
title: ファイル名規則
category: 命名規則
priority: 高
status: 有効
last_updated: 2025-01-30
---

## 規則内容
サービスファイルは kebab-case を使用する

## コード例

### ✅ 良い例
```typescript
// recruitment-shift-service.ts
export class RecruitmentShiftService { ... }
```

### ❌ 悪い例
```typescript
// recruitmentShiftService.ts
export class RecruitmentShiftService { ... }
```

## 適用範囲
- サービスファイル
- ユーティリティファイル
```

**違反レポート**は GitHub Issues や別のトラッキングシステムで管理することを推奨します。

---

## 🔧 MCP サーバー設定

### 1. GitBook MCP サーバーの追加（推奨）

**`.mcp.json` または Cursor 設定に追加:**

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

### 2. 環境変数の設定

**.env ファイルに追加:**

```bash
# GitBook API設定
GITBOOK_API_KEY=xxxxxxxxxxxxx
GITBOOK_SPACE_ID=xxxxxxxxxxxxxxxxxxxxxxxx

# MCP設定
MCP_GITBOOK_ENABLED=true
```

### 3. GitBook API のセットアップ

1. **GitBook アカウント作成**
   - https://www.gitbook.com/ にアクセス
   - 無料アカウントを作成

2. **Space の作成**
   - 新しい Space を作成
   - 「Shiftize Coding Standards」という名前で作成

3. **API Key の取得**
   - Settings → API から API Key を生成
   - Space ID を取得（URL から）

### 4. 代替: Notion または Confluence を使用する場合

**Notion の場合:**
```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-notion"],
      "env": {
        "NOTION_API_KEY": "${NOTION_API_KEY}",
        "NOTION_DATABASE_ID": "${NOTION_DATABASE_ID}"
      }
    }
  }
}
```

**Confluence の場合:**
```json
{
  "mcpServers": {
    "confluence": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-atlassian"],
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

## 🤖 AI エージェント連携

### 1. Claude/Cursor での使用

**プロンプト例:**

```
@notion://coding-standards を参照して、このコードが規約に準拠しているか確認してください。

[コードを貼り付け]
```

### 2. 自動チェックの実装

**GitHub Actions ワークフロー例:**

```yaml
name: Code Standards Check

on:
  pull_request:
    paths:
      - 'src/**/*.ts'
      - 'src/**/*.tsx'

jobs:
  check-standards:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check coding standards
        uses: ./scripts/check-standards.sh
        env:
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY }}
          NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID }}
```

**チェックスクリプト (`scripts/check-standards.sh`):**

```bash
#!/bin/bash

# Notion API から規約を取得
# ESLint や TypeScript コンパイラと連携してチェック
# 違反を Notion の違反レポートテーブルに記録

# 実装例（簡易版）
node scripts/notion-standards-checker.js
```

---

## 📚 規約の管理フロー

### 1. 規約の追加・更新

1. **Notion で規約を編集**
   - コーディング規約データベースに新しい規約を追加
   - または既存の規約を更新

2. **AI エージェントが自動検知**
   - MCP 経由で Notion の変更を検知
   - 関連するコードを自動チェック

3. **チームに通知**
   - 変更された規約をチームに通知
   - 必要に応じてコードレビューを実施

### 2. 違反の報告と修正

1. **自動検出**
   - CI/CD パイプラインで違反を検出
   - Notion の違反レポートテーブルに記録

2. **AI による修正提案**
   - Claude/Cursor が違反を確認
   - 修正提案を生成

3. **修正の実施**
   - 開発者が修正を実施
   - ステータスを「修正済み」に更新

---

## 🛠️ 実装手順

### Phase 1: GitBook Space の作成（1週間）

1. ✅ GitBook アカウント作成
2. ✅ Space を作成（「Shiftize Coding Standards」）
3. ✅ 既存の `CODE_REVIEW_REPORT.md` の内容を GitBook に移行
4. ✅ 構造化されたドキュメントに変換

### Phase 2: MCP サーバーの設定（1週間）

1. ✅ GitBook API Key を取得
2. ✅ `.mcp.json` に GitBook MCP サーバーを追加
3. ✅ 環境変数を設定
4. ✅ 動作確認

### Phase 3: AI エージェント連携（2週間）

1. ✅ Claude/Cursor で GitBook 規約を参照できるように設定
2. ✅ プロンプトテンプレートを作成
3. ✅ 自動チェックスクリプトを実装

### Phase 4: CI/CD 統合（2週間）

1. ✅ GitHub Actions ワークフローを作成
2. ✅ 違反レポートの自動記録を実装（GitHub Issues 等）
3. ✅ プルリクエストでの自動チェックを設定

---

## 📖 使用例

### 例1: コードレビュー時の規約確認

```
ユーザー: @gitbook://coding-standards を参照して、このファイルの命名規則を確認してください。

[ファイルを貼り付け]

AI: GitBook のコーディング規約を確認しました。
以下の違反が見つかりました:

1. ファイル名が kebab-case ではなく camelCase になっている
   - 規約: サービスファイルは kebab-case を使用
   - 違反: `recruitmentShiftService.ts`
   - 推奨: `recruitment-shift-service.ts`
```

### 例2: 新規コード作成時の規約適用

```
ユーザー: 新しいサービスファイルを作成してください。@gitbook://coding-standards の規約に従ってください。

AI: GitBook の規約を確認しました。以下の構造で作成します:

- ファイル名: kebab-case.ts
- エクスポート: named export
- エラーハンドリング: SecurityLogger を使用
- JSDoc: 必須
```

---

## 🔐 セキュリティ考慮事項

1. **API Key の管理**
   - 環境変数で管理
   - `.env` を `.gitignore` に追加
   - GitHub Secrets で CI/CD に設定

2. **アクセス権限**
   - GitBook API Key に最小限の権限を付与
   - 読み取り専用の権限を推奨

3. **データの機密性**
   - コーディング規約は公開情報として扱う
   - 機密情報は含めない
   - GitBook の Space を Private に設定可能

---

## 📊 メリット

1. **一元管理**: 規約が GitBook で一元管理され、更新が容易
2. **AI 連携**: AI エージェントが規約を自動参照・適用
3. **自動チェック**: CI/CD で自動検証
4. **チーム共有**: 全員が最新の規約を参照可能
5. **履歴管理**: GitBook のバージョン履歴で変更を追跡
6. **Git 統合**: Git と親和性が高く、既存ワークフローと統合しやすい
7. **AI 最適化**: `llms.txt` 機能で AI エージェントが効率的に参照

---

## 🚀 次のステップ

1. **Notion データベースの作成**
   - テンプレートを用意
   - 既存の `CODE_REVIEW_REPORT.md` を移行

2. **MCP サーバーの設定**
   - Notion Integration の作成
   - `.mcp.json` の設定

3. **動作確認**
   - Claude/Cursor で Notion 規約を参照
   - 自動チェックのテスト

---

## 📚 参考リンク

### GitBook（推奨）
- [GitBook MCP Server](https://model-context-protocol.com/servers/gitbook-mcp-server)
- [GitBook API Documentation](https://docs.gitbook.com/api-reference)
- [GitBook llms.txt](https://docs.gitbook.com/product-features/ai/llms-txt)

### 代替ツール
- [Notion MCP Server](https://model-context-protocol.com/servers/notion-mcp-server)
- [Confluence MCP Server (Atlassian Rovo)](https://confluence.atlassian.com/cloud/blog/2025/12/atlassian-cloud-changes-dec-22-to-dec-29-2025)

### 共通
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Cursor MCP Documentation](https://docs.cursor.com/mcp)
- [ツール比較ドキュメント](./CODING_STANDARDS_TOOLS_COMPARISON.md)

---

**作成日**: 2025-01-30  
**最終更新**: 2025-01-30  
**ステータス**: 提案段階
