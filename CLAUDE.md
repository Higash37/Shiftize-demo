# Claude 開発ドキュメント

Shiftize プロジェクトでの AI 開発エージェント用の指示書。

---

## 開発方針

- **Supabase 最適化**: 現行システムのパフォーマンス向上を重視
- **機能拡張**: ユーザビリティとパフォーマンスの継続改善
- **セキュリティ**: 既存のセキュリティ機能の維持・強化
- **コード品質**: TypeScript strict モード遵守、any 型禁止

---

## プロジェクト概要

エンタープライズ級シフト管理アプリ。React Native (Expo) + Supabase。

### 技術スタック

```
React 19 + React Native 0.81 + Expo 54 + Expo Router 6
TypeScript 5.9 (strict: true, 全13オプション有効)
Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
Zod 4.3 (バリデーション) + CryptoJS (AES-256 暗号化)
Jest + jest-expo/web (テスト)
```

### 主要機能

- シフト管理（CRUD + 承認フロー + ガントチャート表示）
- 業務・タスク自動配置エンジン（均等分散アルゴリズム）
- 給与計算（途中時間除外 / カスタムレート / 日跨ぎ対応）
- 募集シフト（QRコード / URL トークン共有）
- Google Calendar 同期（OAuth + Edge Function）
- リアルタイム同期（Supabase Realtime + 300ms デバウンス）
- GDPR 準拠（AES-256暗号化 + 監査ログ7年保存 + データ削除）

---

## アーキテクチャ要点

### Service Locator パターン

```
ServiceProvider（シングルトン、13サービス）
  ├─ .auth    → SupabaseAuthAdapter
  ├─ .users   → SupabaseUserAdapter
  ├─ .shifts  → SupabaseShiftAdapter（Realtime 含む）
  └─ ... 全13サービス（interfaces/ で型定義）
```

- **コンポーネントから Supabase を直接呼ばない**。必ず `ServiceProvider` 経由。
- Adapter 層で `snake_case` (DB) ↔ `camelCase` (TS) 変換。
- テスト時は `ServiceProvider.setXxxService(mockAdapter)` でモック差し替え。

### ディレクトリ構成

```
src/
├── app/          # Expo Router ルーティング
├── common/       # 共有（constants, context, models, ui, utils）
├── modules/      # 機能モジュール（home, master, login, user, reusable-widgets）
└── services/     # サービス層（interfaces/ + supabase/ + auth/）
```

### パスエイリアス（tsconfig.json）

```
@/*          → ./src/*
@components/ → src/common/common-ui/*
@utils/      → src/common/common-utils/*
@types/      → src/common/common-models/*
@services/   → ./src/services/*
@features/   → ./src/modules/*
```

---

## コマンド

```bash
# 開発
npm run dev              # Expo 開発サーバー
npm run web              # Web版

# 品質チェック（PR前に必ず実行）
npx tsc --noEmit         # TypeScript型チェック
npx jest                 # テスト実行（150+件）
npm run lint             # ESLint（警告0必須）
npm audit                # セキュリティ監査

# ビルド
npm run build            # Web ビルド
npm run vercel-build     # Vercel 向けビルド

# リリース
npm run release:patch    # パッチ (x.y.Z)
npm run release:minor    # マイナー (x.Y.0)
npm run release:major    # メジャー (X.0.0)

# バンドル分析
npm run analyze:bundle
```

---

## セキュリティ

### 実装済み対策

| 対策 | 実装箇所 |
|------|----------|
| AES-256-CBC 暗号化 | `common-utils/security/encryptionUtils.ts` |
| RLS（店舗ID分離） | 全テーブルの PostgreSQL ポリシー |
| タイミング攻撃対策 | `safeStringCompare()` (securityUtils.ts) |
| Realtimeインジェクション防止 | `validateStoreId()` (SupabaseShiftAdapter.ts) |
| 管理者store_idクロスチェック | `secureDeleteUserByAdmin()` (SupabaseUserAdapter.ts) |
| CSRF対策 | CSRFTokenManager |
| レートリミッター | RateLimiter（ブルートフォース防止） |
| 入力検証 | Zod スキーマ + XSS サニタイズ |
| 監査ログ | SupabaseAuditAdapter（7年保存） |

### 守るべきルール

