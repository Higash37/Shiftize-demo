-- ============================================
-- 業務（ロール）・タスク・配置テーブル
-- ============================================

-- staff_roles: 業務定義（例: 数学講師、事務）
CREATE TABLE IF NOT EXISTS staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL REFERENCES stores(store_id),
  name TEXT NOT NULL,
  icon TEXT DEFAULT '',
  color TEXT DEFAULT '#4A90E2',
  description TEXT DEFAULT '',
  schedule_days INTEGER[] DEFAULT '{}',
  schedule_start_time TEXT,
  schedule_duration_minutes INTEGER,
  schedule_interval_minutes INTEGER,
  required_count INTEGER DEFAULT 1,
  assignment_mode TEXT DEFAULT 'anyone' CHECK (assignment_mode IN ('anyone', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_roles_store ON staff_roles (store_id);

-- role_tasks: 業務に紐づくタスク（例: 採点、電話対応）
CREATE TABLE IF NOT EXISTS role_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES staff_roles(id) ON DELETE CASCADE,
  store_id TEXT NOT NULL REFERENCES stores(store_id),
  name TEXT NOT NULL,
  icon TEXT DEFAULT '',
  color TEXT DEFAULT '#4A90E2',
  description TEXT DEFAULT '',
  schedule_days INTEGER[] DEFAULT '{}',
  schedule_start_time TEXT,
  schedule_duration_minutes INTEGER,
  schedule_interval_minutes INTEGER,
  required_count INTEGER DEFAULT 1,
  assignment_mode TEXT DEFAULT 'anyone' CHECK (assignment_mode IN ('anyone', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_tasks_role ON role_tasks (role_id);
CREATE INDEX IF NOT EXISTS idx_role_tasks_store ON role_tasks (store_id);

-- user_role_assignments: ユーザーと業務の紐付け
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES staff_roles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  store_id TEXT NOT NULL REFERENCES stores(store_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ura_store ON user_role_assignments (store_id);

-- user_task_assignments: ユーザーとタスクの紐付け
CREATE TABLE IF NOT EXISTS user_task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES role_tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  store_id TEXT NOT NULL REFERENCES stores(store_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_uta_store ON user_task_assignments (store_id);

-- ========== RLS ==========

ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_task_assignments ENABLE ROW LEVEL SECURITY;

-- staff_roles: 同店舗メンバーのみアクセス
CREATE POLICY "staff_roles_access" ON staff_roles
  FOR ALL USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

-- role_tasks: 同店舗メンバーのみアクセス
CREATE POLICY "role_tasks_access" ON role_tasks
  FOR ALL USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

-- user_role_assignments: 同店舗メンバーのみアクセス
CREATE POLICY "user_role_assignments_access" ON user_role_assignments
  FOR ALL USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

-- user_task_assignments: 同店舗メンバーのみアクセス
CREATE POLICY "user_task_assignments_access" ON user_task_assignments
  FOR ALL USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );
