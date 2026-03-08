# Shiftize

## 概要

Shiftize は、店舗運営におけるシフト管理を効率化する Web アプリケーションです。React Native for Web + Expo Router で構築され、Supabase をバックエンドとして使用しています。1 年以上の実運用実績があります。

## 主要機能

### シフト管理

- ガントチャート表示（PC / タブレット / モバイル対応）
- 分割レイアウト（カレンダー + 1 日ガントチャート）
- モバイル版シフト一覧（月別表示・ステータス管理）
- シフト申請・承認フロー（複数選択・一括承認対応）
- Supabase Realtime によるシフト変更の即時同期
- PDF 出力機能

### Google Calendar 同期

- 承認済みシフトを Google Calendar に自動同期（一方向）
- OAuth 連携によるトークン管理
- Supabase Edge Function によるトークンリフレッシュ

### 募集シフト

- 募集シフト作成・応募機能
- クイックシフト URL（外部共有用トークン）

### ユーザー管理

- Supabase Auth によるネイティブ認証
- Google OAuth 連携
- ロールベースアクセス制御（master / user）
- 多店舗対応（店舗間連携・招待機能）

### セキュリティ

- AES-256 暗号化による個人情報保護
- RLS（Row Level Security）による店舗データ分離
- GDPR 準拠データ管理・監査システム

## 技術スタック

### フロントエンド

- React Native for Web + React 19
- TypeScript 5.9
- Expo SDK 54 + Expo Router 6
- MD3（Material Design 3）テーマシステム

### バックエンド

- **Supabase** (PostgreSQL + Auth + Realtime + Edge Functions)
- **Supabase RLS** (店舗分離 + ロールベースアクセス制御)

### デプロイ

- Render（本番ホスティング）
- Supabase Edge Functions（トークンリフレッシュ等）

## 開発環境セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# TypeScript 型チェック
npx tsc --noEmit
```

## バージョン管理

セマンティックバージョニング（major.minor.patch）を採用。現在 v2.0.0。

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

## マルチプラットフォーム戦略

React Native + Expo によるクロスプラットフォーム構成。全プラットフォームで TypeScript を使用し、ビジネスロジックを共有しつつ、UI はプラットフォームごとに最適化する方針。

| プラットフォーム | 状態 | デザイン方針 |
|---------------|------|------------|
| Web | 運用中 | MD3 Web 風 |
| Android | 予定 | Material Design 3 |
| iOS | 予定 | Apple HIG 準拠 |

### プラットフォーム別 UI

React Native のファイル拡張子によるプラットフォーム分岐を活用する。

```
Component.tsx          ← 共通（フォールバック）
Component.web.tsx      ← Web 用
Component.ios.tsx      ← iOS 用
Component.android.tsx  ← Android 用
```

### レイヤー構成

| レイヤー | 共有 / 分離 |
|---------|-----------|
| Services（Supabase, 認証, API） | 共有 |
| ビジネスロジック（hooks, 型定義） | 共有 |
| UI コンポーネント | プラットフォーム別 |

## プッシュ通知戦略

Supabase にはネイティブのプッシュ通知機能がないため、以下の構成を予定。

| プラットフォーム | 通知方式 |
|---------------|---------|
| Web | Web Push（Service Worker） |
| Android / iOS | Expo Push Notifications（FCM / APNs をラップ） |

### 通知フロー（モバイル）

```
Supabase DB 変更 → Edge Function → Expo Push API → FCM/APNs → 端末通知
```

### 活用例

- シフト承認通知
- シフト変更通知
- 募集シフト通知
- リマインダー（翌日のシフト通知）
