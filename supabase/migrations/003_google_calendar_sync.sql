-- Google Calendar同期用テーブル: OAuthトークン保存
CREATE TABLE IF NOT EXISTS user_google_tokens (
  uid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  calendar_sync_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS有効化: 自分のトークンのみアクセス可能
ALTER TABLE user_google_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tokens"
  ON user_google_tokens FOR SELECT
  USING (auth.uid() = uid);

CREATE POLICY "Users can insert own tokens"
  ON user_google_tokens FOR INSERT
  WITH CHECK (auth.uid() = uid);

CREATE POLICY "Users can update own tokens"
  ON user_google_tokens FOR UPDATE
  USING (auth.uid() = uid);

CREATE POLICY "Users can delete own tokens"
  ON user_google_tokens FOR DELETE
  USING (auth.uid() = uid);

-- shiftsテーブルにGoogle CalendarイベントID列を追加
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;
