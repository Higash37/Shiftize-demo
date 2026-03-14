# Claude 開発ログ

Shiftize デモ版の開発において Claude Code（AI開発エージェント）と実施した主要な作業の記録。

> **目的**: 何を・なぜ・どう実装したかの意思決定を残し、商用版の開発で参照できるようにする。
> **期間**: 2025年1月 〜 2026年3月

---

## セッション一覧

### Session 1: セキュリティ強化 + GDPR準拠（2025-01-27）

**背景**: Firebase → Supabase 移行後、セキュリティの全面見直しが必要だった。

**実施内容**:
- AES-256-CBC 暗号化の実装（`encryptionUtils.ts`）
- RLS ポリシーの全テーブル適用（`store_id` ベースのデータ分離）
- XSS サニタイズ（`inputValidation.ts`）
- CSRF トークン管理（`CSRFTokenManager`）
- レートリミッター（ブルートフォース防止）
- タイミング攻撃対策（`safeStringCompare()`）
- 監査ログ（`SupabaseAuditAdapter`、7年保存）
- GDPR 準拠（データ削除、同意管理）

**設計判断**:
- Web 環境では `expo-crypto` が使えないため、CryptoJS にフォールバック
- RLS は `USING(true)` を禁止し、必ず `store_id` チェックを入れるルールを策定
- 暗号化キーは環境変数ではなくアプリ内定数（デモ版の制約、商用版で改善予定）

---

### Session 2: アーキテクチャ確定 — Service Locator パターン（2025-01-30）

**背景**: Firebase から Supabase への完全移行に伴い、サービス層の設計を確定させた。

**実施内容**:
- `ServiceProvider` シングルトンの設計（13サービス）
- Interface → Adapter パターンの確立
- `snake_case`（DB）↔ `camelCase`（TS）の自動変換層
- テスト時の `ServiceProvider.setXxxService(mock)` パターン

**設計判断**:
- DI（Dependency Injection）ではなく Service Locator を採用
  - 理由: React の Context API と DI は相性が悪く、Service Locator の方がシンプル
  - React Context はUI状態管理に使い、サービス層は ServiceProvider で管理
- コンポーネントから Supabase を直接呼ばないルールを策定
  - 例外: `useStaffTasks.ts` 等の管理系フックは直接呼び出し（商用版で改善予定）

---

### Session 3: UI/UX 改善 — ガントチャート強化（2025-08-01）

**背景**: 実運用（塾での8ヶ月使用）からのフィードバックを反映。

**実施内容**:
- 分割レイアウト（タブレット: カレンダー + ガントチャート同時表示）
- 時間範囲切り替え（全日 / 午前 / 午後 / カスタム）
- 列詰めロジック（空きスペースを最小化）
- 空白セルタップでシフト追加
- MobileVerticalView（スマホ向け縦型表示）
- Google Calendar 風表示モード

**設計判断**:
- ガントチャートは `React.memo` + `useMemo` で徹底メモ化
- FlatList の仮想スクロールでスタッフ行を表示（100人規模対応）
- `useWindowDimensions` で PC / タブレット / モバイルを自動判定

---

### Session 4: パフォーマンス最適化（2025-01-27）

**実施内容**:
- コード分割（`React.lazy` + `Suspense`）
- API キャッシュ（Supabase クエリ結果のメモ化）
- `select("*")` → 必要列のみ（`SHIFT_ITEM_COLUMNS`）
- O(n²) の `.find()` ループ → `Map` O(1) ルックアップ
- Realtime デバウンス（300ms）
- Service Worker 改善（オフライン対応）

**設計判断**:
- `REALTIME_DEBOUNCE_MS = 300` に設定（短すぎるとチャタリング、長すぎると反応が悪い）
- `new Date()` をループ内で生成しない → 文字列操作で代替（CLAUDE.md ルール化）

---

### Session 5: 業務・タスク自動配置エンジン（2025-12）

**背景**: マスターが手動でスタッフにタスクを割り当てる手間を自動化したい。

