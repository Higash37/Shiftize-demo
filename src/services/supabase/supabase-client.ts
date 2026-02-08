import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { auth } from "@/services/firebase/firebase-core";
import { getIdToken, onIdTokenChanged } from "firebase/auth";

const SUPABASE_URL = process.env['EXPO_PUBLIC_SUPABASE_URL'] || "";
const SUPABASE_ANON_KEY = process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] || "";

let supabaseInstance: SupabaseClient | null = null;
let tokenRefreshUnsubscribe: (() => void) | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error(
        "Supabase URL and Anon Key must be set via EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY"
      );
    }
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseInstance;
}

/**
 * Firebase IDトークンをEdge Functionに送り、Supabase JWTを取得してセッション設定
 */
export async function authenticateSupabase(): Promise<void> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    throw new Error("Firebase user not authenticated");
  }

  const idToken = await getIdToken(firebaseUser, true);
  const supabase = getSupabase();

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/firebase-token-exchange`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ firebaseToken: idToken }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${errorBody}`);
  }

  const { access_token, refresh_token } = await response.json();
  await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
}

/**
 * Firebase onIdTokenChanged でSupabaseトークンを自動更新
 * アプリ起動時に1回呼び出す
 */
export function startSupabaseTokenSync(): () => void {
  if (tokenRefreshUnsubscribe) {
    tokenRefreshUnsubscribe();
  }

  tokenRefreshUnsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        await authenticateSupabase();
      } catch (error) {
        console.error("Supabase token refresh failed:", error);
      }
    } else {
      // Firebase user signed out, sign out of Supabase too
      const supabase = getSupabase();
      await supabase.auth.signOut();
    }
  });

  return () => {
    if (tokenRefreshUnsubscribe) {
      tokenRefreshUnsubscribe();
      tokenRefreshUnsubscribe = null;
    }
  };
}
