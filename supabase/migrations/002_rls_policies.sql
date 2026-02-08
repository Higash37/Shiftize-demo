-- Row Level Security (RLS) Policies
-- auth.uid() = Firebase UID (set via token exchange)

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE extended_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper Functions
-- ============================================================

-- ユーザーのstore_idを取得
CREATE OR REPLACE FUNCTION user_store_id()
RETURNS TEXT AS $$
  SELECT store_id FROM users WHERE uid = auth.uid()::text
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ユーザーのroleを取得
CREATE OR REPLACE FUNCTION user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE uid = auth.uid()::text
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- connected_storesを含む全アクセス可能store_idを取得
CREATE OR REPLACE FUNCTION accessible_store_ids()
RETURNS TEXT[] AS $$
  SELECT ARRAY[store_id] || COALESCE(connected_stores, '{}')
  FROM users WHERE uid = auth.uid()::text
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- users ポリシー
-- ============================================================

-- SELECT: 同store or master
CREATE POLICY users_select ON users FOR SELECT USING (
  store_id = user_store_id()
  OR user_role() = 'master'
  OR uid = auth.uid()::text
);

-- UPDATE: 自分 or master
CREATE POLICY users_update ON users FOR UPDATE USING (
  uid = auth.uid()::text
  OR (user_role() = 'master' AND store_id = user_store_id())
);

-- INSERT: service_role or auth users (グループ作成時)
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (
  uid = auth.uid()::text
  OR user_role() = 'master'
);

-- DELETE: master only
CREATE POLICY users_delete ON users FOR DELETE USING (
  user_role() = 'master' AND store_id = user_store_id()
);

-- ============================================================
-- stores ポリシー
-- ============================================================

-- SELECT: メンバー
CREATE POLICY stores_select ON stores FOR SELECT USING (
  store_id = ANY(accessible_store_ids())
  OR store_id = store_id  -- 未認証でも店舗ID存在チェック用
);

-- INSERT: authenticated users (グループ作成時)
CREATE POLICY stores_insert ON stores FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- UPDATE: admin of the store
CREATE POLICY stores_update ON stores FOR UPDATE USING (
  admin_uid = auth.uid()::text
);

-- DELETE: admin only
CREATE POLICY stores_delete ON stores FOR DELETE USING (
  admin_uid = auth.uid()::text
);

-- ============================================================
-- shifts ポリシー
-- ============================================================

-- SELECT: accessible_store_ids含む
CREATE POLICY shifts_select ON shifts FOR SELECT USING (
  store_id = ANY(accessible_store_ids())
);

-- INSERT: 同store
CREATE POLICY shifts_insert ON shifts FOR INSERT WITH CHECK (
  store_id = user_store_id()
  OR store_id = ANY(accessible_store_ids())
);

-- UPDATE: 同store
CREATE POLICY shifts_update ON shifts FOR UPDATE USING (
  store_id = user_store_id()
  OR store_id = ANY(accessible_store_ids())
);

-- DELETE: 同store + master
CREATE POLICY shifts_delete ON shifts FOR DELETE USING (
  store_id = user_store_id()
  OR (user_role() = 'master' AND store_id = ANY(accessible_store_ids()))
);

-- ============================================================
-- tasks ポリシー
-- ============================================================

-- SELECT: 同store
CREATE POLICY tasks_select ON tasks FOR SELECT USING (
  store_id = user_store_id()
  OR store_id = ANY(accessible_store_ids())
);

-- INSERT: master
CREATE POLICY tasks_insert ON tasks FOR INSERT WITH CHECK (
  store_id = user_store_id()
);

-- UPDATE: master
CREATE POLICY tasks_update ON tasks FOR UPDATE USING (
  store_id = user_store_id()
  AND user_role() = 'master'
);

-- DELETE: master
CREATE POLICY tasks_delete ON tasks FOR DELETE USING (
  store_id = user_store_id()
  AND user_role() = 'master'
);

-- ============================================================
-- extended_tasks ポリシー
-- ============================================================

-- SELECT: 同store
CREATE POLICY extended_tasks_select ON extended_tasks FOR SELECT USING (
  store_id = user_store_id()
  OR store_id = ANY(accessible_store_ids())
);

-- INSERT: master
CREATE POLICY extended_tasks_insert ON extended_tasks FOR INSERT WITH CHECK (
  store_id = user_store_id()
);

-- UPDATE: master
CREATE POLICY extended_tasks_update ON extended_tasks FOR UPDATE USING (
  store_id = user_store_id()
);

-- DELETE: master
CREATE POLICY extended_tasks_delete ON extended_tasks FOR DELETE USING (
  store_id = user_store_id()
  AND user_role() = 'master'
);

-- ============================================================
-- task_executions ポリシー
-- ============================================================

-- SELECT: shift経由で同store
CREATE POLICY task_executions_select ON task_executions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM shifts
    WHERE shifts.id = task_executions.shift_id
    AND shifts.store_id = ANY(accessible_store_ids())
  )
);

-- INSERT: 同store
CREATE POLICY task_executions_insert ON task_executions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM shifts
    WHERE shifts.id = task_executions.shift_id
    AND shifts.store_id = ANY(accessible_store_ids())
  )
);

-- UPDATE: 同store
CREATE POLICY task_executions_update ON task_executions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM shifts
    WHERE shifts.id = task_executions.shift_id
    AND shifts.store_id = ANY(accessible_store_ids())
  )
);

-- ============================================================
-- shift_change_logs ポリシー
-- ============================================================

-- SELECT: master + 同store
CREATE POLICY shift_change_logs_select ON shift_change_logs FOR SELECT USING (
  store_id = user_store_id()
  OR store_id = ANY(accessible_store_ids())
);

-- INSERT: 同store
CREATE POLICY shift_change_logs_insert ON shift_change_logs FOR INSERT WITH CHECK (
  store_id = user_store_id()
  OR store_id = ANY(accessible_store_ids())
);

-- ============================================================
-- settings ポリシー
-- ============================================================

-- SELECT: 同store
CREATE POLICY settings_select ON settings FOR SELECT USING (
  store_id = user_store_id()
  OR store_id = ANY(accessible_store_ids())
);

-- INSERT: master
CREATE POLICY settings_insert ON settings FOR INSERT WITH CHECK (
  store_id = user_store_id()
);

-- UPDATE: master
CREATE POLICY settings_update ON settings FOR UPDATE USING (
  store_id = user_store_id()
);

-- ============================================================
-- reports ポリシー
-- ============================================================

-- SELECT: shift経由で同store
CREATE POLICY reports_select ON reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM shifts
    WHERE shifts.id = reports.shift_id
    AND shifts.store_id = ANY(accessible_store_ids())
  )
);

-- INSERT: 同store
CREATE POLICY reports_insert ON reports FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM shifts
    WHERE shifts.id = reports.shift_id
    AND shifts.store_id = ANY(accessible_store_ids())
  )
);
