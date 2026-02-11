-- Google Calendarトークン取得用RPC関数
-- SECURITY DEFINER でRLSをバイパスし、masterユーザーが
-- シフト所有者のトークンを取得できるようにする
CREATE OR REPLACE FUNCTION get_google_tokens_for_user(target_uid UUID)
RETURNS TABLE (
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  calendar_sync_enabled BOOLEAN
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 呼び出し元が認証済みであることを確認
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT t.access_token, t.refresh_token, t.token_expires_at, t.calendar_sync_enabled
  FROM user_google_tokens t
  WHERE t.uid = target_uid;
END;
$$ LANGUAGE plpgsql;
