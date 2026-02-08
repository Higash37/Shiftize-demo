-- ============================================
-- Shiftize Supabase Schema + RLS + RPC
-- ============================================

-- ========== TABLES ==========

CREATE TABLE IF NOT EXISTS stores (
  store_id TEXT PRIMARY KEY,
  store_name TEXT NOT NULL,
  admin_uid UUID,
  admin_nickname TEXT,
  is_active BOOLEAN DEFAULT true,
  connected_stores JSONB DEFAULT '[]',
  connection_password TEXT,
  connection_password_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  uid UUID PRIMARY KEY,
  nickname TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'user',
  hashed_password TEXT,
  current_password TEXT,
  color TEXT DEFAULT '#4A90E2',
  store_id TEXT REFERENCES stores(store_id),
  connected_stores JSONB DEFAULT '[]',
  hourly_wage INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  deleted BOOLEAN DEFAULT false,
  real_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  store_id TEXT REFERENCES stores(store_id),
  nickname TEXT,
  date TEXT,
  start_time TEXT,
  end_time TEXT,
  type TEXT DEFAULT 'user',
  subject TEXT,
  notes TEXT,
  is_completed BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  duration NUMERIC,
  classes JSONB DEFAULT '[]',
  requested_changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES stores(store_id),
  settings_key TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, settings_key)
);

CREATE TABLE IF NOT EXISTS shift_change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT,
  shift_id TEXT,
  action TEXT,
  actor JSONB,
  date TEXT,
  prev JSONB,
  next JSONB,
  prev_snapshot JSONB,
  next_snapshot JSONB,
  summary TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- recruitment_shifts: notes/subject はアダプター側が使用するカラム
CREATE TABLE IF NOT EXISTS recruitment_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES stores(store_id),
  date TEXT,
  start_time TEXT,
  end_time TEXT,
  max_applicants INTEGER DEFAULT 1,
  notes TEXT,
  subject TEXT,
  description TEXT,
  status TEXT DEFAULT 'open',
  applications JSONB DEFAULT '[]',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quick_shift_tokens (
  id TEXT PRIMARY KEY,
  store_id TEXT REFERENCES stores(store_id),
  created_by TEXT,
  token_type TEXT,
  recruitment_shift_ids JSONB,
  allowed_date_range JSONB,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  allowed_user_ids JSONB,
  require_line_auth BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  usage_log JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- shift_submission_periods: シフト提出募集期間（マスターが作成）
CREATE TABLE IF NOT EXISTS shift_submission_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES stores(store_id),
  start_date TEXT,
  end_date TEXT,
  target_month TEXT,
  is_active BOOLEAN DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- shift_submissions: ユーザーごとのシフト提出データ
CREATE TABLE IF NOT EXISTS shift_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID REFERENCES shift_submission_periods(id) ON DELETE CASCADE,
  user_id TEXT,
  store_id TEXT REFERENCES stores(store_id),
  requests JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shift_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT REFERENCES stores(store_id),
  year INTEGER,
  month INTEGER,
  confirmed_by TEXT,
  confirmed_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_store_access: カラム名はアダプター側の .eq("uid") に合わせる
CREATE TABLE IF NOT EXISTS user_store_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID REFERENCES users(uid),
  email TEXT,
  nickname TEXT,
  stores_access JSONB DEFAULT '{}',
  current_store_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== RLS ==========

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_shift_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_submission_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_store_access ENABLE ROW LEVEL SECURITY;

-- ========== RLS POLICIES: stores ==========
-- SELECT/UPDATE/DELETE: 自店舗メンバーのみ
-- INSERT: 認証済みユーザーなら誰でも作成可（createGroup bootstrap用）

CREATE POLICY "stores_select" ON stores
  FOR SELECT USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

CREATE POLICY "stores_insert" ON stores
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "stores_update" ON stores
  FOR UPDATE USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

CREATE POLICY "stores_delete" ON stores
  FOR DELETE USING (
    admin_uid = auth.uid()
  );

-- ========== RLS POLICIES: users ==========
-- SELECT/UPDATE: 同じ店舗のメンバー
-- INSERT: 自分のレコード(uid=auth.uid()) OR 同店舗のmasterが作成
-- DELETE: 同じ店舗のメンバー

CREATE POLICY "users_select" ON users
  FOR SELECT USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (
    uid = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.uid = auth.uid()
      AND u.role = 'master'
      AND u.store_id = store_id
    )
  );

