-- ============================================
-- OAuth Linking: Add oauth_provider and oauth_linked_at columns
-- ============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS oauth_provider TEXT,
  ADD COLUMN IF NOT EXISTS oauth_linked_at TIMESTAMPTZ;
