# Shiftize 運用・保守ガイド

> **対象読者**: 開発者・SRE・プロジェクトマネージャー
> **最終更新**: 2026-03-13 | **バージョン**: 2.0.0

---

## 目次

1. [システム概要](#1-システム概要)
2. [アーキテクチャ](#2-アーキテクチャ)
3. [環境構築・デプロイ](#3-環境構築デプロイ)
4. [ディレクトリ構成](#4-ディレクトリ構成)
5. [サービス層の設計](#5-サービス層の設計)
6. [データフロー](#6-データフロー)
7. [認証フロー](#7-認証フロー)
8. [複雑なビジネスロジック解説](#8-複雑なビジネスロジック解説)
9. [セキュリティ実装](#9-セキュリティ実装)
10. [パフォーマンス設計](#10-パフォーマンス設計)
11. [テスト戦略](#11-テスト戦略)
12. [障害対応・トラブルシューティング](#12-障害対応トラブルシューティング)
13. [バージョン管理・リリース](#13-バージョン管理リリース)
14. [依存関係](#14-依存関係)
15. [用語集（ドメイン用語）](#15-用語集ドメイン用語)
16. [ユーザーロールと権限](#16-ユーザーロールと権限)
17. [シフトのステータスライフサイクル](#17-シフトのステータスライフサイクル)
18. [データモデル](#18-データモデル)
19. [開発環境セットアップ（初回）](#19-開発環境セットアップ初回)

---

## 1. システム概要

### 1.1 プロダクト概要

Shiftize は**エンタープライズ級のシフト管理アプリケーション**である。
React Native (Expo) を基盤にし、iOS / Android / Web をワンソースで提供する。

### 1.2 主要機能

| 機能 | 説明 |
|------|------|
| シフト管理 | 作成・編集・削除・承認ワークフロー |
| ガントチャート | PC / タブレット / モバイル対応の月次・日次表示 |
| 自動配置エンジン | 業務・タスクをスタッフに均等自動割り当て |
| 給与計算 | 時給 × 勤務時間、途中時間の除外/カスタムレート対応 |
| 募集シフト | QRコード / URL によるシフト募集・応募 |
| 通知 | リアルタイム変更通知（Supabase Realtime） |
| GDPR準拠 | 暗号化・監査ログ・データ削除・同意管理 |
| Google Calendar連携 | シフトの双方向同期 |
| PDF出力 | シフト表のPDFエクスポート |

### 1.3 技術スタック

```
フロントエンド:  React 19 + React Native 0.81 + Expo 54 + Expo Router 6
バックエンド:    Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
型システム:      TypeScript 5.9（strict: true, 全13オプション有効）
バリデーション:  Zod 4.3
暗号化:          CryptoJS (AES-256-CBC)
デプロイ:        Vercel (Web) / Expo (iOS・Android)
```

---

## 2. アーキテクチャ

### 2.1 全体構成図

```
┌─────────────────────────────────────────────────────────┐
│                    クライアント                           │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ iOS App  │  │ Android  │  │     Web (PWA)         │  │
│  │          │  │   App    │  │                       │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
│       └──────────────┼──────────────────-┘              │
│                      │                                  │
│              ┌───────┴───────┐                          │
│              │  Expo Router  │  ファイルベースルーティング │
│              │  (app/ 配下)  │                          │
│              └───────┬───────┘                          │
│                      │                                  │
│  ┌───────────────────┼───────────────────────────────┐  │
│  │            Service Layer                          │  │
│  │                                                   │  │
│  │  ServiceProvider (Service Locator)                 │  │
│  │    ├─ IAuthService      → SupabaseAuthAdapter     │  │
│  │    ├─ IUserService      → SupabaseUserAdapter     │  │
│  │    ├─ IShiftService     → SupabaseShiftAdapter    │  │
│  │    ├─ IStoreService     → SupabaseStoreAdapter    │  │
│  │    ├─ IAuditService     → SupabaseAuditAdapter    │  │
│  │    └─ ... 全13サービス                              │  │
│  └───────────────────┼───────────────────────────────┘  │
└──────────────────────┼──────────────────────────────────┘
                       │ HTTPS / WSS
              ┌────────┴────────┐
              │    Supabase     │
              │                 │
              │  ┌───────────┐  │
              │  │PostgreSQL │  │  RLS (Row Level Security)
              │  │           │  │  店舗ID による完全分離
              │  └───────────┘  │
              │  ┌───────────┐  │
              │  │  Auth     │  │  JWT + Refresh Token
              │  └───────────┘  │
              │  ┌───────────┐  │
              │  │ Realtime  │  │  WebSocket (postgres_changes)
              │  └───────────┘  │
              │  ┌───────────┐  │
              │  │Edge Func  │  │  Token交換・OAuth更新
              │  └───────────┘  │
              └─────────────────┘
```

### 2.2 設計原則

| 原則 | 実装 |
|------|------|
| **Interface Segregation** | サービスごとにインターフェース分離（IAuthService, IShiftService 等） |
| **Adapter Pattern** | Supabase依存をAdapter内に閉じ込め、バックエンド交換を容易に |
| **Service Locator** | ServiceProvider でサービスを一元管理。テスト時はモック差し替え |
| **Context分離** | Auth・タスク・テーマなど関心事ごとにReact Contextを分離 |
| **snake_case ↔ camelCase変換** | DB層はsnake_case、アプリ層はcamelCase。Adapterが変換を担当 |

---

## 3. 環境構築・デプロイ

### 3.1 前提条件

```
Node.js  >= 18.x
npm      >= 9.x
Expo CLI (npx expo)
```

### 3.2 初期セットアップ

```bash
# 1. リポジトリクローン
git clone <repository-url>
cd Shiftize-demo

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp .env.example .env
# .env を編集（下記参照）

# 4. 開発サーバー起動
npm run dev        # Expo 開発サーバー
npm run web        # Web 版のみ
```

### 3.3 環境変数一覧

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `EXPO_PUBLIC_SUPABASE_URL` | **必須** | Supabase プロジェクトURL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | **必須** | Supabase 匿名キー（公開用） |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | 任意 | Google OAuth クライアントID |
| `EXPO_PUBLIC_USE_SUPABASE` | 必須 | `true` 固定（Supabase使用フラグ） |
| `EXPO_PUBLIC_JMA_AREA_CODE` | 任意 | 気象庁エリアコード（天気表示用） |

### 3.4 Supabase マイグレーション

```bash
# マイグレーション適用順（依存関係あり）
supabase/migrations/
  001_schema_and_rpc.sql           # メインスキーマ + RPC関数
  002_oauth_linking.sql             # マルチプロバイダOAuth
  003_google_calendar_sync.sql      # カレンダー連携テーブル
  004_google_calendar_token_rpc.sql # トークン更新RPC
  005_daily_todos.sql               # 日次TODO機能
  006_staff_roles.sql               # 業務・タスク・配置
  007_remaining_tables.sql          # 途中時間タイプ・レポート・自動配置
  005_daily_todos.sql               # 日次ToDo機能
```

> **注意**: 005 の RLS ポリシーは `store_id` ベースの適切なポリシーに修正済み（2026-03-13）。
> `USING(true)` は使用していない。

### 3.5 ビルド・デプロイ

```bash
# Web ビルド（Vercel 向け）
npm run build

# Vercel デプロイ
npm run vercel-build    # 出力: dist/

# バンドルサイズ分析
npm run analyze:bundle
```

### 3.6 デプロイチェックリスト

- [ ] `npx tsc --noEmit` — 型チェック通過
- [ ] `npx jest` — テスト全件パス
- [ ] `npm audit` — 重大な脆弱性なし
- [ ] 環境変数が本番値に設定済み
- [ ] Supabase RLS ポリシーが有効
- [ ] Service Worker キャッシュ戦略が適切

---

## 4. ディレクトリ構成

```
src/
├── app/                              # Expo Router ルーティング
│   ├── _layout.tsx                   # ルートレイアウト（Provider ラッピング）
│   ├── (auth)/                       # 認証画面群
│   └── (main)/                       # メイン画面群（認証必須）
│       ├── master/                   # 管理者用画面
│       └── user/                     # スタッフ用画面
│
├── common/                           # 共有モジュール
│   ├── common-constants/             # 定数（色・フォント・ブレークポイント等）
│   ├── common-context/               # React Context プロバイダー
│   ├── common-errors/                # カスタムエラークラス
│   ├── common-hooks/                 # 汎用カスタムフック
│   ├── common-models/                # 型定義（Shift, User, Store 等）
│   ├── common-ui/                    # 再利用UIコンポーネント
│   └── common-utils/                 # ユーティリティ
│       ├── security/                 # 暗号化・監査・GDPR
│       ├── util-date/                # 日付操作・祝日判定
│       ├── util-shift/               # 給与計算
│       ├── util-validation/          # 入力検証・XSS対策
│       └── util-storage/             # ローカルストレージ
│
├── modules/                          # 機能モジュール
│   ├── home-view/                    # ホーム画面（スタッフダッシュボード）
│   │   ├── home-utils/               # shiftStatusUtils（勤務状態判定）
│   │   └── home-data/                # ganttTimeUtils（時間配列生成）
│   ├── login-view/                   # ログイン画面
│   ├── master-view/                  # 管理者画面
│   │   ├── auto-scheduling/          # 自動配置エンジン ★
│   │   ├── info-dashboard/           # 業務・タスク管理
│   │   └── ganttView/                # ガントチャート表示
│   ├── user-view/                    # ユーザープロフィール
│   └── reusable-widgets/             # 共有ウィジェット
│       ├── gantt-chart/              # ガントチャートコンポーネント群
│       └── calendar/                 # カレンダーコンポーネント
│
└── services/                         # サービス層
    ├── ServiceProvider.ts            # サービスロケーター（13サービス）
    ├── initializeServices.ts         # 起動時初期化
    ├── interfaces/                   # サービスインターフェース定義
    ├── auth/                         # 認証（AuthContext, useAuth）
    ├── supabase/                     # Supabase アダプター群（13ファイル）
    ├── google-calendar/              # Google Calendar 連携
    ├── shift-history/                # シフト変更履歴・監査ログ
    └── version/                      # バージョン管理
```

---

## 5. サービス層の設計

### 5.1 Service Locator パターン

```
ServiceProvider（シングルトン）
  │
  ├── .auth          → IAuthService       (認証)
  ├── .users         → IUserService       (ユーザーCRUD)
  ├── .shifts        → IShiftService      (シフトCRUD + Realtime)
  ├── .stores        → IStoreService      (店舗管理)
  ├── .settings      → ISettingsService   (設定管理)
  ├── .audit         → IAuditService      (監査ログ)
  ├── .confirmations → IShiftConfirmationService (シフト確認)
  ├── .quickShifts   → IQuickShiftTokenService   (募集シフト)
  ├── .teacherStatus → ITeacherStatusService     (講師ステータス)
  ├── .submissions   → IShiftSubmissionService   (シフト提出)
  ├── .multiStore    → IMultiStoreService        (マルチ店舗)
  ├── .calendar      → IGoogleCalendarService    (カレンダー連携)
  └── .todos         → ITodoService              (ToDo管理)
```

**設計の根拠**: React のコンポーネントベースアーキテクチャでは、Java/C# のようなコンストラクタインジェクションが使えない。Service Locator により、サービスの取得・差し替え（テスト時のモック等）を簡潔に実現している。

### 5.2 Adapter パターンの実装例

```typescript
// インターフェース定義（services/interfaces/IShiftService.ts）
interface IShiftService {
  getShifts(storeId: string): Promise<ShiftItem[]>;
  createShift(shift: Omit<Shift, "id">): Promise<ShiftItem>;
  subscribeToShifts(storeId: string, callback: Function): () => void;
  // ...
}

// Supabase 実装（services/supabase/SupabaseShiftAdapter.ts）
class SupabaseShiftAdapter implements IShiftService {
  async getShifts(storeId) {
    const { data } = await getSupabase()
      .from("shifts")
      .select(SHIFT_ITEM_COLUMNS)       // 必要列のみ
      .eq("store_id", storeId);
    return data.map(toShiftItemFromRow);  // snake_case → camelCase
  }
}
```

**バックエンド交換時の影響範囲**: Adapter クラスのみ。インターフェースを実装した新 Adapter を作成し、`initializeServices.ts` で差し替えるだけでよい。

### 5.3 初期化フロー

```
アプリ起動
  │
  ├─ app/_layout.tsx
  │   ├─ initializeServices()        ← 全13アダプタをインスタンス化
  │   ├─ <AuthProvider>              ← 認証状態管理
  │   ├─ <TimeSegmentTypesProvider>  ← 途中時間の型マスタ
  │   ├─ <StaffRolesProvider>        ← 業務・タスクマスタ
  │   └─ <ShiftTaskAssignmentsProvider>
  │
  └─ 各画面コンポーネント
      └─ ServiceProvider.shifts.getShifts()  ← 利用
```

---

## 6. データフロー

### 6.1 読み取りフロー（例: 月次シフト取得）

```
GanttChartMonthView (UI)
  │
  │ useEffect → ServiceProvider.shifts.getShiftsByMonth(storeId, year, month)
  │
  ▼
SupabaseShiftAdapter.getShiftsByMonth()
  │
  ├─ validateStoreId(storeId)              ← インジェクション防止
  │
  ├─ supabase.from("shifts")
  │    .select(SHIFT_ITEM_COLUMNS)         ← 18列のみ取得（select("*") は不使用）
  │    .eq("store_id", storeId)
  │    .gte("date", startDate)
  │    .lte("date", endDate)
  │
  ├─ data.map(toShiftItemFromRow)          ← snake_case → camelCase 変換
  │
  ▼
ShiftItem[] → コンポーネント state → 再レンダリング
```

### 6.2 リアルタイム購読フロー

```
SupabaseShiftAdapter.onShiftsByMonth(storeId, year, month, callback)
  │
  ├─ validateRealtimeParams(storeId, year, month)  ← バリデーション
  │
  ├─ supabase.channel(`shifts-month:${storeId}:${uniqueId}`)
  │    .on("postgres_changes", {
  │        event: "*",
  │        table: "shifts",
  │        filter: `store_id=eq.${storeId}`
  │    })
  │    .subscribe()
  │
  ├─ 変更検知 → debouncedFetch()
  │              │
  │              └─ 300ms デバウンス（REALTIME_DEBOUNCE_MS）
  │                  │
  │                  └─ 全件再取得 → callback(ShiftItem[])
  │
  └─ return unsubscribe()  ← クリーンアップ関数
```

> **設計判断**: 変更イベントは差分のみだが、整合性を保証するため全件再取得している。
> デバウンスにより、短時間の連続変更でもDBへの問い合わせは1回に抑制される。

### 6.3 書き込みフロー（例: シフト作成）

```
ShiftEditModal (UI) → フォーム入力
  │
  ├─ Zod バリデーション（クライアント側）
  │
  ├─ ServiceProvider.shifts.createShift(shiftData)
  │
  ▼
SupabaseShiftAdapter.createShift()
  │
  ├─ toInsertRow(shift)             ← camelCase → snake_case 変換
  │
  ├─ supabase.from("shifts").insert(row)
  │    │
  │    └─ PostgreSQL RLS チェック    ← store_id が認証ユーザーと一致するか
  │
  ├─ 監査ログ記録（shiftHistoryLogger）
  │
  ▼
Realtime 通知 → 全クライアントに自動反映
```

---

## 7. 認証フロー

### 7.1 ログインシーケンス

```
ユーザー入力（メール + パスワード）
  │
  ▼
LoginForm.tsx
  │
  ├─ toAsciiEmail(email)              ← 全角→半角、特殊文字エンコード
  ├─ RateLimiter.check()              ← ブルートフォース防止
  ├─ CSRFTokenManager.validate()      ← CSRF対策
  │
  ▼
SupabaseAuthAdapter.signIn(email, password)
  │
  ├─ supabase.auth.signInWithPassword()
  │    │
  │    └─ Supabase Auth サーバーで検証
  │        ├─ JWT (Access Token) 発行
  │        └─ Refresh Token 発行
  │
  ▼
AuthContext.signIn()
  │
  ├─ dispatch({ type: "SIGN_IN", user, role })
  ├─ ServiceProvider.users.getUserFullProfile(uid)
  │
  ▼
認証状態更新 → useAuth() で全コンポーネントに反映
  │
  ├─ role === "master" → 管理者画面へルーティング
  └─ role === "user"   → スタッフ画面へルーティング
```

### 7.2 セッション永続化

| プラットフォーム | ストレージ | セキュリティ |
|-----------------|-----------|-------------|
| iOS / Android | `expo-secure-store` | ハードウェアキーストア |
| Web | `localStorage` | ※改善余地あり（httpOnly cookie推奨） |

### 7.3 ロールベースアクセス制御

| ロール | 権限 |
|--------|------|
| `master` | 全操作（シフトCRUD、スタッフ管理、設定変更、自動配置実行） |
| `user` / `staff` | 自分のシフト閲覧、シフト提出、プロフィール編集 |

---

## 8. 複雑なビジネスロジック解説

### 8.1 自動配置エンジン

**ファイル**: `src/modules/master-view/auto-scheduling/autoScheduler.ts`
**関数**: `computeAutoSchedule(input: AutoScheduleInput): ProposedAssignment[]`

#### 目的

業務（roles）とタスク（tasks）にスケジュール設定（曜日・時間帯・所要時間・必要人数）を定義し、
出勤中かつ該当業務/タスクができるスタッフに**均等に自動割り当て**する。

#### アルゴリズム詳細

```
入力:
  - shifts: ShiftItem[]              その月の承認済みシフト
  - roles: StaffRole[]               業務マスタ（スケジュール設定付き）
  - tasks: RoleTask[]                タスクマスタ（スケジュール設定付き）
  - roleAssignments: Map<roleId, userId[]>  業務のアサイン設定
  - taskAssignments: Map<taskId, userId[]>  タスクのアサイン設定

処理:
  1. roles + tasks からスケジュール設定のあるものを "schedulables" として収集
  2. 月内の各日で schedule_days（曜日設定）に一致する日を特定
  3. その日の承認済みシフトのうち、スケジュール時間帯と重複するものを抽出
  4. 候補者を 3段階ソート で優先順位付け:
     ├─ (1) その日の割り当て回数（少ない人優先 → 1日の負荷分散）
     ├─ (2) そのタスクの割り当て回数（少ない人優先 → タスク均等）
     └─ (3) 全体の割り当て回数（少ない人優先 → 月間均等）
  5. required_count 人を選択
  6. 時間枠の重複チェック（assignedSlots マップ）でダブルブッキング防止

出力:
  - ProposedAssignment[]  → DBに保存可能な割り当て提案
```

#### 計算量

**O(D × S × T × C)** — D: 日数(31), S: スケジュール項目数, T: 時間枠数, C: 候補者数

#### 2つのスケジューリングモード

| モード | 条件 | 動作 |
|--------|------|------|
| **固定時刻** | `scheduleStartTime` が設定済み | 指定時刻に1枠生成 |
| **インターバル** | `scheduleIntervalMinutes` が設定済み | シフト時間内で N分間隔で複数枠生成 |

#### 使用例

```typescript
const result = computeAutoSchedule({
  year: 2026, month: 3,
  shifts: approvedShifts,
  roles: rolesWithSchedule,
  tasks: tasksWithSchedule,
  roleAssignments, taskAssignments,
  existingAssignments: [],  // 既存割り当て（カウント初期値に使用）
});
// result: [{ taskId, userId, scheduledDate, scheduledStartTime, scheduledEndTime, source: "auto" }, ...]
```

---

### 8.2 給与計算エンジン

**ファイル**: `src/common/common-utils/util-shift/wageCalculator.ts`
**関数**: `calculateTotalWage(shift, hourlyWage, typesMap): WageResult`

#### 計算ロジック

```
基本給 = (シフト終了時刻 - シフト開始時刻) × 時給 / 60

途中時間（授業・休憩等）の扱い:
  ├─ wageMode === "exclude"       → 基本給から控除
  ├─ wageMode === "include"       → 控除なし（基本給に含む）
  └─ wageMode === "custom_rate"   → カスタムレートで再計算

最終給与 = 基本給 - 控除額 + カスタムレート加算額（端数四捨五入）
```

#### 日跨ぎ対応

```typescript
// endTime < startTime の場合（例: 23:00 → 01:00）
// 1440分（24時間）を加算して正の値にする
if (endMinutes < startMinutes) {
  endMinutes += 1440;
}
// 結果: 23:00(1380) → 01:00(60+1440=1500) = 120分
```

#### ヘルパー関数

| 関数 | 用途 | 計算量 |
|------|------|--------|
| `timeStringToMinutes("HH:mm")` | 時刻文字列→分変換 | O(1) |
| `calculateMinutesBetween(start, end)` | 2時刻間の分数（日跨ぎ対応） | O(1) |
| `isTimeOverlapping(r1, r2)` | 2区間の重複判定 | O(1) |
| `calculateOverlapMinutes(r1, r2)` | 重複分数の計算 | O(1) |
| `calculateWorkMinutesExcludingClasses(shift, classes)` | 途中時間除外後の実労働分数 | O(C) |

---

### 8.3 勤務状態判定

**ファイル**: `src/modules/home-view/home-utils/shiftStatusUtils.ts`
**関数**: `getShiftStatus(selectedDate, staffSlots, classSlots): ShiftStatusResult`

#### 状態遷移図

```
                    ┌─────────────┐
         今日でない │  EMPTY      │ テキスト・アイコンなし
                    └─────────────┘

今日の場合:

  シフトなし ──────→ EMPTY

  現在時刻 < 最初のシフト開始
    ├─ 6時間以上前 → "今日の HH:MM~"        (calendar-today)
    └─ 6時間未満  → "このあと HH:MM~"       (clock-outline)

  現在時刻 ≥ 最後のシフト終了
    └─────────────→ "勤務終了"               (check-circle-outline)

  現在時刻がスタッフ勤務中
    └─────────────→ "現在: スタッフ中"        (briefcase-outline)

  現在時刻が途中時間（授業等）中
    └─────────────→ "現在: 途中時間中"        (book-open-variant)

  上記いずれにも該当しない
    └─────────────→ "現在: 休憩中"            (coffee-outline)
```

#### 連続スロットグループ化

**関数**: `groupConsecutiveSlots(scheduleColumns): GroupedSlot[]`

```
入力:  ["09:00", "09:30", "10:00", "12:00", "12:30"]
       （各スロットは30分間隔）

処理:  隣接スロットを結合

出力:  [
         { start: "09:00", end: "10:30" },  // 09:00-09:30-10:00 を結合
         { start: "12:00", end: "13:00" },  // 12:00-12:30 を結合
       ]
```

**用途**: ホーム画面の時計ウィジェットの円弧描画に使用。

---

### 8.4 ガントチャート レイアウトエンジン

**ファイル**: `src/modules/reusable-widgets/gantt-chart/gantt-chart-common/components.tsx`

#### レンダリング構造

```
GanttChartMonthView（月次カレンダー）
  │
  ├─ MonthSelectorBar（年月選択 + 自動配置ボタン）
  │
  └─ GanttChartBody（スタッフ行のリスト）
      │
      ├─ FlatList（仮想スクロール、パフォーマンス最適化済み）
      │
      └─ GanttChartRow × N（各スタッフ）
          │
          ├─ DateCell（日付セル、祝日色分け）
          │
          ├─ GanttChartGrid（シフトバー描画領域）
          │   │
          │   └─ ShiftBarWithCheckbox × M（各シフト）
          │       │
          │       ├─ 位置計算: left = (startMinutes - dayStart) / totalMinutes × 100%
          │       ├─ 幅計算:   width = duration / totalMinutes × 100%
          │       │
          │       └─ タスク行
          │           ├─ 途中時間（classSlots）→ 実線ボーダー
          │           └─ 自動配置タスク → 破線ボーダー（borderStyle: "dashed"）
          │
          └─ EmptyCell（シフトなしの日）
```

#### 列詰めロジック

重複しないシフトを同じ行にグループ化し、縦方向のスペースを節約する。

```
入力: [09:00-12:00, 10:00-14:00, 13:00-17:00, 18:00-22:00]

グループ化:
  行1: [09:00-12:00, 13:00-17:00, 18:00-22:00]  ← 重複なし
  行2: [10:00-14:00]                              ← 行1と重複

表示: 2行で4シフトを表示（最小行数）
```

---

### 8.5 暗号化システム

**ファイル**: `src/common/common-utils/security/encryptionUtils.ts`

#### AES-256-CBC 暗号化フロー

```
平文 → AESEncryption.encrypt(plaintext, key)
  │
  ├─ ランダムIV生成（16バイト）
  ├─ ランダムSalt生成
  ├─ PBKDF2でkey + salt → 派生鍵
  ├─ AES-256-CBC で暗号化
  │
  └─ 出力: Base64エンコード文字列
         （Salt + IV + 暗号文 を結合）

復号: AESEncryption.decrypt(ciphertext, key)
  │
  ├─ Base64デコード
  ├─ Salt, IV, 暗号文 を分離
  ├─ PBKDF2で派生鍵を再生成
  ├─ AES-256-CBC で復号
  │
  └─ 出力: 平文
```

#### プラットフォーム別の鍵管理

| プラットフォーム | 鍵保管場所 | セキュリティレベル |
|-----------------|-----------|-------------------|
| iOS | Keychain (expo-secure-store) | ハードウェア保護 |
| Android | Keystore (expo-secure-store) | ハードウェア保護 |
| Web | 暗号化バイパス | ※クライアントサイドでは鍵保護不可 |

> **残存課題**: Web環境では暗号化がバイパスされる。商用版では Web Crypto API への移行が必要。

---

## 9. セキュリティ実装

### 9.1 対策一覧

| レイヤー | 対策 | 実装箇所 |
|----------|------|----------|
| **データベース** | RLS (Row Level Security) | 全テーブルに `store_id` ベースのポリシー |
| **暗号化** | AES-256-CBC | 個人情報（PII）の暗号化 |
| **認証** | JWT + Refresh Token | Supabase Auth |
| **入力検証** | Zod スキーマ | zodValidation.ts |
| **XSS対策** | 入力サニタイズ | inputValidation.ts |
| **CSRF対策** | トークン検証 | CSRFTokenManager |
| **ブルートフォース** | レートリミッター | RateLimiter |
| **タイミング攻撃** | 定数時間比較 | `safeStringCompare()` |
| **Realtime注入** | storeId バリデーション | `validateStoreId()` |
| **監査** | 全操作ログ（7年保存） | SupabaseAuditAdapter |
| **GDPR** | データ削除・同意管理 | PersonalDataDeletion |

### 9.2 RLS ポリシー設計

```sql
-- 基本パターン: store_id による行レベル分離
CREATE POLICY "store_isolation" ON shifts
  FOR ALL
  USING (store_id IN (
    SELECT store_id FROM users WHERE uid = auth.uid()::text
  ));
```

> ユーザーは自分が所属する店舗のデータのみアクセス可能。
> 管理者であっても他店舗のデータは参照できない。

### 9.3 管理者操作の追加検証

```typescript
// SupabaseUserAdapter.ts — 管理者によるユーザー削除
async secureDeleteUserByAdmin(targetUserId, storeId, adminUserId) {
  // 1. 管理者ロール検証
  const admin = await this.getUserData(adminUserId);
  if (admin.role !== "master") throw new PermissionError();

  // 2. store_id クロスチェック（店舗間削除防止）
  const adminProfile = await getStoreId(adminUserId);
  const targetProfile = await getStoreId(targetUserId);
  if (adminProfile.store_id !== targetProfile.store_id) {
    throw new PermissionError("異なる店舗のユーザーを削除する権限がありません");
  }

  // 3. GDPR準拠削除 + 監査ログ
  await PersonalDataDeletion.deleteUserDataByAdmin(targetUserId, storeId, adminUserId);
  SecurityLogger.logEvent({ type: "ADMIN_DELETE", ... });
}
```

---

## 10. パフォーマンス設計

### 10.1 最適化一覧

| カテゴリ | 手法 | 実装箇所 |
|----------|------|----------|
| **レンダリング** | `React.memo`, `useMemo`, `useCallback` | ガントチャート全コンポーネント |
| **リスト描画** | `FlatList` 仮想スクロール | スタッフ行、シフト一覧 |
| **コード分割** | `React.lazy` + `Suspense` | モーダル、タブコンテンツ |
| **データ取得** | 必要列のみ SELECT | `SHIFT_ITEM_COLUMNS` |
| **リアルタイム** | 300ms デバウンス | `REALTIME_DEBOUNCE_MS` |
| **データ検索** | Map O(1) ルックアップ | `userMap`, `assignmentsByShift` |
| **フォント** | 動的読み込み | expo-font |
| **画像** | 遅延読み込み | `OptimizedImage` コンポーネント |

### 10.2 計算量の重要ポイント

| 処理 | 修正前 | 修正後 |
|------|--------|--------|
| ユーザー検索（給与モーダル） | O(n²) `Array.find()` | O(n) `Map.get()` |
| シフト列取得 | `select("*")` 全列 | 18列のみ指定 |
| デバウンス未設定箇所 | なし（連続発火） | 300ms 抑制 |
| setTimeout未クリーンアップ | メモリリーク | `clearTimeout()` 追加 |

---

## 11. テスト戦略

### 11.1 テスト実行

```bash
# 全テスト実行
npx jest

# ウォッチモード
npx jest --watch

# カバレッジ
npx jest --coverage

# 特定ファイル
npx jest src/services/supabase/SupabaseShiftAdapter.test.ts
```

### 11.2 テストカバレッジ（2026-03-13 時点）

| テスト対象 | テスト数 | カバー範囲 |
|-----------|---------|-----------|
| SupabaseShiftAdapter | 30 | CRUD・月次取得・承認 |
| SupabaseUserAdapter | 27 | ユーザー管理・GDPR削除 |
| SupabaseQuickShiftTokenAdapter | 27 | トークン作成・検証 |
| ServiceProvider | 43 | シングルトン・全13サービス |
| shiftStatusUtils | 14 | 勤務状態判定 |
| ganttTimeUtils | 9 | pad関数・時間配列 |
| **合計** | **150** | |

既存テスト（別ブランチ `feat/add-test-suite`）:
- 暗号化（encryptionUtils）、バリデーション（zodValidation）、
  給与計算（wageCalculator）、自動配置（autoScheduler）等 503件

### 11.3 テスト方針

```
テストピラミッド:
  ┌──────────────┐
  │   E2E テスト  │  ← 未実装（商用版で Playwright 導入予定）
  ├──────────────┤
  │  統合テスト   │  ← サービス層（Supabase モック）
  ├──────────────┤
  │ ユニットテスト │  ← ユーティリティ・ビジネスロジック
  └──────────────┘
```

**モック戦略**: Supabase クライアントを `jest.mock()` でモック化。各テストで独立した `createMockQueryBuilder()` を生成し、テスト間の状態漏洩を防止。

---

## 12. 障害対応・トラブルシューティング

### 12.1 よくある問題と対処

| 症状 | 原因 | 対処 |
|------|------|------|
| リアルタイム更新が来ない | WebSocket接続断 | Supabase ダッシュボードで Realtime ログ確認 |
| ログインできない | レートリミット | 数分待つ、またはサーバー側でリセット |
| 型エラーが大量発生 | `@types` バージョン不整合 | `npm install` で再インストール |
| ビルドが遅い | インクリメンタルビルド無効 | `tsconfig.json` の `incremental: true` 確認 |
| シフトが表示されない | RLS ポリシー不一致 | `store_id` がユーザーと一致しているか確認 |
| 暗号化エラー（Web） | Web環境バイパス | 正常動作（Webでは暗号化非対応） |

### 12.2 ログ確認方法

```bash
# Supabase ログ（ダッシュボード）
# → Database → Logs → postgres / auth

# Edge Function ログ
# → Edge Functions → Logs

# クライアントサイド
# ブラウザ DevTools → Console
# React Native → Metro bundler ログ
```

### 12.3 データベース直接操作

```sql
-- 特定店舗のシフト確認
SELECT * FROM shifts WHERE store_id = 'xxx' ORDER BY date DESC LIMIT 10;

-- RLS ポリシー確認
SELECT * FROM pg_policies WHERE tablename = 'shifts';

-- 監査ログ確認
SELECT * FROM audit_logs WHERE store_id = 'xxx' ORDER BY created_at DESC LIMIT 20;
```

---

## 13. バージョン管理・リリース

### 13.1 セマンティックバージョニング

```
MAJOR.MINOR.PATCH
  │     │     └── バグフィックス・小さな改修
  │     └──────── 新機能追加（後方互換性あり）
  └────────────── 破壊的変更・大きなアップデート
```

### 13.2 リリースコマンド

```bash
npm run release:patch    # 2.0.0 → 2.0.1
npm run release:minor    # 2.0.0 → 2.1.0
npm run release:major    # 2.0.0 → 3.0.0

# 実行内容:
# 1. package.json のバージョン更新
# 2. git add .
# 3. git commit -m "chore: bump version to X.Y.Z"
# 4. git push
# 5. アプリの設定画面に自動反映（AppVersion.ts が package.json を直接参照）
```

### 13.3 ブランチ戦略

```
main ──────────────────────────────────→ 本番
  │
  ├── fix/security-audit-*             セキュリティ修正
  ├── feat/add-tests-*                 テスト追加
  ├── perf/optimization-*              パフォーマンス改善
  ├── cleanup/*                        コード品質改善
  └── feat/*                           新機能開発
```

---

## 14. 依存関係

### 14.1 主要依存関係

| パッケージ | バージョン | 用途 | 更新頻度 |
|-----------|-----------|------|----------|
| `expo` | 54.0.33 | フレームワーク | SDK毎（年2-3回） |
| `react` | 19.1.0 | UI | メジャー毎（年1回） |
| `react-native` | 0.81.5 | クロスプラットフォーム | 四半期毎 |
| `@supabase/supabase-js` | 2.95.3 | バックエンドSDK | 月次 |
| `date-fns` | 4.1.0 | 日付操作 | 安定（低頻度） |
| `crypto-js` | 4.2.0 | 暗号化 | 安定（低頻度） |
| `zod` | 4.3.6 | バリデーション | 月次 |

### 14.2 セキュリティ監査

```bash
# 脆弱性チェック
npm audit

# 修正可能な脆弱性の自動修正
npm audit fix

# 依存関係の更新確認
npx npm-check-updates
```

### 14.3 overrides（脆弱性パッチ）

```json
{
  "overrides": {
    "semver": "^7.7.2",           // CVE対応
    "inflight": "npm:once@^1.4.0", // 非推奨パッケージ置換
    "send": "^0.19.1"             // セキュリティパッチ
  }
}
```

---

---

## 15. 用語集（ドメイン用語）

| 用語 | 英語 | 説明 |
|------|------|------|
| **店舗** | Store | シフト管理の単位。塾の教室1つ = 1店舗。`store_id`で全データが分離される |
| **マスター** | Master | 管理者ロール。シフト承認・スタッフ管理・設定変更・給与確認が可能 |
| **ユーザー** | User | 一般スタッフ（講師）ロール。自分のシフト申請・確認のみ |
| **途中時間** | Class Time / Time Segment | シフト勤務中の区切り（授業・休憩等）。給与計算で除外/カスタムレートが適用される |
| **業務** | Role (Staff Role) | スタッフの担当業務（例: 数学講師、事務）。`staff_roles`テーブル |
| **タスク** | Task (Role Task) | 業務に紐づく具体的な作業（例: 採点、電話対応）。`role_tasks`テーブル |
| **募集シフト** | Recruitment Shift | マスターが作成する「人手が欲しい枠」。QRコード/URLで外部共有し応募を受け付ける |
| **クイックシフトトークン** | Quick Shift Token | 募集シフトへの応募URLに含まれるワンタイムトークン |
| **シフト提出期間** | Submission Period | マスターが設定する「来月のシフト希望を出してください」の募集期間 |
| **途中時間タイプ** | Time Segment Type | 途中時間の種類（休憩・授業等）。マスターが定義。給与計算モード（除外/含む/カスタムレート）を持つ |

---

## 16. ユーザーロールと権限

### 16.1 ロール一覧

| ロール | DB値 | 説明 |
|--------|------|------|
| **マスター** | `master` | 店舗管理者。1店舗に1人。全機能にアクセス可能 |
| **ユーザー** | `user` | 一般スタッフ（講師）。自分のシフトのみ操作可能 |

> **コード上の "teacher" について**: 変更ログ（`shift_change_logs`）の `actor.role` で `teacher` が使われる箇所がある。これは `user` ロールの別名で、DB の `users.role` は常に `master` か `user`。

### 16.2 権限マトリクス

| 機能 | マスター | ユーザー |
|------|:--------:|:--------:|
| シフト閲覧（全スタッフ） | ✅ | ❌（自分のみ） |
| シフト申請（作成） | ✅ | ✅ |
| シフト承認・却下 | ✅ | ❌ |
| シフト削除 | ✅ | ❌（削除申請のみ） |
| スタッフ管理（追加・削除・時給設定） | ✅ | ❌ |
| 店舗設定 | ✅ | ❌ |
| 給与一覧・CSV出力 | ✅ | ❌ |
| ガントチャート（全体） | ✅ | ✅（閲覧のみ） |
| 募集シフト作成 | ✅ | ❌ |
| 募集シフト応募 | ❌ | ✅ |
| 自動配置実行 | ✅ | ❌ |
| Google Calendar連携 | ✅ | ✅（自分のシフトのみ） |

---

## 17. シフトのステータスライフサイクル

### 17.1 ステータス一覧

| ステータス | DB値 | 色 | 編集可 | 説明 |
|-----------|------|-----|:------:|------|
| 下書き | `draft` | #e0e0e0 | ✅ | マスターが直接作成した未公開シフト |
| 申請中 | `pending` | #FFD700 | ✅ | ユーザーが申請し、マスター承認待ち |
| 承認済み | `approved` | #90caf9 | ❌ | マスターが承認した確定シフト |
| 却下 | `rejected` | #ffcdd2 | ✅ | マスターが却下。ユーザーは修正して再申請可能 |
| 削除申請中 | `deletion_requested` | #FFD700 | ❌ | ユーザーが削除を申請し、マスター判断待ち |
| 削除済み | `deleted` | #9e9e9e | ❌ | マスターが削除承認。一覧から非表示 |
| 完了 | `completed` | #4CAF50 | ❌ | 勤務完了（現在は手動切替） |
| 完全非表示 | `purged` | - | ❌ | 完全に非表示。復元不可 |
| 募集中 | `recruitment` | #9e9e9e | ❌ | 募集シフト専用ステータス |

### 17.2 ステータス遷移図

```
                    ┌──── ユーザーが修正して再申請 ────┐
                    │                                  │
                    ▼                                  │
  ┌─────────┐    ┌─────────┐    ┌───────────┐    ┌──────────┐
  │  draft   │───▶│ pending │───▶│ approved  │───▶│completed │
  │ (下書き)  │    │(申請中)  │    │(承認済み)  │    │ (完了)   │
  └─────────┘    └────┬────┘    └─────┬─────┘    └──────────┘
    │マスター          │                │
    │直接承認          ▼                ▼
    │           ┌──────────┐    ┌─────────────────┐
    └──────────▶│ rejected │    │deletion_requested│
                │ (却下)    │    │ (削除申請中)      │
                └──────────┘    └────────┬────────┘
                                         │
                                    マスター判断
                                    ┌────┴────┐
                                    ▼         ▼
                              ┌─────────┐  却下して
                              │ deleted  │  approved
                              │(削除済み) │  に戻す
                              └────┬────┘
                                   │
                                   ▼
                              ┌─────────┐
                              │ purged  │
                              │(完全非表示)│
                              └─────────┘
```

### 17.3 遷移ルール（誰が・いつ）

| 遷移 | 実行者 | トリガー |
|------|--------|---------|
| `draft` → `pending` | ユーザー | シフト申請ボタン |
| `draft` → `approved` | マスター | 直接シフト作成（承認不要） |
| `pending` → `approved` | マスター | 承認ボタン |
| `pending` → `rejected` | マスター | 却下ボタン（理由入力） |
| `rejected` → `pending` | ユーザー | 修正して再申請 |
| `approved` → `deletion_requested` | ユーザー | 削除申請ボタン |
| `approved` → `deleted` | マスター | 直接削除 |
| `approved` → `completed` | マスター | 完了マーク |
| `deletion_requested` → `deleted` | マスター | 削除承認 |
| `deletion_requested` → `approved` | マスター | 削除申請を却下（元に戻す） |
| `deleted` → `purged` | マスター | 完全削除 |

---

## 18. データモデル

### 18.1 テーブル一覧と目的

| テーブル | 目的 | 主キー | 店舗分離 |
|---------|------|--------|:--------:|
| `stores` | 店舗情報（教室）。全データの分離単位 | `store_id` (TEXT) | - |
| `users` | スタッフ情報。認証・ロール・時給 | `uid` (UUID) | ✅ |
| `shifts` | シフトデータ本体。日付・時間・ステータス | `id` (UUID) | ✅ |
| `settings` | 店舗設定（KVS形式）。途中時間タイプ等 | `id` (UUID) | ✅ |
| `shift_change_logs` | シフト変更履歴（監査ログ） | `id` (UUID) | ✅ |
| `recruitment_shifts` | 募集シフト。外部公開して応募を受け付ける | `id` (UUID) | ✅ |
| `quick_shift_tokens` | 募集シフト共有用ワンタイムトークン | `id` (TEXT) | ✅ |
| `shift_submission_periods` | シフト提出募集期間（マスターが設定） | `id` (UUID) | ✅ |
| `shift_submissions` | ユーザーのシフト希望提出データ | `id` (UUID) | ✅ |
| `shift_confirmations` | シフト確定の確認記録 | `id` (TEXT) | ✅ |
| `user_store_access` | マルチ店舗アクセス管理 | `id` (UUID) | - |
| `daily_todos` | 日次TODO（当日タスク管理） | `id` (UUID) | ✅ |
| `todo_templates` | TODOテンプレート（繰り返し用） | `id` (UUID) | ✅ |
| `todo_comments` | TODOへのコメント（スレッド対応） | `id` (UUID) | ✅ |
| `staff_roles` | 業務定義（数学講師、事務等） | `id` (UUID) | ✅ |
| `role_tasks` | 業務に紐づくタスク（採点、電話対応等） | `id` (UUID) | ✅ |
| `user_role_assignments` | ユーザー×業務の配置 | `id` (UUID) | ✅ |
| `user_task_assignments` | ユーザー×タスクの配置 | `id` (UUID) | ✅ |
| `time_segment_types` | 途中時間タイプ定義（休憩・授業等の給与計算モード） | `id` (UUID) | ✅ |
| `reports` | シフト勤務報告（タスク実績・コメント） | `id` (UUID) | ✅ |
| `shift_task_assignments` | 自動配置エンジンの結果（シフト×タスク×ユーザー） | `id` (UUID) | ✅ |

### 18.2 テーブル関係図

```
stores (店舗)
  │
  ├─── users (スタッフ)          ... store_id → stores
  │      │
  │      ├─── shifts (シフト)    ... user_id → users, store_id → stores
  │      │      │
  │      │      └─── shift_change_logs (変更履歴) ... shift_id → shifts
  │      │
  │      └─── user_store_access (マルチ店舗) ... uid → users
  │
  ├─── settings (店舗設定)       ... store_id → stores
  │
  ├─── recruitment_shifts (募集)  ... store_id → stores
  │      │
  │      └─── quick_shift_tokens (共有トークン) ... store_id → stores
  │
  ├─── shift_submission_periods (提出期間) ... store_id → stores
  │      │
  │      └─── shift_submissions (提出データ)   ... period_id → periods
  │
  ├─── staff_roles (業務定義)     ... store_id → stores
  │      │
  │      ├─── role_tasks (タスク)  ... role_id → staff_roles
  │      ├─── user_role_assignments (業務配置) ... role_id → staff_roles
  │      └─── user_task_assignments (タスク配置) ... task_id → role_tasks
  │
  ├─── time_segment_types (途中時間タイプ) ... store_id → stores
  │
  ├─── shift_task_assignments (自動配置結果) ... store_id → stores, shift_id → shifts
  │
  ├─── reports (勤務報告)          ... shift_id → shifts
  │
  └─── daily_todos (日次TODO)     ... store_id → stores
         ├─── todo_comments (コメント) ... todo_id → daily_todos
         └─── todo_templates (テンプレート) ... store_id → stores
```

### 18.3 サービスとテーブルの対応

| サービス | アダプタ | 対象テーブル |
|---------|---------|-------------|
| `auth` | SupabaseAuthAdapter | `auth.users` + `users` |
| `users` | SupabaseUserAdapter | `users` |
| `shifts` | SupabaseShiftAdapter | `shifts` + `shift_change_logs` + `reports` |
| `stores` | SupabaseStoreAdapter | `stores` |
| `settings` | SupabaseSettingsAdapter | `settings` |
| `recruitment` | SupabaseRecruitmentAdapter | `recruitment_shifts` |
| `quickShiftTokens` | SupabaseQuickShiftTokenAdapter | `quick_shift_tokens` |
| `shiftSubmission` | SupabaseShiftSubmissionAdapter | `shift_submission_periods` + `shift_submissions` |
| `shiftConfirmation` | SupabaseShiftConfirmationAdapter | `shift_confirmations` |
| `audit` | SupabaseAuditAdapter | `shift_change_logs` |
| `multiStore` | SupabaseMultiStoreAdapter | `user_store_access` |
| `teacherStatus` | SupabaseTeacherStatusAdapter | `shifts`（勤務状態判定用） |
| `todos` | SupabaseTodoAdapter | `daily_todos` + `todo_templates` + `todo_comments` |

---

## 19. 開発環境セットアップ（初回）

### 19.1 前提条件

- Node.js 18以上
- npm 9以上
- Supabaseアカウント（無料プランで可）
- Git

### 19.2 手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/Higash37/Shiftize-demo.git
cd Shiftize-demo

# 2. 依存パッケージをインストール
npm install

# 3. 環境変数を設定
cp .env.example .env
# .env を開いて以下を設定:
#   EXPO_PUBLIC_SUPABASE_URL — Supabaseダッシュボードの Settings > API > Project URL
#   EXPO_PUBLIC_SUPABASE_ANON_KEY — 同ページの anon public key
```

### 19.3 Supabase プロジェクトの作成

1. [supabase.com](https://supabase.com) にログイン
2. 「New Project」でプロジェクトを作成（リージョン: 東京推奨）
3. 作成完了後、Settings > API から:
   - **Project URL** → `.env` の `EXPO_PUBLIC_SUPABASE_URL` に設定
   - **anon public key** → `.env` の `EXPO_PUBLIC_SUPABASE_ANON_KEY` に設定

### 19.4 データベースのセットアップ

Supabaseダッシュボードの SQL Editor で、以下のマイグレーションファイルを**順番に**実行:

```
supabase/migrations/001_schema_and_rpc.sql    ← テーブル・RLS・RPC関数
supabase/migrations/002_oauth_linking.sql      ← OAuth連携カラム
supabase/migrations/003_google_calendar_sync.sql ← Googleカレンダー同期
supabase/migrations/004_google_calendar_token_rpc.sql ← トークン管理RPC
supabase/migrations/005_daily_todos.sql        ← 日次TODO機能
supabase/migrations/006_staff_roles.sql        ← 業務・タスク・配置
supabase/migrations/007_remaining_tables.sql   ← 途中時間タイプ・レポート・自動配置
```

### 19.5 初期管理者ユーザーの作成

Supabase ダッシュボード > Authentication > Users で:

1. 「Add user」 > 「Create new user」
2. メールアドレスとパスワードを入力
3. SQL Editor で public.users にレコードを追加:

```sql
INSERT INTO public.users (uid, nickname, email, role, store_id, color, hourly_wage, is_active)
VALUES (
  'ここにAuth UsersのUID',  -- AuthenticationタブからコピーExact
  'あなたの名前',
  'メールアドレス',
  'master',                  -- 管理者ロール
  '001',                     -- 任意の店舗ID
  '#4A90E2',
  1000,
  true
);
```

4. 店舗レコードも作成:

```sql
INSERT INTO stores (store_id, store_name, admin_uid, is_active)
VALUES ('001', 'テスト教室', 'ここに同じUID', true);
```

### 19.6 起動確認

```bash
# Web版で起動
npm run web

# ブラウザで http://localhost:8081 を開く
# 先ほど作成したメール/パスワードでログイン
# ガントチャート画面が表示されれば成功
```

### 19.7 品質チェック

```bash
npx tsc --noEmit     # TypeScript型チェック — 0エラーであること
npx jest             # テスト — 150件全パスであること
npm run lint         # ESLint — 0エラー0警告であること
```

---

> **本ドキュメントの更新**: アーキテクチャの変更、新機能追加、セキュリティ修正時に更新すること。
