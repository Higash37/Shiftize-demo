import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { User } from "./auth";
import { ServiceProvider } from "../ServiceProvider";
import { getSupabase } from "../supabase/supabase-client";
import { StoreIdStorage } from "@/common/common-utils/util-storage/StoreIdStorage";
import { validateEmail } from "@/common/common-utils/validation/inputValidation";
import { SecurityLogger, RateLimiter, CSRFTokenManager } from "@/common/common-utils/security/securityUtils";
import { toAsciiEmail } from "@/services/supabase/utils/asciiEmail";

// プラットフォーム安全なユーザーエージェント取得
const getSafeUserAgent = () => typeof navigator !== "undefined" ? navigator.userAgent : "react-native";
const getSafeOrigin = () => typeof window !== "undefined" && window.location ? window.location.origin : "app";

// --- Reducer ---

interface AuthState {
  user: User | null;
  role: "master" | "user" | null;
  loading: boolean;
  authError: string | null;
}

type AuthAction =
  | { type: "AUTH_SUCCESS"; user: User; role: "master" | "user" }
  | { type: "AUTH_CLEAR" }
  | { type: "AUTH_ERROR"; error: string };

const initialState: AuthState = {
  user: null,
  role: null,
  loading: true,
  authError: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_SUCCESS":
      return { user: action.user, role: action.role, loading: false, authError: null };
    case "AUTH_CLEAR":
      return { user: null, role: null, loading: false, authError: null };
    case "AUTH_ERROR":
      return { user: null, role: null, loading: false, authError: action.error };
    default:
      return state;
  }
}

// --- Context ---

interface AuthContextValue {
  user: User | null;
  role: "master" | "user" | null;
  loading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  signIn: (emailOrUsername: string, password: string, storeId?: string) => Promise<{ role: "master" | "user" }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// --- Provider ---

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // signIn処理中はonAuthStateChangeのSIGNED_INをスキップ（signInが直接プロフィール取得するため）
  const signInInProgress = useRef(false);

  // プロフィールキャッシュ: TOKEN_REFRESHED時やDB障害時のDB再クエリを回避
  const cachedProfile = useRef<{ uid: string; nickname: string; role: "master" | "user"; email: string; storeId: string } | null>(null);

