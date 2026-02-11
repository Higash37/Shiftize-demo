import { useState, useEffect } from "react";
import { User } from "./auth";
import { ServiceProvider } from "../ServiceProvider";
import { getSupabase } from "../supabase/supabase-client";
import { StoreIdStorage } from "@/common/common-utils/util-storage/StoreIdStorage";
import { validateEmail } from "@/common/common-utils/validation/inputValidation";
import { SecurityLogger, RateLimiter, CSRFTokenManager } from "@/common/common-utils/security/securityUtils";
import { toAsciiEmail } from "@/services/supabase/utils/asciiEmail";

// プラットフォーム安全なユーザーエージェント取得（React Native対応）
const getSafeUserAgent = () => typeof navigator !== "undefined" ? navigator.userAgent : "react-native";
const getSafeOrigin = () => typeof window !== "undefined" && window.location ? window.location.origin : "app";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"master" | "user" | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const signIn = async (
    emailOrUsernameWithStore: string,
    password: string,
    storeId?: string
  ) => {
    setAuthError(null);

    try {
      // セキュリティ検証（React Native環境ではwindow/navigatorが存在しない場合がある）
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

      // Supabase Auth ネイティブでサインイン（ServiceProvider経由）
      const userData = await ServiceProvider.auth.signIn(emailToUse, password);

      setUser({
        uid: userData.uid,
        nickname: userData.nickname,
        email: userData.email || "",
        role: userData.role,
        storeId: userData.storeId || "",
      });
      setRole(userData.role);
      setStoreId(userData.storeId || null);

      // 店舗IDを保存
      if (userData.storeId) {
        await StoreIdStorage.saveStoreId(userData.storeId);
      }

      // セキュリティ: ログイン成功ログ
      SecurityLogger.logEvent({
        type: 'system_event',
        details: `User ${userData.nickname} logged in successfully`,
        userAgent,
      });

    } catch (error: any) {
      setUser(null);
      setRole(null);
      setStoreId(null);

      let errorMessage = "ログインに失敗しました";
      if (error.message) {
        errorMessage = error.message;
      }

      setAuthError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      // セキュリティ: ログアウト時にCSRFトークンをクリア
      CSRFTokenManager.clearToken();

      await ServiceProvider.auth.signOut();
      setUser(null);
      setRole(null);
      setStoreId(null);
      setAuthError(null);

      // セキュリティ: ログアウトログ
      SecurityLogger.logEvent({
        type: 'user_logout',
        details: 'User logged out',
        userAgent: getSafeUserAgent(),
      });
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const supabase = getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // OAuth連携完了時: USER_UPDATED イベントでreal_emailを保存
        if (event === "USER_UPDATED" && session?.user) {
          const identities = session.user.identities ?? [];
          const oauthIdentity = identities.find(
            (id) => id.provider === "google" || id.provider === "apple"
          );
          if (oauthIdentity) {
            const oauthEmail = oauthIdentity.identity_data?.['email'] as string | undefined;
            if (oauthEmail) {
              try {
                await supabase
                  .from("users")
                  .update({
                    real_email: oauthEmail,
                    oauth_provider: oauthIdentity.provider,
                    oauth_linked_at: new Date().toISOString(),
                  })
                  .eq("uid", session.user.id);
              } catch (_) {
                // OAuth連携のDB更新失敗はサイレントに処理
              }
            }
          }
        }

        if (session?.user) {
          try {
            // ServiceProvider経由でユーザー情報取得
            const userData = await ServiceProvider.users.getUserFullProfile(session.user.id);

            if (userData) {
              // 削除フラグを確認
              if (userData['deleted']) {
                await ServiceProvider.auth.signOut();
                setUser(null);
                setRole(null);
                setStoreId(null);
                setAuthError("このユーザーは削除されています。");
                setLoading(false);
                return;
              }

              const nickname = userData['nickname'] as string || "";
              const userRole = (userData['role'] as "master" | "user") || "user";

              setUser({
                uid: session.user.id,
                nickname,
                role: userRole,
                email: session.user.email || "",
                storeId: userData.storeId || "",
              });
              setRole(userRole);
              setStoreId(userData.storeId || null);
              setAuthError(null);
            } else {
              await ServiceProvider.auth.signOut();
              setUser(null);
              setRole(null);
              setStoreId(null);
              setAuthError("ユーザー情報が見つかりません。");
            }
          } catch {
            await ServiceProvider.auth.signOut();
            setUser(null);
            setRole(null);
            setStoreId(null);
            setAuthError("認証エラーが発生しました。");
          }
        } else {
          setUser(null);
          setRole(null);
          setStoreId(null);
          setAuthError(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user && !authError,
    role,
    authError,
    signIn,
    signOut,
  };
};

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
