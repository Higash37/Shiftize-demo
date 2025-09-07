import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithCustomToken,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { User } from "./auth";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db, functions } from "../firebase/firebase-core";
import { StoreIdStorage } from "@/common/common-utils/util-storage/StoreIdStorage";
import { validateEmail, validatePassword } from "@/common/common-utils/validation/inputValidation";
import { SecurityLogger, RateLimiter, CSRFTokenManager } from "@/common/common-utils/security/securityUtils";

// 一時的なエラーかどうかを判定
const isTemporaryError = (error: any): boolean => {
  const temporaryErrors = [
    'permission-denied',
    'network-request-failed',
    'unavailable',
    'cancelled',
    'aborted'
  ];
  const errorCode = error?.code?.toLowerCase() || '';
  return temporaryErrors.some(e => errorCode.includes(e));
};

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
      // セキュリティ検証
      const clientId = `${navigator.userAgent}_${window.location.origin}`;
      
      // レート制限チェック
      if (!RateLimiter.isAllowed(clientId)) {
        SecurityLogger.logEvent({
          type: 'rate_limit_exceeded',
          details: 'Login rate limit exceeded',
          userAgent: navigator.userAgent,
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

      // パスワード基本検証（完全検証は新規登録時のみ）
      if (password.length < 6) {
        SecurityLogger.logEvent({
          type: 'invalid_input',
          details: 'Password too short',
        });
        throw new Error("パスワードは6文字以上で入力してください");
      }
      let emailToUse = emailOrUsernameWithStore;
      let storeIdToUse = storeId;

      // メールアドレス形式かどうかを判定
      const emailFormatCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsernameWithStore);
      
      if (!emailFormatCheck) {
        // 従来の店舗ID + ニックネーム形式の場合
        if (!storeId) {
          throw new Error("店舗IDが必要です");
        }
        // 自動生成メールアドレス形式に変換
        emailToUse = `${storeId}${emailOrUsernameWithStore}@example.com`;
        storeIdToUse = storeId;
      }

      // 🔒 セキュアログイン: Cloud Function経由でサーバーサイド認証
      const secureLoginFunction = httpsCallable(functions, 'secureLogin');
      
      const loginResult = await secureLoginFunction({
        email: emailToUse,
        password: password,
        storeId: storeIdToUse
      });
      
      const { customToken, user: userData } = loginResult.data as any;
      
      if (!customToken || !userData) {
        throw new Error("認証に失敗しました");
      }

      // Firebase Authカスタムトークンでサインイン  
      const userCredential = await signInWithCustomToken(auth, customToken);

      // ✅ 認証成功: ユーザー情報を設定
      setUser({
        uid: userData.uid,
        nickname: userData.nickname,
        email: userData.email,
        role: userData.role,
        storeId: userData.storeId,
      });
      setRole(userData.role);
      setStoreId(userData.storeId);

      // 店舗IDを保存
      await StoreIdStorage.saveStoreId(userData.storeId);

      // セキュリティ: ログイン成功ログ
      SecurityLogger.logEvent({
        type: 'system_event',
        details: `User ${userData.nickname} logged in successfully`,
        userAgent: navigator.userAgent,
      });

    } catch (error: any) {
      console.error("ログインエラー:", error);
      setUser(null);
      setRole(null);
      setStoreId(null);
      
      // エラーメッセージの処理
      let errorMessage = "ログインに失敗しました";
      if (error.code === 'functions/not-found') {
        errorMessage = "ユーザーが見つかりません";
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage = "パスワードが正しくありません";
      } else if (error.code === 'functions/invalid-argument') {
        errorMessage = "入力内容を確認してください";
      } else if (error.message) {
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
      
      await auth.signOut();
      // ログアウト時は店舗IDを保持する（ユーザーが明示的にログアウトした場合のみクリア）
      setUser(null);
      setRole(null);
      setStoreId(null);
      setAuthError(null);

      // セキュリティ: ログアウトログ
      SecurityLogger.logEvent({
        type: 'user_logout',
        details: 'User logged out',
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      throw error;
    }
  };

  // 🔒 セキュア版: サーバーサイドでユーザー情報取得済み
  const fetchUserWithRetry = async (uid: string, email?: string | null, retries = 3): Promise<any> => {
    try {
      // 直接UIDで検索（カスタムトークンで認証済みなので安全）
      const userDoc = await getDoc(doc(db, "users", uid));
      const userData = userDoc.data();
      return userData || null;
    } catch (error) {
      console.error('User fetch error:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      
      if (firebaseUser) {
        try {
          // 🔒 カスタムトークンで認証済みなのでユーザー情報を安全取得
          const userData = await fetchUserWithRetry(firebaseUser.uid, firebaseUser.email);

          if (userData) {
            // 削除フラグを確認
            if (userData.deleted) {
              await auth.signOut();
              setUser(null);
              setRole(null);
              setStoreId(null);
              setAuthError("このユーザーは削除されています。");
              setLoading(false);
              return;
            }

            // カスタムトークンにstoreId情報が含まれている
            const userStoreId = userData.storeId;

            setUser({
              uid: firebaseUser.uid,
              nickname: userData.nickname,
              role: userData.role,
              email: firebaseUser.email || "",
              storeId: userStoreId,
            });
            setRole(userData.role);
            setStoreId(userStoreId);
            setAuthError(null);
          } else {
            // ユーザー情報が見つからない場合はログアウト
            await auth.signOut();
            setUser(null);
            setRole(null);
            setStoreId(null);
            setAuthError("ユーザー情報が見つかりません。");
          }
        } catch (error) {
          console.error("認証状態確認エラー:", error);
          
          // エラーの場合はログアウト
          await auth.signOut();
          setUser(null);
          setRole(null);
          setStoreId(null);
          setAuthError("認証エラーが発生しました。");
        }
      } else {
        setUser(null);
        setRole(null);
        setStoreId(null);
        setAuthError(null); // ログアウト時はエラーをクリア
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // 依存関係を空にして、初回のみ実行

  return {
    user,
    loading,
    isAuthenticated: !!user && !authError, // エラーがある場合は認証済みとしない
    role,
    authError, // エラー状態を返す
    signIn,
    signOut,
  };
};

/**
 * 認証トークンを取得（API呼び出し用）
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return null;
    }
    
    // Firebase ID トークンを取得
    const token = await currentUser.getIdToken();
    return token;
    
  } catch (error) {
    return null;
  }
};
