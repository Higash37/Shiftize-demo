-- ============================================
-- 途中時間タイプ・シフトレポート・タスク配置テーブル
-- ============================================

-- time_segment_types: 途中時間の種類定義（休憩、授業等）
-- 給与計算で除外/含む/カスタムレートを制御する
CREATE TABLE IF NOT EXISTS time_segment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL REFERENCES stores(store_id),
  name TEXT NOT NULL,
  icon TEXT DEFAULT '',
  color TEXT DEFAULT '#4A90E2',
  wage_mode TEXT DEFAULT 'exclude' CHECK (wage_mode IN ('exclude', 'include', 'custom_rate')),
  custom_rate NUMERIC DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  allow_task_overlap BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tst_store ON time_segment_types (store_id);

ALTER TABLE time_segment_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_segment_types_access" ON time_segment_types
  FOR ALL USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );

-- reports: シフト勤務報告（タスク実績・コメント）
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
  task_counts JSONB DEFAULT '{}',
  comments TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_shift ON reports (shift_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_access" ON reports
  FOR ALL USING (
    shift_id IN (
      SELECT id FROM shifts WHERE store_id IN (
        SELECT store_id FROM users WHERE uid = auth.uid()
      )
    )
  );

-- shift_task_assignments: 自動配置エンジンの結果を保存
CREATE TABLE IF NOT EXISTS shift_task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL,
  task_id UUID,
  role_id UUID,
  store_id TEXT NOT NULL REFERENCES stores(store_id),
  user_id TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  scheduled_start_time TEXT NOT NULL,
  scheduled_end_time TEXT NOT NULL,
  source TEXT DEFAULT 'auto' CHECK (source IN ('auto', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sta_store ON shift_task_assignments (store_id);
CREATE INDEX IF NOT EXISTS idx_sta_shift ON shift_task_assignments (shift_id);
CREATE INDEX IF NOT EXISTS idx_sta_date ON shift_task_assignments (store_id, scheduled_date);

ALTER TABLE shift_task_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shift_task_assignments_access" ON shift_task_assignments
  FOR ALL USING (
    store_id IN (SELECT store_id FROM users WHERE uid = auth.uid())
  );
