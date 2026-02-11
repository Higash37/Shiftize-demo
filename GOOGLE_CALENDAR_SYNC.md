# Google Calendar 同期機能

## 概要
承認済みシフトをGoogle Calendarに自動同期する機能。シフト→Calendarの一方向同期。

## アーキテクチャ

```
シフトCRUD操作 (SupabaseShiftAdapter)
  → fire-and-forget で GoogleCalendarSyncService.syncShiftToCalendar() 呼び出し
    → GoogleCalendarTokenManager で access_token 取得 (RPC経由でRLSバイパス)
      → 期限切れなら Edge Function (refresh-google-token) でリフレッシュ
    → GoogleCalendarClient で Google Calendar REST API 呼び出し
    → shifts テーブルの google_calendar_event_id を更新
```

## 同期ロジック
| シフト状態 | event_id | アクション |
|-----------|----------|-----------|
| approved | なし | CREATE event |
| approved | あり | UPDATE event |
| approved以外 | あり | DELETE event |
| approved以外 | なし | 何もしない |

## ファイル構成

### 新規ファイル
| ファイル | 役割 |
|---------|------|
| `supabase/migrations/003_google_calendar_sync.sql` | `user_google_tokens`テーブル + RLS + `shifts.google_calendar_event_id`列 |
| `supabase/migrations/004_google_calendar_token_rpc.sql` | `get_google_tokens_for_user` RPC関数 (SECURITY DEFINER) |
| `supabase/functions/refresh-google-token/index.ts` | トークンリフレッシュ Edge Function |
| `src/services/interfaces/IGoogleCalendarService.ts` | サービスインターフェース |
| `src/services/google-calendar/GoogleCalendarTypes.ts` | 型定義 |
| `src/services/google-calendar/GoogleCalendarClient.ts` | Google Calendar REST APIクライアント |
| `src/services/google-calendar/GoogleCalendarTokenManager.ts` | トークン管理 (取得・保存・リフレッシュ) |
| `src/services/google-calendar/GoogleCalendarSyncService.ts` | 同期サービス本体 |
| `src/modules/reusable-widgets/calendar-sync/CalendarSyncToggle.tsx` | 設定画面のトグルUI |

### 変更ファイル
| ファイル | 変更内容 |
|---------|---------|
| `src/common/common-models/model-shift/shiftTypes.ts` | `Shift`/`ShiftItem`に`googleCalendarEventId?`追加 |
| `src/services/interfaces/IAuthService.ts` | `linkGoogleWithCalendarScope()`追加 |
| `src/services/supabase/SupabaseAuthAdapter.ts` | `linkGoogleWithCalendarScope()`実装 (`signInWithOAuth` + calendarスコープ) |
| `src/services/firebase/FirebaseAuthAdapter.ts` | スタブ追加 |
| `src/services/ServiceProvider.ts` | `_googleCalendar`スロット追加 |
| `src/services/initializeServices.ts` | `GoogleCalendarSyncService`登録 |
| `src/services/auth/useAuth.ts` | OAuth後に`provider_token`/`provider_refresh_token`をDB保存 |
| `src/services/supabase/SupabaseShiftAdapter.ts` | `addShift`/`updateShift`/`markShiftAsDeleted`/`approveShiftChanges`に同期フック |
| `src/app/(main)/user/settings.tsx` | `CalendarSyncToggle`追加 |
| `src/modules/reusable-widgets/account-linking/AccountLinkingSection.tsx` | Google解除時に`clearCalendarData()`呼び出し |

## 開発中に解決した問題

### 1. linkIdentity でセッション消失
- **問題**: `supabase.auth.linkIdentity`で既にリンク済みのGoogleに再認証すると、セッションが破壊されログイン画面に戻る
- **解決**: `signInWithOAuth`に変更。既にGoogleがリンク済みなら同じユーザーとしてサインインし直される

### 2. provider_token の取得タイミング
- **問題**: `provider_token`は`USER_UPDATED`イベントでは取得できない場合がある
- **解決**: `onAuthStateChange`の全イベント（`SIGNED_IN`/`INITIAL_SESSION`含む）で`provider_token`を検出・保存するように変更

### 3. RLSによるトークン取得失敗
- **問題**: masterユーザーがシフト承認時、シフト所有者のトークンをRLS制限で読めない
- **解決**: `get_google_tokens_for_user` SECURITY DEFINER RPC関数を作成し、認証済みユーザーなら他ユーザーのトークンを取得可能に

### 4. Google OAuth localhostエラー
- **問題**: Google OAuthページで「localhostでは処理できない」エラー
- **解決**: Google Cloud Console → OAuth クライアント → 承認済みJS生成元に`http://localhost`と`http://localhost:8081`を追加

## 環境変数・外部設定

### Google Cloud Console
- Calendar API を有効化
- OAuth同意画面にスコープ`https://www.googleapis.com/auth/calendar`を追加
- OAuthクライアントの承認済みJS生成元にlocalhostを追加（開発時）

### Supabase Edge Function 環境変数
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### デプロイ
```bash
supabase functions deploy refresh-google-token
```

## デバッグ用ログ
全デバッグログ（`[Auth]`, `[GCal]`, `[GCal Sync]` prefix）は削除済み。
