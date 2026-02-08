-- タスク関連テーブルを削除
DROP TABLE IF EXISTS task_executions CASCADE;
DROP TABLE IF EXISTS extended_tasks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- shiftsテーブルからタスクカラムを削除
ALTER TABLE shifts DROP COLUMN IF EXISTS extended_tasks;
ALTER TABLE shifts DROP COLUMN IF EXISTS tasks;
