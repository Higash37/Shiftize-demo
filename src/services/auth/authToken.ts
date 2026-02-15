import { getSupabase } from "../supabase/supabase-client";

/**
 * 認証トークンを取得（API呼び出し用）
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
};
