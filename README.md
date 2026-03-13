# Shiftize

エンタープライズ級のシフト管理アプリケーション。React Native (Expo) + Supabase で構築し、iOS / Android / Web をワンソースで提供する。1 年以上の実運用実績。

## 主要機能

| 機能 | 説明 |
|------|------|
| シフト管理 | ガントチャート（PC/タブレット/モバイル）、申請・承認フロー、一括操作 |
| 自動配置 | 業務・タスクをスタッフに均等自動割り当て（曜日・時間帯・必要人数設定） |
| 給与計算 | 時給×勤務時間、途中時間の除外/カスタムレート、日跨ぎ対応 |
| 募集シフト | QRコード / URL による外部共有・応募 |
| Google Calendar | 承認済みシフトの自動同期（OAuth + Edge Function） |
| リアルタイム同期 | Supabase Realtime による即時反映（300ms デバウンス） |
| セキュリティ | AES-256暗号化、RLS店舗分離、GDPR準拠、監査ログ（7年保存） |
| PDF出力 | シフト表のPDFエクスポート |

## 技術スタック

```
フロントエンド:  React 19 + React Native 0.81 + Expo 54 + Expo Router 6
バックエンド:    Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
型システム:      TypeScript 5.9（strict: true, 全13オプション有効）
バリデーション:  Zod 4.3
暗号化:          CryptoJS (AES-256-CBC)
テスト:          Jest + jest-expo/web（150+テスト）
デプロイ:        Vercel (Web) / Expo (iOS・Android)
```

## アーキテクチャ

```
┌────────────────────────────────────────────────┐
│  UI Layer (Expo Router ファイルベースルーティング) │
│  modules/ → home-view, master-view, user-view  │
├────────────────────────────────────────────────┤
│  Service Layer (ServiceProvider: 13サービス)     │
│  Interface → Adapter (snake_case ↔ camelCase)  │
├────────────────────────────────────────────────┤
│  Supabase (PostgreSQL + RLS + Auth + Realtime) │
│  店舗ID による完全データ分離                      │
└────────────────────────────────────────────────┘
```

**設計パターン**: Service Locator + Adapter + React Context + Singleton

## ディレクトリ構成

```
src/
├── app/                  # Expo Router ルーティング
│   ├── (auth)/           # 認証画面
│   └── (main)/           # メイン画面（master/ + user/）
├── common/               # 共有モジュール
│   ├── common-constants/ # 定数（色・フォント・ブレークポイント）
│   ├── common-context/   # React Context プロバイダー
│   ├── common-models/    # 型定義（Shift, User, Store）
│   ├── common-ui/        # 再利用UIコンポーネント
│   └── common-utils/     # ユーティリティ（security/, util-shift/, util-date/）
├── modules/              # 機能モジュール
│   ├── home-view/        # スタッフダッシュボード
│   ├── master-view/      # 管理者画面（auto-scheduling/, info-dashboard/）
│   └── reusable-widgets/ # ガントチャート、カレンダー
└── services/             # サービス層
    ├── ServiceProvider.ts    # Service Locator（13サービス）
    ├── interfaces/           # サービスインターフェース
    ├── supabase/             # Supabase アダプター群
    └── auth/                 # 認証（AuthContext, useAuth）
```

## クイックスタート

```bash
# 1. 依存関係インストール
npm install

# 2. 環境変数設定
cp .env.example .env
# EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY を設定

# 3. 開発サーバー起動
npm run dev        # Expo 開発サーバー
npm run web        # Web版のみ
```

## コマンド一覧

| コマンド | 用途 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run web` | Web版開発サーバー |
| `npm run build` | Web版ビルド |
| `npx tsc --noEmit` | TypeScript型チェック |
| `npx jest` | テスト実行（150件） |
| `npm run lint` | ESLint（警告0必須） |
| `npm audit` | セキュリティ監査 |
| `npm run release:patch` | パッチリリース (x.y.Z) |
| `npm run release:minor` | マイナーリリース (x.Y.0) |
| `npm run release:major` | メジャーリリース (X.0.0) |

## 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `EXPO_PUBLIC_SUPABASE_URL` | 必須 | Supabase プロジェクトURL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | 必須 | Supabase 匿名キー |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | 任意 | Google OAuth クライアントID |
| `EXPO_PUBLIC_USE_SUPABASE` | 必須 | `true` 固定 |
| `EXPO_PUBLIC_JMA_AREA_CODE` | 任意 | 気象庁エリアコード |

> `SUPABASE_SERVICE_ROLE_KEY` 等のシークレットはクライアントに置かない。Edge Functions の環境変数に設定する。

## マルチプラットフォーム

| プラットフォーム | 状態 | デザイン方針 |
|----------------|------|-------------|
| Web | 運用中 | MD3 Web風 |
| Android | 予定 | Material Design 3 |
| iOS | 予定 | Apple HIG準拠 |

React Native のファイル拡張子（`.web.tsx`, `.ios.tsx`, `.android.tsx`）でプラットフォーム分岐。ビジネスロジック（services/, common/）は全プラットフォーム共有。

## ドキュメント

| ファイル | 内容 |
|---------|------|
| [CLAUDE.md](CLAUDE.md) | AI開発エージェント用の指示書 |
| [CODING_STANDARDS.md](CODING_STANDARDS.md) | コーディング規約 |
| [docs/OPERATIONS_GUIDE.md](docs/OPERATIONS_GUIDE.md) | 運用・保守ガイド（複雑ロジック解説含む） |

## ライセンス

Private