**実施内容**:
- `staff_roles` / `role_tasks` テーブル設計
- スケジュール設定（曜日・時間帯・分数・必要人数）
- `autoScheduler.ts`（純粋関数）の実装
- 均等分散アルゴリズム（割り当て回数が少ない人を優先）
- プレビューモーダル（提案 → 確認 → 適用）
- ガントチャートのタスク行に結果表示（破線ボーダーで区別）

**設計判断**:
- 自動配置は純粋関数（`computeAutoSchedule`）として実装し、テスト容易性を確保
- DB に保存するのは結果のみ（`shift_task_assignments`）。ロジックはクライアント側
- 候補が同数の場合は `Math.random()` でランダム選択（商用版で改善予定: 決定的アルゴリズム）

---

### Session 6: 品質監査 + 修正（2026-03-13）

**背景**: 商用化前にデモ版の品質を確保するための総合監査。5つの専門エージェントを並列実行。

**実施内容**:

#### セキュリティ修正（7件）
- RLS `USING(true)` → `store_id` ポリシーに変更（`005_daily_todos.sql`）
- タイミング攻撃対策: `===` → `safeStringCompare()`
- Realtime フィルタインジェクション防止: `validateStoreId()` 追加
- 管理者削除時の `store_id` クロスチェック
- 管理者セッション復元後のエラーチェック
- メール正規表現の強化
- CSRF トークン制限コメント追記

#### パフォーマンス修正（5件）
- `PayrollDetailModal`: O(n²) → Map O(1)
- `PayrollDetailModal`: ループ内 Date 生成 → 文字列操作
- `GanttChartBody`: setTimeout 未クリーンアップ → clearTimeout
- `SupabaseShiftAdapter`: `select("*")` → `SHIFT_ITEM_COLUMNS`
- `GanttChartMonthView`: インライン関数 → useCallback/useMemo

#### リファクタ（-122行）
- `SupabaseAuditAdapter` の重複3関数を統一
- `zodValidation` の未使用関数削除
- マジックナンバー定数化

#### テスト（150件追加）
- SupabaseShiftAdapter: 30テスト
- SupabaseUserAdapter: 27テスト
- SupabaseQuickShiftTokenAdapter: 27テスト
- ServiceProvider: 43テスト
- shiftStatusUtils: 14テスト
- ganttTimeUtils: 9テスト

---

### Session 7: 変更通知バッジ + Undo/Redo + UI改善（2026-03-13 〜 03-14）

**実施内容**:
- `PendingShiftBadgeContext`: 講師の変更をマスターに通知するバッジシステム
- `shift_change_logs` テーブルから teacher の変更を検出
- 既読状態は localStorage に永続化（60秒ポーリング）
- シフト編集モーダルに Undo/Redo 機能追加
- 削除申請中（`deletion_requested`）のUI表示改善
- モーダル常時マウント化（表示高速化）

**設計判断**:
- 既読状態を localStorage に保存（DB テーブルを増やさない方針）
- ポーリング間隔 60 秒（Realtime subscription の代わり、シンプルさ優先）

---

### Session 8: デモ版最終クリーンアップ（2026-03-14）

**背景**: 商用版フォーク前の最終仕上げ。

**実施内容**:

#### ESLint 修復
- ESLint v10 → v9 ダウングレード（プラグイン互換性修復）
- 587 エラー → 0（ルール調整 + 90ファイルの未使用コード除去）

#### 未使用コード除去
- 3 エージェント並列で 90 ファイルから未使用 import/変数/関数を除去
- -204 行のデッドコード削除

#### ファイル整理
- `render.yaml` 削除（Render.com → Vercel 移行済み残骸）
- `.claude/settings.local.json` を git 追跡から除外
- npm audit fix（undici 脆弱性 3 件解消）

#### ブランチ掃除
- ローカル 62 本 + リモート 102 本 → main のみ