CREATE POLICY "users_update" ON users
  FOR UPDATE USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

CREATE POLICY "users_delete" ON users
  FOR DELETE USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

-- ========== RLS POLICIES: shifts ==========

CREATE POLICY "shifts_store_access" ON shifts
  FOR ALL USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

-- ========== RLS POLICIES: settings ==========

CREATE POLICY "settings_store_access" ON settings
  FOR ALL USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

-- ========== RLS POLICIES: shift_change_logs ==========

CREATE POLICY "logs_store_access" ON shift_change_logs
  FOR ALL USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

-- ========== RLS POLICIES: recruitment_shifts ==========

CREATE POLICY "recruitment_store_access" ON recruitment_shifts
  FOR ALL USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

-- ========== RLS POLICIES: quick_shift_tokens ==========

CREATE POLICY "tokens_store_access" ON quick_shift_tokens
  FOR ALL USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

-- ========== RLS POLICIES: shift_submission_periods ==========

CREATE POLICY "submission_periods_store_access" ON shift_submission_periods
  FOR ALL USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

-- ========== RLS POLICIES: shift_submissions ==========

CREATE POLICY "submissions_store_access" ON shift_submissions
  FOR ALL USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

-- ========== RLS POLICIES: shift_confirmations ==========

CREATE POLICY "confirmations_store_access" ON shift_confirmations
  FOR ALL USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

-- ========== RLS POLICIES: user_store_access ==========
-- 自分のレコード OR masterロールなら他ユーザーの管理も可（inviteUserToStore用）

CREATE POLICY "user_store_access_own" ON user_store_access
  FOR ALL USING (uid = auth.uid());

CREATE POLICY "user_store_access_master" ON user_store_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.uid = auth.uid()
      AND users.role = 'master'
    )
  );

-- ========== RPC FUNCTIONS ==========

-- record_token_usage: 原子的にトークン使用を記録（競合回避）
CREATE OR REPLACE FUNCTION record_token_usage(
  p_token_id TEXT,
  p_user_id TEXT,
  p_shift_id TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE quick_shift_tokens
  SET
    current_uses = current_uses + 1,
    last_used_at = NOW(),
    usage_log = COALESCE(usage_log, '[]'::jsonb) || jsonb_build_object(
      'userId', p_user_id,
      'usedAt', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
      'shiftId', p_shift_id
    ),
    updated_at = NOW()
  WHERE id = p_token_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- append_recruitment_application: 原子的に応募を追加（競合回避・二重応募防止）
CREATE OR REPLACE FUNCTION append_recruitment_application(
  p_shift_id UUID,
  p_application JSONB
) RETURNS VOID AS $$
DECLARE
  v_user_id TEXT;
  v_exists BOOLEAN;
BEGIN
  v_user_id := p_application->>'userId';

  -- 二重応募チェック
  SELECT EXISTS(
    SELECT 1 FROM recruitment_shifts
    WHERE id = p_shift_id
      AND applications @> jsonb_build_array(jsonb_build_object('userId', v_user_id))
  ) INTO v_exists;

  IF v_exists THEN
    RAISE EXCEPTION '既にこのシフトに応募済みです';
  END IF;

  -- 原子的にappend
  UPDATE recruitment_shifts
  SET
    applications = COALESCE(applications, '[]'::jsonb) || jsonb_build_array(p_application),
    updated_at = NOW()
  WHERE id = p_shift_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
