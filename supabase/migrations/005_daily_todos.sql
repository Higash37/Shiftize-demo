-- ============================================
-- Todo テンプレートテーブル
-- ============================================

CREATE TABLE IF NOT EXISTS todo_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL REFERENCES stores(store_id),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  default_priority TEXT CHECK (default_priority IN ('urgent', 'high', 'medium', 'low')),
  steps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_todo_templates_store
  ON todo_templates (store_id);

ALTER TABLE todo_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todo_templates_select" ON todo_templates FOR SELECT USING (true);
CREATE POLICY "todo_templates_insert" ON todo_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "todo_templates_update" ON todo_templates FOR UPDATE USING (true);
CREATE POLICY "todo_templates_delete" ON todo_templates FOR DELETE USING (true);

-- ============================================
-- Daily Todos テーブル
-- ============================================

CREATE TABLE IF NOT EXISTS daily_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL REFERENCES stores(store_id),
  created_by TEXT NOT NULL,
  created_by_name TEXT,
  assignee TEXT,
  title TEXT NOT NULL,
  template_id UUID REFERENCES todo_templates(id) ON DELETE SET NULL,
  steps JSONB DEFAULT '[]',
  step_progress JSONB DEFAULT '{}',
  task TEXT,
  description TEXT,
  target_date TEXT NOT NULL,
  due_date TEXT,
  start_time TEXT,
  end_time TEXT,
  priority TEXT CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  icon TEXT,
  visible_to JSONB DEFAULT '[]',
  is_completed BOOLEAN DEFAULT false,
  completed_by TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_todos_store_date
  ON daily_todos (store_id, target_date);

ALTER TABLE daily_todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_todos_select" ON daily_todos FOR SELECT USING (true);
CREATE POLICY "daily_todos_insert" ON daily_todos FOR INSERT WITH CHECK (true);
CREATE POLICY "daily_todos_update" ON daily_todos FOR UPDATE USING (true);
CREATE POLICY "daily_todos_delete" ON daily_todos FOR DELETE USING (true);

-- ============================================
-- Todo コメントテーブル
-- ============================================

CREATE TABLE IF NOT EXISTS todo_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id UUID NOT NULL REFERENCES daily_todos(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES todo_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_todo_comments_todo_id
  ON todo_comments (todo_id);

ALTER TABLE todo_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todo_comments_select" ON todo_comments FOR SELECT USING (true);
CREATE POLICY "todo_comments_insert" ON todo_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "todo_comments_delete" ON todo_comments FOR DELETE USING (true);