#### ドキュメント追加
- `.env.example` 新規作成
- OPERATIONS_GUIDE に 5 セクション追加:
  - 用語集（10 用語）
  - ロール・権限マトリクス
  - シフトステータス遷移図（9 ステータス）
  - データモデル（23 テーブル、関係図、サービス対応表）
  - 開発環境セットアップ手順

#### マイグレーション補完
- `006_staff_roles.sql`（業務・タスク・配置 + RLS）
- `007_remaining_tables.sql`（途中時間タイプ・レポート・自動配置 + RLS）

---

### Session 9: Copilotレビュー級の全方位コードレビュー（2026-03-14）

**背景**: 商用版に持ち越す課題を正確に把握するため、3つの専門レビューエージェントを並列実行。

**発見した課題**（商用版で対応）:

| カテゴリ | 件数 | 主要な問題 |
|---------|------|-----------|
| セキュリティ | MEDIUM 3 | RLS `FOR ALL` でユーザーが master 操作可能、Realtime 未検証 |
| エラーハンドリング | HIGH 2 + MEDIUM 3 | TodoAdapter 7メソッド、fetchShiftById でエラー無視 |
| ロジックバグ | MEDIUM 3 | 日跨ぎシフト計算バグ、TOCTOU 競合 |
| パフォーマンス | CRITICAL 1 + HIGH 4 | `select("*")` 30箇所、`.find()` O(n²) |
| 型安全 | MEDIUM 2 | `as any` 6箇所、`any` 48箇所 |

---

### Session 10: 商用版移行計画策定（2026-03-14）

**実施内容**:
- `docs/COMMERCIAL_PLAN.md` 作成（667行）
- デモ版 vs 商用版の比較表
- オンボーディング導線設計（登録 → 企業作成 → 招待）
- 3ロール階層: Owner / Manager / Staff（権限マトリクス 24項目）
- 料金モデル: Free（¥0, 20人/1支店）/ Pro（¥1,980/月）
- Stripe 連携フロー（Checkout → Webhook → プラン更新）
- プラットフォーム戦略: Web + Android + iOS 同時ローンチ（通知が核心機能のため）
- 通知アーキテクチャ: Expo Push + Database Webhook + `push_tokens` テーブル
- 4 フェーズ開発計画（夏ローンチ目標）

---

## 技術的な意思決定の記録

| 決定事項 | 採用した案 | 却下した案 | 理由 |
|---------|-----------|-----------|------|
| サービス層パターン | Service Locator | DI / Context API | React との親和性、シンプルさ |
| 状態管理 | React Context | Redux / Zustand | 十分な規模、外部依存を増やさない |
| DB | Supabase (PostgreSQL) | Firebase Firestore | RLS、SQL、リアルタイムの統合 |
| 認証 | Supabase Auth | Firebase Auth | DB と同一プロバイダーで統一 |
| 暗号化 | CryptoJS (AES-256) | Web Crypto API | React Native 互換性 |
| バリデーション | Zod | Yup / joi | TypeScript 型推論との統合 |
| テスト | Jest + jest-expo | Vitest | Expo 公式サポート |
| デプロイ (Web) | Vercel | Render / Netlify | Expo Web との相性、無料枠 |
| 課金 | Stripe | PAY.JP / Square | グローバル対応、ドキュメント充実 |
| 通知 | Expo Push Notifications | FCM / APNs 直接 | iOS/Android 統一 API |
| プラットフォーム | 3プラットフォーム同時 | Web+PWA 先行 | 通知が核心機能、PWA では不十分 |

---

## 原本データの場所

生の会話ログ（JSONL 形式）は以下に保存されている:

```
C:\Users\higas_38udawz\.claude\projects\C--git-Shiftize-demo\
├── 519ccd02-*.jsonl   (123MB, Session 6-10: 品質監査〜商用版計画)
├── c77e8aea-*.jsonl   (2.3MB, Session 1-5: 初期開発)
└── その他 4 ファイル   (小規模セッション)
```

> **注意**: JSONL ファイルは機械可読形式（1行1メッセージの JSON）。人が読む場合はこのドキュメントを参照。