  // --- signIn ---
  const signIn = useCallback(async (
    emailOrUsernameWithStore: string,
    password: string,
    storeId?: string
  ): Promise<{ role: "master" | "user" }> => {
    try {
      // セキュリティ検証
      const userAgent = getSafeUserAgent();
      const clientId = `${userAgent}_${getSafeOrigin()}`;

      // レート制限チェック
      if (!RateLimiter.isAllowed(clientId)) {
        SecurityLogger.logEvent({
          type: 'rate_limit_exceeded',
          details: 'Login rate limit exceeded',
          userAgent,
        });
        throw new Error("ログイン試行回数が上限に達しました。しばらく時間を置いてから再試行してください。");
      }

      // 入力値検証
      if (!emailOrUsernameWithStore || !password) {
        SecurityLogger.logEvent({
          type: 'invalid_input',
          details: 'Empty email or password provided',
        });
        throw new Error("メールアドレスとパスワードを入力してください");
      }

      // メールアドレス形式の場合は検証
      const isEmailFormatInput = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsernameWithStore);
      if (isEmailFormatInput) {
        const emailValidation = validateEmail(emailOrUsernameWithStore);
        if (!emailValidation.isValid) {
          SecurityLogger.logEvent({
            type: 'invalid_input',
            details: `Invalid email format: ${emailValidation.error}`,
          });
          throw new Error(emailValidation.error);
        }
      }

      // パスワード基本検証
      if (password.length < 6) {
        SecurityLogger.logEvent({
          type: 'invalid_input',
          details: 'Password too short',
        });
        throw new Error("パスワードは6文字以上で入力してください");
      }

      let emailToUse = emailOrUsernameWithStore;

      // メールアドレス形式でない場合、店舗ID + ニックネーム形式
      if (!isEmailFormatInput) {
        if (!storeId) {
          throw new Error("店舗IDが必要です");
        }
        emailToUse = `${storeId}${emailOrUsernameWithStore}@example.com`;
      }

      // Supabase Authは非ASCIIメールを受け付けないため変換
      emailToUse = toAsciiEmail(emailToUse);

      // onAuthStateChangeのSIGNED_INをスキップするフラグ
      signInInProgress.current = true;

      // signInWithPasswordを直接呼び出し
      // SupabaseAuthAdapter.signIn経由だと、signInWithPassword直後のDBクエリが
      // Supabase JS v2のnavigator.locksでデッドロックするため、認証とDB取得を分離する
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (authError || !authData.user) {
        throw new Error("メールアドレスまたはパスワードが正しくありません");
      }

      // signInWithPassword完了後、navigator.locksが解放されるまで待つ
      // macrotask遅延でセッションの完全確立を保証
      const userData = await new Promise<Record<string, any> | null>((resolve, reject) => {
        setTimeout(async () => {
          try {
            const result = await ServiceProvider.users.getUserFullProfile(authData.user!.id);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        }, 0);
      });

      if (!userData) {
        throw new Error("ユーザー情報が見つかりません");
      }

      const nickname = userData['nickname'] as string || "";
      const userRole = (userData['role'] as "master" | "user") || "user";
      const profile = {
        uid: authData.user.id,
        nickname,
        role: userRole,
        email: authData.user.email || "",
        storeId: userData['storeId'] || "",
      };

      // キャッシュに保存
      cachedProfile.current = profile;

      dispatch({
        type: "AUTH_SUCCESS",
        user: profile,
        role: userRole,
      });

      // 店舗IDを保存
      if (profile.storeId) {
        await StoreIdStorage.saveStoreId(profile.storeId);
      }

      // セキュリティ: ログイン成功ログ
      SecurityLogger.logEvent({
        type: 'system_event',
        details: `User ${nickname} logged in successfully`,
        userAgent,
      });

      return { role: userRole };
    } catch (error: any) {
      let errorMessage = "ログインに失敗しました";
      if (error.message) {
        errorMessage = error.message;
      }
      dispatch({ type: "AUTH_ERROR", error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      signInInProgress.current = false;
    }
  }, []);

  // --- signOut ---
  const signOut = useCallback(async () => {
    try {
      CSRFTokenManager.clearToken();
      cachedProfile.current = null;
      await ServiceProvider.auth.signOut();
      dispatch({ type: "AUTH_CLEAR" });

      SecurityLogger.logEvent({
        type: 'user_logout',
        details: 'User logged out',
        userAgent: getSafeUserAgent(),
      });
    } catch (error) {
      dispatch({ type: "AUTH_CLEAR" });
      throw error;
    }
  }, []);

  // --- onAuthStateChange (単一サブスクリプション) ---
  // 重要: コールバック内でsupabase.from()等のDBクエリを直接実行すると、
  // navigator.locksのスコープ内でgetSession()が再帰ロックを取得しようとしてデッドロックする。
  // 全てのDB操作はsetTimeout(0)でmacrotask遅延させ、ロックスコープから完全に抜ける。
  useEffect(() => {
    const supabase = getSupabase();

    /** DB操作を含むプロフィール取得＋dispatch（ロックスコープ外で実行） */
    const fetchAndDispatchProfile = async (userId: string, email: string) => {
      try {
        const userData = await ServiceProvider.users.getUserFullProfile(userId);

        if (userData) {
          const nickname = userData['nickname'] as string || "";
          const userRole = (userData['role'] as "master" | "user") || "user";
          const profile = {
            uid: userId,
            nickname,
            role: userRole,
            email,
            storeId: userData['storeId'] || "",
          };

          cachedProfile.current = profile;
          dispatch({ type: "AUTH_SUCCESS", user: profile, role: userRole });

          if (profile.storeId) {
            await StoreIdStorage.saveStoreId(profile.storeId);
          }
        } else if (cachedProfile.current) {
          dispatch({
            type: "AUTH_SUCCESS",
            user: cachedProfile.current,
            role: cachedProfile.current.role,
          });
        } else {
          await ServiceProvider.auth.signOut();
          dispatch({ type: "AUTH_ERROR", error: "ユーザー情報が見つかりません。" });
        }
      } catch {
        if (cachedProfile.current) {
          dispatch({
            type: "AUTH_SUCCESS",
            user: cachedProfile.current,
            role: cachedProfile.current.role,
          });
        } else {
          await ServiceProvider.auth.signOut();
          dispatch({ type: "AUTH_ERROR", error: "認証エラーが発生しました。" });
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // signIn処理中のSIGNED_INはsignIn関数が直接プロフィール取得するためスキップ
        if (signInInProgress.current && event === "SIGNED_IN") {
          return;
        }

        // TOKEN_REFRESHED: キャッシュがあればDBクエリをスキップ
        if (event === "TOKEN_REFRESHED" && cachedProfile.current && session?.user) {
          dispatch({
            type: "AUTH_SUCCESS",
            user: cachedProfile.current,
            role: cachedProfile.current.role,
          });
          return;
        }

        if (session?.user) {
          const userId = session.user.id;
          const email = session.user.email || "";

          // macrotask遅延: navigator.locksスコープから完全に抜けてからDB操作を実行
          setTimeout(() => {
            // Google Calendar連携: provider_tokenがあれば保存
            if ((session as any).provider_token) {
              const identities = session.user!.identities ?? [];
              const googleIdentity = identities.find((id) => id.provider === "google");
              if (googleIdentity) {
                ServiceProvider.googleCalendar
                  .saveOAuthTokens(userId, (session as any).provider_token, (session as any).provider_refresh_token || "")
                  .catch(() => {});
              }
            }

            // OAuth連携完了時: USER_UPDATED イベントでreal_emailを保存
            if (event === "USER_UPDATED") {
              const identities = session.user!.identities ?? [];
              const oauthIdentity = identities.find(
                (id) => id.provider === "google" || id.provider === "apple"
              );
              if (oauthIdentity) {
                const oauthEmail = oauthIdentity.identity_data?.['email'] as string | undefined;
                if (oauthEmail) {
                  supabase
                    .from("users")
                    .update({
                      real_email: oauthEmail,
                      oauth_provider: oauthIdentity.provider,
                      oauth_linked_at: new Date().toISOString(),
                    })
                    .eq("uid", userId)
                    .then(() => {}, () => {});
                }
              }
            }

            // プロフィール取得＋dispatch
            fetchAndDispatchProfile(userId, email);
          }, 0);
        } else {
          cachedProfile.current = null;
          dispatch({ type: "AUTH_CLEAR" });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // --- Context value (メモ化) ---
  const value = useMemo<AuthContextValue>(() => ({
    user: state.user,
    role: state.role,
    loading: state.loading,
    isAuthenticated: !!state.user && !state.authError,
    authError: state.authError,
    signIn,
    signOut,
  }), [state, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- useAuth hook ---

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
