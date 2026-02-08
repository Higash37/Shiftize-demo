-- Supabase PostgreSQL Schema
-- Firestore collections -> PostgreSQL tables (1:1 mapping)

-- ============================================================
-- updated_at トリガー関数
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- users テーブル (Firestore: users)
-- ============================================================
CREATE TABLE users (
  uid TEXT PRIMARY KEY,
  email TEXT,
  nickname TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('master', 'user')),
  store_id TEXT NOT NULL DEFAULT '',
  color TEXT DEFAULT '#4A90E2',
  hourly_wage INTEGER DEFAULT 1000,
  hashed_password TEXT,
  current_password TEXT,
  real_email TEXT,
  real_email_user_id TEXT,
  original_user_id TEXT,
  connected_stores TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_store_id ON users(store_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- stores テーブル (Firestore: stores)
-- ============================================================
CREATE TABLE stores (
  store_id TEXT PRIMARY KEY,
  store_name TEXT NOT NULL DEFAULT '',
  admin_uid TEXT NOT NULL DEFAULT '',
  admin_nickname TEXT DEFAULT '',
  connected_stores TEXT[] DEFAULT '{}',
  connection_password TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER trg_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- shifts テーブル (Firestore: shifts)
-- ============================================================
CREATE TABLE shifts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL DEFAULT '',
  store_id TEXT NOT NULL DEFAULT '',
  nickname TEXT DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  start_time TEXT NOT NULL DEFAULT '',
  end_time TEXT NOT NULL DEFAULT '',
  type TEXT DEFAULT 'user',
  subject TEXT DEFAULT '',
  notes TEXT,
  status TEXT DEFAULT 'draft',
  duration TEXT DEFAULT '',
  is_completed BOOLEAN DEFAULT false,
  classes JSONB DEFAULT '[]',
  extended_tasks JSONB DEFAULT '[]',
  requested_changes JSONB,
  tasks JSONB,
  comments TEXT,
  approved_by TEXT,
  rejected_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shifts_store_id ON shifts(store_id);
CREATE INDEX idx_shifts_user_id ON shifts(user_id);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_store_date ON shifts(store_id, date);

CREATE TRIGGER trg_shifts_updated_at
  BEFORE UPDATE ON shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- tasks テーブル (Firestore: tasks) - 通常タスク
-- ============================================================
CREATE TABLE tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL DEFAULT '',
  frequency TEXT DEFAULT '',
  time_per_task TEXT DEFAULT '',
  description TEXT DEFAULT '',
  store_id TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tasks_store_id ON tasks(store_id);

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- extended_tasks テーブル (Firestore: extendedTasks)
-- ============================================================
CREATE TABLE extended_tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL DEFAULT '',
  short_name TEXT,
  description TEXT DEFAULT '',
  type TEXT DEFAULT 'standard',
  base_time_minutes INTEGER DEFAULT 0,
  base_count_per_shift INTEGER DEFAULT 1,
  restricted_time_ranges JSONB DEFAULT '[]',
  restricted_start_time TEXT,
  restricted_end_time TEXT,
  required_role TEXT,
  tags TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'medium',
  difficulty TEXT DEFAULT 'medium',
  color TEXT,
  icon TEXT,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  store_id TEXT NOT NULL DEFAULT '',
  created_by TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_extended_tasks_store_id ON extended_tasks(store_id);
CREATE INDEX idx_extended_tasks_type ON extended_tasks(type);
CREATE INDEX idx_extended_tasks_is_active ON extended_tasks(is_active);

CREATE TRIGGER trg_extended_tasks_updated_at
  BEFORE UPDATE ON extended_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- task_executions テーブル (Firestore: taskExecutions)
-- ============================================================
CREATE TABLE task_executions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  shift_id TEXT NOT NULL DEFAULT '',
  task_id TEXT NOT NULL DEFAULT '',
  actual_count INTEGER DEFAULT 0,
  actual_time_minutes INTEGER DEFAULT 0,
  start_time TEXT,
  end_time TEXT,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_task_executions_shift_id ON task_executions(shift_id);
CREATE INDEX idx_task_executions_task_id ON task_executions(task_id);

CREATE TRIGGER trg_task_executions_updated_at
  BEFORE UPDATE ON task_executions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- shift_change_logs テーブル (Firestore: shiftChangeLogs)
-- ============================================================
CREATE TABLE shift_change_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  store_id TEXT NOT NULL DEFAULT '',
  shift_id TEXT,
  action TEXT NOT NULL DEFAULT '',
  actor JSONB NOT NULL DEFAULT '{}',
  date TEXT NOT NULL DEFAULT '',
  prev JSONB,
  next JSONB,
  prev_snapshot JSONB,
  next_snapshot JSONB,
  summary TEXT DEFAULT '',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shift_change_logs_store_id ON shift_change_logs(store_id);
CREATE INDEX idx_shift_change_logs_shift_id ON shift_change_logs(shift_id);
CREATE INDEX idx_shift_change_logs_date ON shift_change_logs(date);

CREATE TRIGGER trg_shift_change_logs_updated_at
  BEFORE UPDATE ON shift_change_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- settings テーブル (Firestore: settings)
-- ============================================================
CREATE TABLE settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  store_id TEXT NOT NULL DEFAULT '',
  settings_key TEXT NOT NULL DEFAULT '',
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, settings_key)
);

CREATE INDEX idx_settings_store_id ON settings(store_id);

CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- reports テーブル (Firestore: reports)
-- ============================================================
CREATE TABLE reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  shift_id TEXT NOT NULL DEFAULT '',
  task_counts JSONB DEFAULT '{}',
  comments TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reports_shift_id ON reports(shift_id);

CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
