# リファクタリング記録

## 概要

パフォーマンス最適化・バグ修正を中心としたリファクタリング作業の記録。

---

## 1. Auth統合 (50サブスクリプション → 1)

### 問題
- `useAuth` フックが49箇所のコンポーネントから呼び出され、各呼び出しが独立した Supabase `onAuthStateChange` サブスクリプションを作成していた
- 認証状態変更のたびに50回の `getUserFullProfile` API呼び出し
- 各コンポーネントで4回の連続setState → 大量の再レンダリング

### 対応
- `AuthContext.tsx` に全ロジックを統合（useReducer でバッチ更新）
- `useAuth.ts` を再エクスポートモジュールに変更（49箇所のimport変更不要）
- `authToken.ts` に `getAuthToken` を分離

### 変更ファイル
| ファイル | 変更内容 |
|---------|---------|
| `src/services/auth/AuthContext.tsx` | 全面書き換え - useReducer化、signIn/signOut統合 |
| `src/services/auth/useAuth.ts` | 再エクスポートに置換 |
| `src/services/auth/authToken.ts` | 新規作成 - getAuthToken分離 |

### 効果
| 指標 | Before | After |
|------|--------|-------|
| Supabaseサブスクリプション数 | 50 | 1 |
| 認証変更時のAPI呼び出し | 50 | 1 |
| 認証変更時の再レンダリング | 4回×50コンポーネント | 1回 |

---

## 2. ログインリダイレクト修正

### 問題
- ログイン後に画面が表示されず、リロードが必要だった
- 原因: `signIn()` の AUTH_SUCCESS dispatch と `onAuthStateChange` ハンドラーの競合
- ハンドラーの `getUserFullProfile()` が失敗すると signOut → AUTH_ERROR で signIn の結果を上書き

### 対応
- `manualAuthInProgress` useRef フラグを追加
- `signIn()` / `signOut()` 処理中は `onAuthStateChange` ハンドラーをスキップ
- ただし `INITIAL_SESSION`（ページリロード時）は常に処理

### 変更ファイル
| ファイル | 変更内容 |
|---------|---------|
| `src/services/auth/AuthContext.tsx` | manualAuthInProgress ref追加、signIn/signOut/ハンドラー修正 |

### 現状
- **未解決**: ログイン後の遷移がまだ正常に動作しない場合がある

---

## 3. Supabase Realtimeチャンネル修正

### 問題
- チャンネル名の衝突（ページ遷移時に同名チャンネルが再作成される）
- `removeChannel` 呼び出し時に `AbortError: signal is aborted without reason`

### 対応

#### 3a. チャンネル名の一意性
- モジュールレベルの `channelCounter` を追加
- `shifts-${storeId}` → `shifts-${storeId}-${++channelCounter}`
- `shifts-month-${storeId}-${year}-${month}` → `shifts-month-${storeId}-${year}-${month}-${++channelCounter}`

#### 3b. AbortError対策
- `aborted` フラグを追加（クリーンアップ後のコールバック防止）
- `removeChannel` に `.catch(() => {})` を追加

### 変更ファイル
| ファイル | 変更内容 |
|---------|---------|
| `src/services/supabase/SupabaseShiftAdapter.ts` | channelCounter追加、abortedフラグ追加、removeChannel .catch追加 |

---

## 4. パフォーマンス最適化

### 4a. 重複Auth IIFE削除
- `SupabaseAuthAdapter.ts` のモジュールロード時IIFE（`onAuthStateChange` + `getSession()`）を削除
- `getCurrentUser()` を deprecated化 → `useAuth()` フックに置換

| ファイル | 変更内容 |
|---------|---------|
| `src/services/supabase/SupabaseAuthAdapter.ts` | IIFE削除、getCurrentUser deprecated |
| `src/modules/reusable-widgets/account-linking/AccountLinkingSection.tsx` | getCurrentUser → useAuth に置換 |

### 4b. getUserFullProfile最適化
- `select("*")` → 必要カラムのみ指定

| ファイル | 変更内容 |
|---------|---------|
| `src/services/supabase/SupabaseUserAdapter.ts` | select句を最適化 |

### 4c. Realtimeデバウンス追加
- `onShiftsChanged` / `onShiftsByMonth` のリアルタイムコールバックに300msデバウンス
- 初回フェッチはデバウンスなし（即座に実行）

| ファイル | 変更内容 |
|---------|---------|
| `src/services/supabase/SupabaseShiftAdapter.ts` | debounceTimer追加 |

### 4d. Authプロフィールキャッシュ
- `TOKEN_REFRESHED` イベント時にキャッシュ済みプロフィールを使用（DBクエリ回避）

| ファイル | 変更内容 |
|---------|---------|
| `src/services/auth/AuthContext.tsx` | cachedProfile ref追加 |

### 4e. ShiftListView 2重fetch削除
- `ShiftListView.tsx` の初回マウント時 `useEffect(() => { fetchShifts() }, [])` を削除
- `useShift` フック内の `useEffect` が `fetchShifts` 依存配列変更時に自動実行するため重複
- navigationフォーカスリスナー（画面復帰時の更新）は維持

| ファイル | 変更内容 |
|---------|---------|
| `src/modules/user-view/user-shift-forms/user-shift-list/ShiftListView.tsx` | 重複する初回fetch useEffect削除 |

---

## 5. useShiftsByMonth フック作成

### 問題
- `this-month` / `next-month` ページが `useShiftsRealtime` で全件取得 → ローカルで月フィルタ
- 不要なデータ転送・処理

### 対応
- `useShiftsByMonth` フックを新規作成（月別購読専用）
- `onShiftsByMonth` で月の範囲のみサーバーサイドでフィルタ
- 月変更時はサブスクリプション切り替え

### 変更ファイル
| ファイル | 変更内容 |
|---------|---------|
| `src/common/common-utils/util-shift/useShiftsRealtime.ts` | useShiftsByMonth フック追加 |
| `src/app/(main)/master/shifts/this-month.tsx` | useShiftsRealtime → useShiftsByMonth |
| `src/app/(main)/master/shifts/next-month.tsx` | useShiftsRealtime → useShiftsByMonth |
| `src/modules/master-view/master-shift-list/MasterShiftListView.tsx` | useShiftsRealtime → useShiftsByMonth |

---

## 6. その他の修正

### router.push → router.replace
- Expo Router の Stack 画面蓄積を防止
- フッターナビゲーション全箇所で `router.replace` を使用

### Text node エラー修正
- React Native の `Text` コンポーネント外に直接テキストがある箇所を修正

---

## 7. Auth状態伝播フロー修正（ログイン遷移 + シフト消失）

### 問題
- ログイン成功後に画面が表示されない（遷移で止まる）場合がある
- ページ遷移後にシフトが表示されない場合がある
- **根本原因**: 両方とも同一のレースコンディション

### 原因分析
1. `signIn()` が `manualAuthInProgress` フラグを1秒の `setTimeout` で解除していた
2. フラグ解除後に `onAuthStateChange` ハンドラが処理され、`getUserFullProfile()` が失敗すると `signOut()` → `AUTH_ERROR` でログイン成功状態を上書き
3. `(main)/_layout.tsx` 等の `if (!user) return null` で一瞬の `user=null` が子コンポーネント全アンマウントを引き起こし、シフトデータが消失

### 対応

#### 7a. AuthContext.tsx — onAuthStateChangeハンドラ安全化
- `setTimeout` による `manualAuthInProgress` フラグ解除を**廃止** → 即時解除に変更
- `signIn()` 内でプロフィールを `cachedProfile` にも保存（フラグ解除後の `onAuthStateChange` がDB再クエリなしでキャッシュを使用）
- `getUserFullProfile` 失敗時 / ユーザー情報未検出時: キャッシュがあれば `signOut` せずキャッシュを維持

#### 7b. レイアウト堅牢化 — return null による全アンマウント防止
- `(main)/_layout.tsx` / `master/_layout.tsx` / `user/_layout.tsx` に `wasAuthenticated` / `wasAuthorized` useRef を追加
- 一度認証/認可された後は、`user` が一瞬 `null` になっても子コンポーネントをアンマウントしない
- `loading` 中のみ `return null`（初回ロード時）

### 変更ファイル
| ファイル | 変更内容 |
|---------|---------|
| `src/services/auth/AuthContext.tsx` | setTimeout廃止、signInでキャッシュ保存、onAuthStateChangeのフォールバック強化 |
| `src/app/(main)/_layout.tsx` | wasAuthenticated ref追加、loading分離 |
| `src/app/(main)/master/_layout.tsx` | wasAuthorized ref追加、loading分離 |
| `src/app/(main)/user/_layout.tsx` | wasAuthorized ref追加、loading分離 |

### 効果
| 指標 | Before | After |
|------|--------|-------|
| signIn後のonAuthStateChange競合 | setTimeout 1秒後にハンドラ再処理→signOut可能性 | キャッシュで安全にフォールバック |
| DB障害時のログアウト | getUserFullProfile失敗→即signOut | キャッシュ維持→セッション継続 |
| Auth状態の一瞬のnull化 | 子コンポーネント全アンマウント→シフト消失 | wasAuthenticated refで保持 |

---

## 変更ファイル全一覧

| ファイル | 関連セクション |
|---------|--------------|
| `src/services/auth/AuthContext.tsx` | 1, 2, 4d, 7a |
| `src/services/auth/useAuth.ts` | 1 |
| `src/services/auth/authToken.ts` | 1 (新規) |
| `src/services/supabase/SupabaseShiftAdapter.ts` | 3, 4c |
| `src/services/supabase/SupabaseAuthAdapter.ts` | 4a |
| `src/services/supabase/SupabaseUserAdapter.ts` | 4b |
| `src/common/common-utils/util-shift/useShiftsRealtime.ts` | 5 |
| `src/app/(main)/master/shifts/this-month.tsx` | 5 |
| `src/app/(main)/master/shifts/next-month.tsx` | 5 |
| `src/modules/master-view/master-shift-list/MasterShiftListView.tsx` | 5 |
| `src/modules/reusable-widgets/account-linking/AccountLinkingSection.tsx` | 4a |
| `src/common/common-ui/ui-layout/MasterFooter.tsx` | 6 |
| `src/app/(main)/_layout.tsx` | 7b |
| `src/app/(main)/master/_layout.tsx` | 7b |
| `src/app/(main)/user/_layout.tsx` | 7b |
| `src/modules/user-view/user-shift-forms/user-shift-list/ShiftListView.tsx` | 4e |
