# Shiftize

## 概要

Shiftize は、店舗運営におけるシフト管理を効率化する Web アプリケーションです。React Native for Web + Expo Router で構築され、Supabase をバックエンドとして使用しています。7 ヶ月以上の実運用実績があり、シフト提出文化の定着に貢献しています。

## 主要機能

### シフト管理

- ガントチャート表示（PC / タブレット / モバイル対応）
- 分割レイアウト（カレンダー + 1 日ガントチャート）
- シフト申請・承認フロー（複数選択・一括承認対応）
- シフト変更の即時同期
- PDF 出力機能

### 募集シフト

- 募集シフト作成・応募機能
- クイックシフト URL（外部共有用トークン）

### ユーザー管理

- Supabase Auth によるネイティブ認証
- ロールベースアクセス制御（master / user）
- 多店舗対応（店舗間連携・招待機能）

### セキュリティ

- AES-256 暗号化による個人情報保護
- RLS（Row Level Security）による店舗データ分離
- GDPR 準拠データ管理・監査システム

## 技術スタック

### フロントエンド

- React Native for Web
- TypeScript
- Expo Router
- React Native Elements

### バックエンド

- **Supabase** (PostgreSQL + Auth + Realtime)
- **Supabase RLS** (店舗分離 + ロールベースアクセス制御)
- **Firebase Firestore** (レガシー・段階的移行中)

### デプロイ・開発

- Render（本番環境）
- Expo Development Build
- Git / GitHub

## 開発環境セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# TypeScript型チェック
npx tsc --noEmit
```

## バージョン管理

セマンティックバージョニング（major.minor.patch）を採用。

```bash
# パッチリリース（バグフィックス）
npm run release:patch

# マイナーリリース（新機能追加）
npm run release:minor

# メジャーリリース（破壊的変更）
npm run release:major
```

## アーキテクチャ

Supabase を中心としたリアルタイム同期システム。RLS ポリシーによる店舗単位のデータ分離と、master / user ロールによるアクセス制御を実装。多店舗対応の基盤（店舗間連携・クロスストア管理）も構築済み。
