# Shiftize 商用版 移行計画

> **対象読者**: 開発者・プロダクトオーナー
> **最終更新**: 2026-03-14 | **目標リリース**: 2026年夏

---

## 目次

1. [デモ版との違い](#1-デモ版との違い)
2. [デモ版から持ち越す課題](#2-デモ版から持ち越す課題)
3. [商用版の新規開発項目](#3-商用版の新規開発項目)
   - 3.2 オンボーディング導線
   - 3.3 ロール階層と権限（Owner / Manager / Staff）
   - 3.4 料金モデル（Free / Pro、Stripe連携フロー）
4. [アーキテクチャ変更](#4-アーキテクチャ変更)
5. [料金モデルとデータ構造](#5-料金モデルとデータ構造)
   - 5.1 新規テーブル（organizations, invitations）
   - 5.4 オーナー管理画面
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

### 3.2 オンボーディング導線

#### 新規登録フロー（オーナー）

```
1. ランディングページ（shiftize.jp）
   └─ 「無料で始める」ボタン
        │
2. 新規登録画面
   └─ メールアドレス + パスワード入力
        │
3. メール確認
   └─ 確認リンクをクリック
        │
4. 企業情報入力
   ├─ 企業名（例: 「○○学習塾」）
   ├─ 業種選択（塾・飲食・小売・医療・その他）
   └─ 用語プリセット自動適用（業種に応じて）
        │
5. 最初の支店作成
   └─ 支店名（例: 「本校」「渋谷店」）
        │
6. ダッシュボード（空の状態）
   ├─ チュートリアルオーバーレイ（初回のみ）
   ├─ 「スタッフを招待する」CTA
   └─ 「最初のシフトを作る」CTA
```

#### スタッフ招待フロー

```
オーナー/マネージャー側:
  スタッフ管理 → 「招待」→ メールアドレス入力 → ロール選択 → 送信
        │
招待メール送信（Edge Function）
        │
スタッフ側:
  メール内リンクをクリック → 登録画面（名前+パスワード）→ 自動的に支店に参加
```

#### 既存ユーザーの別支店参加

```
オーナーが別支店に招待 → メール通知 → アプリ内で承認 → 支店切替が可能に
```

### 3.3 ロール階層と権限

#### 3.3.1 組織構造

```
企業（Organization）←── サブスク契約の単位
  │
  ├── オーナー（Owner）      ← 1企業に1人。課金・全支店管理
  │
  ├── 支店A（Store）
  │     ├── マネージャー（Manager）  ← 支店責任者。シフト承認・スタッフ管理
  │     ├── スタッフ（Staff）        ← 一般従業員。シフト申請・閲覧
  │     └── スタッフ（Staff）
  │
  ├── 支店B（Store）
  │     ├── マネージャー（Manager）
  │     └── スタッフ（Staff）
  │
  └── 支店C（Store）
        └── マネージャー（Manager）  ← オーナーが兼任も可
```

#### 3.3.2 ロール定義

| ロール | DB値 | スコープ | 説明 |
|--------|------|---------|------|
| **オーナー** | `owner` | 企業全体 | サブスク契約者。企業設定・支店管理・課金管理。全支店のデータ閲覧可 |
| **マネージャー** | `manager` | 支店単位 | 支店の管理者。シフト承認/却下、スタッフ管理、給与確認。デモ版の「master」相当 |
| **スタッフ** | `staff` | 支店単位 | 一般従業員。シフト申請・閲覧・募集応募。デモ版の「user」相当 |

> **デモ版からの移行**: `master` → `owner` or `manager`、`user` → `staff`

#### 3.3.3 権限マトリクス

| 機能 | オーナー | マネージャー | スタッフ |
|------|:--------:|:----------:|:-------:|
| **企業レベル** | | | |
| サブスクリプション管理（Stripe） | ✅ | ❌ | ❌ |
| 支店の作成・削除 | ✅ | ❌ | ❌ |
| 支店間のスタッフ異動 | ✅ | ❌ | ❌ |
| 全支店のデータ閲覧 | ✅ | ❌ | ❌ |
| マネージャーの任命・解任 | ✅ | ❌ | ❌ |
| 企業設定（用語カスタマイズ等） | ✅ | ❌ | ❌ |
| **支店レベル** | | | |
| シフト承認・却下 | ✅ | ✅ | ❌ |
| シフト直接作成（承認不要） | ✅ | ✅ | ❌ |
| スタッフ招待・削除 | ✅ | ✅ | ❌ |
| スタッフの時給・ロール設定 | ✅ | ✅ | ❌ |
| 給与一覧・CSV出力 | ✅ | ✅ | ❌ |
| ガントチャート編集 | ✅ | ✅ | ❌ |
| 自動配置エンジン実行 | ✅ | ✅ | ❌ |
| 募集シフト作成 | ✅ | ✅ | ❌ |
| 店舗設定（業務・タスク等） | ✅ | ✅ | ❌ |
| **個人レベル** | | | |
| シフト申請（作成） | ✅ | ✅ | ✅ |
| 自分のシフト閲覧 | ✅ | ✅ | ✅ |
| ガントチャート閲覧（全体） | ✅ | ✅ | ✅ |
| 削除申請 | ✅ | ✅ | ✅ |
| 募集シフト応募 | ❌ | ❌ | ✅ |
| Google Calendar連携（自分） | ✅ | ✅ | ✅ |
| プロフィール編集 | ✅ | ✅ | ✅ |

#### 3.3.4 オーナーのマネージャー兼任

小規模事業者（1支店）ではオーナー = マネージャーになるケースが多い。

```
1支店の場合:
  オーナー（自分）= 支店のマネージャーを兼任
  → 企業管理画面は表示するが、日常操作はマネージャーUIで行う

複数支店の場合:
  オーナー → 企業ダッシュボード（全支店の俯瞰）
  各支店のマネージャー → 支店ごとのシフト管理
```

### 3.4 料金モデル

#### 3.4.1 プラン構成

| | Free | Pro |
|---|------|-----|
| **月額** | ¥0 | ¥1,980/月（税抜）|
| **年額** | ¥0 | ¥19,800/年（税抜、2ヶ月分お得） |
| **スタッフ数** | 20人まで | 無制限 |
| **支店数** | 1支店 | 無制限 |
| **機能** | 全機能利用可 | 全機能 + 優先サポート |
| **データ保持** | 6ヶ月 | 無制限 |
| **CSV出力** | ✅ | ✅ |
| **Google Calendar連携** | ✅ | ✅ |
| **通知** | ✅ | ✅ |

> **価格設定の根拠**: 競合（Airシフト ¥0〜、ジョブカン ¥200/人/月、シフオプ ¥300/人/月）と比較して、
> 「人数課金なし」の定額制で差別化。30人で使えば ¥66/人/月 相当。

#### 3.4.2 プランゲート（制限の実装）

```
Free → Pro へのアップグレード促進ポイント:

1. 21人目のスタッフ招待時
   → 「無料プランはスタッフ20人までです。Proプランにアップグレードしますか？」

2. 2つ目の支店作成時
   → 「無料プランは1支店までです。Proプランで複数支店を管理できます」

3. 6ヶ月前のデータ閲覧時
   → 「過去データの閲覧はProプランで利用できます」
```

#### 3.4.3 無料トライアル

- Pro プランの 30 日間無料トライアル（クレジットカード登録不要）
- トライアル中は全制限解除
- 期限後は Free プランに自動ダウングレード（データは保持、制限適用）

#### 3.4.4 Stripe 連携フロー

```
アップグレード:
  設定 → 料金プラン → 「Proに変更」
  → Stripe Checkout（決済画面）
  → Webhook → organizations.plan = 'pro' に更新
  → 制限解除

ダウングレード:
  設定 → 料金プラン → 「Freeに戻す」
  → 次回更新日まではPro継続
  → 更新日にWebhook → organizations.plan = 'free'
  → 制限適用（既存データは保持、超過分は読み取り専用）

解約:
  → ダウングレードと同じフロー
  → データは90日間保持、その後削除
```

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
-- 企業テーブル（サブスク契約の単位）
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                                    -- 企業名
  industry TEXT DEFAULT 'other',                         -- 業種（juku/restaurant/retail/medical/other）
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'trial')),
  trial_ends_at TIMESTAMPTZ,                             -- トライアル終了日
  stripe_customer_id TEXT,                               -- Stripe顧客ID
  stripe_subscription_id TEXT,                           -- StripeサブスクリプションID
  owner_uid UUID NOT NULL,                               -- オーナーのUID
  terminology JSONB DEFAULT '{}',                        -- 用語カスタマイズ {"staff":"クルー","store":"拠点"}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- stores に organization_id 追加
ALTER TABLE stores ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- users.role の値を拡張（owner / manager / staff）
-- デモ版の master → owner or manager, user → staff に移行

-- 招待テーブル
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  store_id TEXT NOT NULL REFERENCES stores(store_id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'staff' CHECK (role IN ('manager', 'staff')),
  invited_by UUID NOT NULL,                              -- 招待者のUID
  token TEXT NOT NULL UNIQUE,                            -- 招待トークン（URLに含める）
  expires_at TIMESTAMPTZ NOT NULL,                       -- 有効期限（7日）
  accepted_at TIMESTAMPTZ,                               -- 承認日時（NULL=未承認）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitations_token ON invitations (token);
CREATE INDEX idx_invitations_email ON invitations (email);
```

### 5.2 ロール管理のデータフロー

```
新規登録時:
  1. auth.users にユーザー作成
  2. organizations を作成（owner_uid = 自分）
  3. stores を作成（organization_id = 上記）
  4. users を作成（role = 'owner', store_id = 上記）

招待受諾時:
  1. invitations.token で招待を検索
  2. auth.users にユーザー作成
  3. users を作成（role = invitations.role, store_id = invitations.store_id）
  4. invitations.accepted_at を更新

支店追加時（オーナーのみ）:
  1. プランゲート確認（Free は 1 支店まで）
  2. stores を作成（organization_id = 既存企業）
  3. オーナーをその支店の管理者としても登録

ロール変更時（オーナーのみ）:
  1. users.role を更新（staff ↔ manager）
  2. owner は変更不可（企業に1人のみ）
```

### 5.3 プランゲートロジック

```typescript
// Edge Function: スタッフ招待時
async function checkPlanLimits(organizationId: string, action: 'add_staff' | 'add_store') {
  const org = await getOrganization(organizationId);
  const plan = org.trial_ends_at && new Date(org.trial_ends_at) > new Date()
    ? 'trial' : org.plan;

  if (plan === 'free') {
    if (action === 'add_staff') {
      const count = await getTotalStaffCount(organizationId);  // 全支店合計
      if (count >= 20) throw new PlanLimitError('FREE_STAFF_LIMIT');
    }
    if (action === 'add_store') {
      const count = await getStoreCount(organizationId);
      if (count >= 1) throw new PlanLimitError('FREE_STORE_LIMIT');
    }
  }
  // pro / trial は無制限
}
```

### 5.4 オーナー管理画面（企業ダッシュボード）

オーナーのみアクセス可能な企業レベルの管理画面。

```
企業ダッシュボード
├── 概要（全支店のシフト数、スタッフ数、今月の概況）
├── 支店管理
│     ├── 支店一覧（支店名、マネージャー、スタッフ数）
│     ├── 支店の追加・削除
│     └── スタッフの支店間異動
├── メンバー管理
│     ├── 全スタッフ一覧（支店横断）
│     ├── ロール変更（staff ↔ manager）
│     └── 招待管理（招待中・承認済み一覧）
├── プラン・課金
│     ├── 現在のプラン表示
│     ├── アップグレード / ダウングレード
│     ├── 請求履歴（Stripe Customer Portal）
│     └── 利用状況（スタッフ数 / 支店数 vs 上限）
└── 企業設定
      ├── 企業名・業種
      └── 用語カスタマイズ
```

---

## 6. プラットフォーム戦略・デザイン方針

### 6.1 リリース戦略

**方針: 夏に Web / Android / iOS 3プラットフォーム同時ローンチ**

通知機能（シフト承認通知、変更通知、リマインダー）はシフト管理の核心機能。
Web Push だけでは iOS Safari の信頼性が不十分なため、ネイティブアプリのストア公開を行う。

| フェーズ | プラットフォーム | 通知方式 | 備考 |
|---------|----------------|---------|------|
| Phase 1-2 | Web のみ | Supabase Realtime（起動中のみ） | 基盤完成に集中 |
| Phase 3 | Web + Android + iOS | Expo Push Notifications | ストア審査のリードタイム確保 |
| Phase 4 | 3プラットフォーム同時ローンチ | 全通知手段 | shiftize.jp + Play Store + App Store |

### 6.2 通知アーキテクチャ

```
通知トリガー（Supabase Edge Function or Database Webhook）
  │
  ├─ シフト承認/却下     → 申請したユーザーに通知
  ├─ シフト変更          → マスターに通知（変更通知バッジ連携）
  ├─ 削除申請            → マスターに通知
  ├─ シフト提出期間開始  → 全ユーザーに通知
  └─ リマインダー        → 翌日シフトがあるユーザーに前日通知
```

| 層 | 実装 |
|---|------|
| **通知送信** | Expo Push API（`expo-server-sdk`）— 1つのAPIで iOS/Android 両方に送信 |
| **トークン管理** | `push_tokens` テーブル（user_id, expo_push_token, platform, created_at） |
| **トリガー** | Supabase Database Webhook → Edge Function → Expo Push API |
| **Web 通知** | Web Push API（Service Worker 経由）— PWA 補完用 |
| **アプリ内通知** | Supabase Realtime（既存の変更通知バッジを拡張） |

```sql
-- 新規テーブル
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  store_id TEXT NOT NULL REFERENCES stores(store_id),
  expo_push_token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.3 ストア公開に必要な準備

| 項目 | Android (Play Store) | iOS (App Store) |
|------|---------------------|-----------------|
| **開発者アカウント** | Google Play Console ($25 一回) | Apple Developer Program ($99/年) |
| **ビルド** | Expo EAS Build (`eas build -p android`) | Expo EAS Build (`eas build -p ios`) |
| **審査期間** | 数日 | 1-2 週間（初回は厳しめ） |
| **必要素材** | アイコン、スクリーンショット 4枚+ | アイコン、スクリーンショット 6.7"/5.5" |
| **プライバシーポリシー** | 必須（URL） | 必須（URL） |
| **年齢レーティング** | IARC 質問票 | App Store 質問票 |

### 6.4 PWA 併用（Web ユーザー向け）

ストア公開と並行して PWA も維持。インストール不要でURLを送るだけで試せる営業メリットは大きい。

```
営業フロー:
1. 見込み客にURLを送る → PWAですぐ試せる
2. 気に入ったらストアからアプリをインストール → プッシュ通知が使える
3. 有料プランに切り替え
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

### Phase 3: 商用機能 + ネイティブ（3-4 週間）
> 目標: 有料プランで課金 + 3プラットフォームで通知が届く状態

- [ ] マルチテナント（organizations テーブル + UI）
- [ ] 招待フロー（Edge Function + メール送信）
- [ ] Stripe 連携（サブスクリプション + プランゲート）
- [ ] 用語カスタマイズ（設定画面 + i18n 基盤）
- [ ] **Expo Push Notifications 実装**（`expo-notifications` + `push_tokens` テーブル）
- [ ] **通知トリガー**（Edge Function: 承認/却下/変更/リマインダー）
- [ ] **Expo EAS Build 設定**（`eas.json`, `app.json` ネイティブ設定）
- [ ] **Android ビルド + Play Store 内部テスト公開**
- [ ] **iOS ビルド + TestFlight 公開**（審査リードタイム確保）

### Phase 4: ローンチ（2 週間）
> 目標: shiftize.jp + Play Store + App Store で同時公開

- [ ] ランディングページ（SEO, 料金表, FAQ）
- [ ] Vercel 本番デプロイ（shiftize.jp）
- [ ] PWA 最適化（manifest.json, service-worker, アイコン）
- [ ] **Play Store 本番公開**
- [ ] **App Store 本番公開**
- [ ] 利用規約・プライバシーポリシー
- [ ] 初期ユーザー獲得（自塾 + 知人の塾）

---

> **このドキュメントの更新**: フェーズ完了時、方針変更時に更新すること。