- `SUPABASE_SERVICE_ROLE_KEY` 等のシークレットはクライアントに置かない
- `EXPO_PUBLIC_` は公開していい値のみ（ANON_KEY は OK）
- RLS ポリシーに `USING(true)` は使用禁止。必ず `store_id` チェック
- パスワード比較は `===` ではなく `safeStringCompare()` を使う
- Realtime フィルタに動的値を入れる前に `validateStoreId()` で検証

---

## パフォーマンス指針

| 手法 | 適用箇所 |
|------|----------|
| `React.memo` / `useMemo` / `useCallback` | ガントチャート全コンポーネント |
| `FlatList` 仮想スクロール | スタッフ行、シフト一覧 |
| `React.lazy` + `Suspense` | モーダル、タブ |
| 必要列のみ SELECT | `SHIFT_ITEM_COLUMNS` (select("*") 禁止) |
| `Map` O(1) ルックアップ | ユーザー検索、割り当て検索 |
| Realtime 300ms デバウンス | `REALTIME_DEBOUNCE_MS` |
| `clearTimeout` クリーンアップ | useEffect の return で必ず実行 |

### 禁止パターン

- `Array.find()` をループ内で使う（O(n²)）→ `Map` を使う
- `select("*")` → 必要列を明示する
- `new Date()` をループ内で生成 → 文字列操作で代替
- `setTimeout` を return でクリーンアップしない → メモリリーク

---

## テスト

### テスト構成（150件、2026-03-13 時点）

| テスト対象 | 件数 |
|-----------|------|
| SupabaseShiftAdapter | 30 |
| SupabaseUserAdapter | 27 |
| SupabaseQuickShiftTokenAdapter | 27 |
| ServiceProvider | 43 |
| shiftStatusUtils | 14 |
| ganttTimeUtils | 9 |

### テスト方針

- **Supabase モック**: `jest.mock("./supabase-client")` + `createMockQueryBuilder()`
- **各テスト独立**: `beforeEach` で `jest.clearAllMocks()`
- **テスト命名**: 日本語で `正常系: ...` / `異常系: ...` / `エッジケース: ...`

```bash
# 全テスト
npx jest

# 特定ファイル
npx jest src/services/supabase/SupabaseShiftAdapter.test.ts

# ウォッチモード
npx jest --watch
```

---

## バージョン管理

- `package.json` の version を直接読み込み（`AppVersion.ts`）
- セマンティックバージョニング: `MAJOR.MINOR.PATCH`
- `npm run release:*` でバージョン更新 + コミット + プッシュを一括実行

---

## コミット規約

```
feat: 新機能追加
fix: バグ修正
perf: パフォーマンス改善
refactor: リファクタリング
test: テスト追加・修正
docs: ドキュメント
chore: 雑務（依存更新、設定変更）
```

ブランチ: `feat/`, `fix/`, `refactor/`, `perf/`, `test/`, `chore/`, `cleanup/`

---

## 開発履歴

### Phase 1: セキュリティ強化 (2025-01-27)

- AES-256 暗号化、GDPR 準拠、RLS 全面見直し、XSS/CSRF 対策、監査ログ

### Phase 2: アーキテクチャ決定 (2025-01-30)

- Firebase → Supabase 全面移行完了

### Phase 3: UI/UX 改善 (2025-08-01)

- 分割レイアウト、時間範囲切り替え、列詰めロジック、空白タップでシフト追加

### Phase 4: パフォーマンス最適化 (2025-01-27)

- コード分割、メモ化、API キャッシュ、FlatList 最適化、Service Worker 改善

### Phase 5: 機能拡張 (2025-12)

- 業務・タスク自動配置エンジン、当日スケジュール画面

### Phase 6: 品質監査・修正 (2026-03-13)

- セキュリティ CRITICAL/HIGH 7件修正（RLS, タイミング攻撃, Realtime注入防止等）
- パフォーマンス 5件修正（O(n²)→O(1), メモリリーク, select最適化）
- テスト 150件追加（サービス層・ビジネスロジック）
- リファクタ（重複削除-122行, マジックナンバー定数化）
- JSDoc コメント追加（SupabaseShiftSubmissionAdapter）

---

## 関連ドキュメント

| ファイル | 内容 |
|---------|------|
| [CODING_STANDARDS.md](CODING_STANDARDS.md) | コーディング規約 |
| [docs/OPERATIONS_GUIDE.md](docs/OPERATIONS_GUIDE.md) | 運用・保守ガイド（複雑ロジック解説含む） |
