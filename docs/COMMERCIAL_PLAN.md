# Shiftize 商用版 移行計画

> **対象読者**: 開発者・プロダクトオーナー
> **最終更新**: 2026-03-14 | **目標リリース**: 2026年夏

---

## 目次

1. [デモ版との違い](#1-デモ版との違い)
2. [デモ版から持ち越す課題](#2-デモ版から持ち越す課題)
3. [商用版の新規開発項目](#3-商用版の新規開発項目)
4. [アーキテクチャ変更](#4-アーキテクチャ変更)
5. [料金モデルとデータ構造](#5-料金モデルとデータ構造)
6. [プラットフォーム戦略・デザイン方針](#6-プラットフォーム戦略デザイン方針)
7. [移行手順](#7-移行手順)
8. [優先度とフェーズ分け](#8-優先度とフェーズ分け)

---

## 1. デモ版との違い

### 1.1 比較表

| 項目 | デモ版 | 商用版 |
|------|--------|--------|
| **認証** | `@example.com` の疑似メール | 実メールアドレス（本人確認付き） |
| **新規登録** | SQL手動挿入（管理者のみ） | セルフサービス登録画面 |
| **店舗作成** | SQL手動挿入 | 登録時に自動作成 |
| **マルチテナント** | 1店舗固定 | 企業 → 支店（複数店舗）階層 |
| **料金** | 無料（デモ用） | フリーミアム（20人/1店舗まで無料） |
| **ドメイン** | shiftize-demo.vercel.app | shiftize.jp |
| **対象業種** | 塾特化 | 業種汎用（塾・飲食・小売等） |
| **データ** | テスト用ダミーデータ入り | 空の状態から開始 |
| **用語** | 「講師」「授業」等の塾用語 | 「スタッフ」「業務」等の汎用用語 |
| **ランディングページ** | 技術デモ用 | 営業・集客用（SEO対策済み） |

### 1.2 削除・変更するもの

| 対象 | 理由 |
|------|------|
| デモ用ログイン直行コード | 新規登録フローに置き換え |
| `@example.com` メール変換ロジック (`toAsciiEmail`) | 実メールに移行 |
| `docs-local/manual-user-creation.md` | セルフサービス登録に移行 |
| パスワードの `users` テーブル二重保存 | Supabase Auth のみに一元化 |
| 塾固有のハードコード用語 | 設定で変更可能な汎用用語に |
| テストデータ・デモアカウント | 空のスキーマのみ |

---

## 2. デモ版から持ち越す課題

### 2.1 セキュリティ（最優先）

| # | 重要度 | 内容 | 対応方針 |
|---|--------|------|---------|
| S1 | **MEDIUM** | RLS `FOR ALL` で user が master 専用操作を実行可能 | 006/007のRLSを操作別に分離（SELECT/INSERT/UPDATE/DELETE） |
| S2 | **MEDIUM** | AuditAdapter/ShiftSubmissionAdapter の Realtime filter で storeId 未検証 | `validateStoreId()` を共通ユーティリティに抽出して全adapter適用 |
| S3 | **MEDIUM** | InfoDashboard の直接 Supabase 呼び出しがロール未確認 | ServiceProvider 経由に統一 + role ガード追加 |
| S4 | 既知 | パスワード二重保存 | Auth 一元化（商用版の認証リアーキテクチャで解消） |
| S5 | 既知 | ユーザー作成トランザクションなし | Edge Function 化 |
| S6 | 既知 | Web 環境で localStorage にトークン保存 | httpOnly cookie 検討 |

### 2.2 エラーハンドリング

| # | 重要度 | 内容 | ファイル |
|---|--------|------|---------|
| E1 | **HIGH** | `fetchShiftById` でエラー未チェック → 監査ログ破損 | SupabaseShiftAdapter:248 |
| E2 | **HIGH** | TodoAdapter の 7 メソッドでエラー完全無視 | SupabaseTodoAdapter 全体 |
| E3 | **MEDIUM** | useStaffTasks / useTimeSegmentTypes / useShiftTaskAssignments でエラー無視 | 各 hooks ファイル |

### 2.3 ロジックバグ

| # | 重要度 | 内容 | ファイル |
|---|--------|------|---------|
| L1 | **MEDIUM** | wageCalculator 日跨ぎシフトの重複計算バグ | wageCalculator.ts:254 |
| L2 | **MEDIUM** | autoScheduler 日跨ぎシフトの重複判定バグ | autoScheduler.ts:82 |
| L3 | **MEDIUM** | TodoAdapter toggleComplete TOCTOU 競合 | SupabaseTodoAdapter.ts:217 |
| L4 | **LOW** | autoScheduler `Math.random()` in sort comparator | autoScheduler.ts:249 |
| L5 | **LOW** | wageCalculator 負の勤務分数を返す可能性 | wageCalculator.ts:350 |

### 2.4 パフォーマンス

| # | 重要度 | 内容 | ファイル |
|---|--------|------|---------|
| P1 | **CRITICAL** | `select("*")` 30 箇所（プロジェクトルール違反） | 12 アダプタファイル |
| P2 | **HIGH** | `.find()` がレンダーループ内で多用 O(n²) | DailyTaskGanttView, components.tsx |
| P3 | **HIGH** | `getStatusConfig` 毎レンダー再生成 → memo 無効化 | GanttChartMonthView:256 |
| P4 | **HIGH** | GanttChartGrid overlap 検出 O(n²) | components.tsx:359 |
| P5 | **MEDIUM** | DailyTaskGanttView 2580 行、inline style 302 箇所 | DailyTaskGanttView.tsx |
| P6 | **MEDIUM** | inline lambda が React.memo を無効化（4 箇所） | GanttChartMonthView.tsx |

### 2.5 型安全性

| # | 重要度 | 内容 |
|---|--------|------|
| T1 | **MEDIUM** | `as any` が ShiftCreateForm(3), AuthContext(2), StoreAdapter(1) に残存 |
| T2 | **LOW** | `any` 型が約 48 箇所（ESLint ルールは off にしてある） |

### 2.6 テストカバレッジ

| 領域 | 現状 | 商用版目標 |
|------|------|-----------|
| サービス層（6/13 アダプタ） | 150 テスト | 全 13 アダプタ |
| 認証（AuthContext, useAuth） | 0 | 基本フロー |
| Context プロバイダー | 0 | 主要 5 Context |
| ビジネスロジック | wageCalculator, shiftStatus | autoScheduler 追加 |

---

## 3. 商用版の新規開発項目

### 3.1 認証・オンボーディング

| 機能 | 詳細 |
|------|------|
| **セルフサービス登録** | メール + パスワードで新規登録 → メール確認 → 店舗自動作成 |
| **招待フロー** | マスターがメールで招待 → 招待リンクから登録 → 自動的に店舗に参加 |
| **パスワードリセット** | Supabase Auth 標準のリセットフロー |
| **実メール認証** | `@example.com` 廃止、実メールアドレスのみ |

### 3.2 マルチテナント（企業 → 支店）

```
企業（Organization）
  ├── 支店A（Store）
  │     ├── マスター
  │     └── スタッフ 1..N
  ├── 支店B（Store）
  └── 支店C（Store）
```

- `organizations` テーブル新設（企業情報 + 課金プラン）
- `stores.organization_id` 追加
- 企業管理者（org_admin）ロール追加
- 支店間のスタッフ共有（ヘルプ要請）

### 3.3 課金・プラン管理

| プラン | 条件 | 機能 |
|--------|------|------|
| **Free** | スタッフ 20 人以下 & 1 店舗 | 全機能利用可 |
| **Pro** | 21 人以上 or 2 店舗以上 | 全機能 + 優先サポート |

- Stripe 連携（サブスクリプション）
- プランゲート（人数/店舗数チェック）
- 無料トライアル期間

### 3.4 用語のカスタマイズ

塾固有用語を汎用化 + 設定で変更可能に:

| デモ版（塾固有） | 商用版デフォルト | カスタム例 |
|----------------|----------------|-----------|
| 講師 | スタッフ | クルー、メンバー |
| 授業 | 業務 | シフト区分 |
| 教科 | 備考 | ポジション |
| 教室 | 店舗 | 支店、拠点 |

### 3.5 ランディングページ

- SEO 最適化（shiftize.jp）
- 営業用コンテンツ（導入事例、料金表、FAQ）
- お問い合わせフォーム
- デモ動画

---

## 4. アーキテクチャ変更

### 4.1 認証アーキテクチャ

```
デモ版:
  ログイン → @example.com 疑似メール → Supabase Auth → users テーブル二重保存

商用版:
  新規登録 → 実メール → Supabase Auth（唯一の認証ソース）
  招待    → メール招待リンク → Supabase Auth → 自動店舗参加
  ※ users テーブルのパスワード列は廃止
```

### 4.2 Edge Function 化

| 処理 | 現状 | 商用版 |
|------|------|--------|
| ユーザー作成 | クライアント直接 | Edge Function（トランザクション保証） |
| 店舗作成 | SQL 手動 | Edge Function（登録時自動） |
| 招待処理 | なし | Edge Function（メール送信 + トークン） |
| 課金チェック | なし | Edge Function（Stripe Webhook） |

### 4.3 RLS 強化

- 全テーブルで操作別ポリシー（SELECT / INSERT / UPDATE / DELETE）
- master ロールチェックを管理系テーブルの書き込みに適用
- organization_id ベースの追加分離

---

## 5. 料金モデルとデータ構造

### 5.1 新規テーブル

```sql
-- 企業テーブル
organizations (
  id UUID PRIMARY KEY,
  name TEXT,
  plan TEXT DEFAULT 'free',  -- 'free' | 'pro'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  max_staff INTEGER DEFAULT 20,
  max_stores INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ
)

-- stores に organization_id 追加
ALTER TABLE stores ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- 招待テーブル
invitations (
  id UUID PRIMARY KEY,
  organization_id UUID,
  store_id TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ
)
```

### 5.2 プランゲートロジック

```typescript
// スタッフ追加時
const staffCount = await getStaffCount(storeId);
const plan = await getOrganizationPlan(organizationId);
if (plan === 'free' && staffCount >= 20) {
  throw new PlanLimitError('無料プランはスタッフ20人までです');
}
```

---

## 6. プラットフォーム戦略・デザイン方針

### 6.1 リリース戦略

| 時期 | プラットフォーム | 形態 | 理由 |
|------|----------------|------|------|
| **夏ローンチ** | Web + PWA | Vercel デプロイ | 審査不要、URL共有で即営業可、開発速度最優先 |
| **秋以降** | Android | Expo EAS Build | ユーザー要望次第。Play Store審査はiOSより軽い |
| **需要確認後** | iOS | Expo EAS Build | Apple Developer Program($99/年) + 審査対応が必要 |

### 6.2 PWA戦略（ローンチ時のモバイル対応）

ネイティブアプリなしでもスマホ対応できる。既に `service-worker.js` が存在。

```
PWA で実現できること:
✅ ホーム画面に追加（アプリアイコン）
✅ オフライン基本対応
✅ フルスクリーン表示（ブラウザUI非表示）
✅ Web Push 通知（Android Chrome, iOS 16.4+）
✅ インストール不要 — URLを送るだけ

PWA で実現できないこと（ネイティブ版で対応）:
❌ バックグラウンド処理（定期同期）
❌ ネイティブカメラ高度制御
❌ App Store / Play Store 掲載（信頼感）
❌ ウィジェット
```

### 6.3 コード共有とプラットフォーム分岐

```
共通コード（95%）
├── services/        → 全プラットフォーム共通
├── common/          → 全プラットフォーム共通
├── modules/         → ビジネスロジックは共通
└── app/             → ルーティングは共通

プラットフォーム固有（5%）
├── *.web.tsx        → Web 専用（マウスホバー、キーボード操作、ブラウザ履歴）
├── *.ios.tsx        → iOS 専用（Apple HIG準拠、SafeArea）
├── *.android.tsx    → Android 専用（Material Design 3、戻るボタン）
└── *.native.tsx     → iOS/Android 共通（プッシュ通知、カメラ）
```

### 6.4 デザイン方針

| 方針 | 内容 |
|------|------|
| **デザインシステム** | 現行の MD3 ベースを継続。カラーテーマは設定で変更可能に |
| **レスポンシブ** | 既存の `useWindowDimensions` 分岐を維持（PC / タブレット / モバイル） |
| **Web 優先** | デスクトップ PC での管理者操作を最優先。モバイルは閲覧・申請中心 |
| **ネイティブ時** | Expo のプラットフォーム別拡張子（`.web.tsx` / `.ios.tsx`）で分岐 |
| **操作体系** | Web: マウス + キーボード / Native: タッチ + スワイプ + プッシュ通知 |

### 6.5 画面別プラットフォーム最適化

| 画面 | PC (Web) | タブレット (Web) | スマホ (PWA/Native) |
|------|----------|----------------|-------------------|
| ガントチャート | 横スクロール、ホバーでツールチップ | 分割レイアウト（カレンダー+ガント） | 縦型リスト（MobileVerticalView） |
| シフト作成 | モーダル | モーダル | フルスクリーン |
| スタッフ管理 | テーブル一覧 | テーブル一覧 | カードリスト |
| 給与確認 | 表形式 + CSV出力 | 表形式 | カード + 詳細モーダル |
| ホーム | ウィジェットダッシュボード | ウィジェットダッシュボード | 今日のシフトカード |

---

## 7. 移行手順

### 6.1 リポジトリ分離

```bash
# 1. デモ版をフォーク（GitHub上）
# Higash37/Shiftize-demo → Higash37/Shiftize（商用版）

# 2. 商用版をクローン
git clone https://github.com/Higash37/Shiftize.git
cd Shiftize

# 3. デモ固有コードを削除
# - テストデータ、デモログイン、@example.com ロジック

# 4. 新しい Supabase プロジェクトを作成
# - 商用版専用の Supabase インスタンス
# - マイグレーション 001-007 を実行
# - 新規テーブル（organizations, invitations）を追加

# 5. 環境変数を更新
# - 商用版 Supabase URL/Key
# - Stripe API Key
# - shiftize.jp ドメイン設定
```

### 6.2 Git 運用

- デモ版: `Shiftize-demo`（アーカイブ、メンテナンスのみ）
- 商用版: `Shiftize`（アクティブ開発）
- ブランチ戦略: `main` + feature branches + PRレビュー必須

---

## 8. 優先度とフェーズ分け

### Phase 1: 基盤（2-3 週間）
> 目標: 商用版が動く状態にする

- [ ] リポジトリフォーク + デモ固有コード削除
- [ ] 認証を実メールに切り替え（Auth 一元化）
- [ ] セルフサービス登録 + 店舗自動作成
- [ ] §2.1 セキュリティ課題（S1-S3: RLS修正, storeId検証, ロールガード）
- [ ] §2.2 エラーハンドリング（E1-E3: 全 Supabase 呼び出しにエラーチェック）

### Phase 2: 品質（2 週間）
> 目標: Copilot レビューに通るコード品質

- [ ] §2.3 ロジックバグ修正（L1-L5: 日跨ぎ, TOCTOU, 負値ガード）
- [ ] §2.4 パフォーマンス修正（P1-P6: select("*"), .find()→Map, memo最適化）
- [ ] §2.5 型安全性（as any 除去, any 型 48 箇所修正）
- [ ] テスト追加（残り 7 アダプタ + autoScheduler）

### Phase 3: 商用機能（3-4 週間）
> 目標: 有料プランで課金できる状態

- [ ] マルチテナント（organizations テーブル + UI）
- [ ] 招待フロー（Edge Function + メール送信）
- [ ] Stripe 連携（サブスクリプション + プランゲート）
- [ ] 用語カスタマイズ（設定画面 + i18n 基盤）

### Phase 4: ローンチ（2 週間）
> 目標: shiftize.jp で公開

- [ ] ランディングページ（SEO, 料金表, FAQ）
- [ ] Vercel 本番デプロイ（shiftize.jp）
- [ ] PWA 最適化（manifest.json, service-worker, アイコン）
- [ ] 利用規約・プライバシーポリシー
- [ ] 初期ユーザー獲得（自塾 + 知人の塾）

---

> **このドキュメントの更新**: フェーズ完了時、方針変更時に更新すること。
