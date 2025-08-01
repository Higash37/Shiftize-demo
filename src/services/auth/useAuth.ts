import { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { User } from "./auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebase-core";
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

      // Firestoreからユーザー情報を取得（自動生成メール + 実メール両方に対応）
      const { UserService } = await import("../firebase/firebase-user");
      const userInfo = await UserService.findUserByEmail(emailToUse);
      
      
      if (!userInfo) {
        throw new Error("ユーザーが見つかりません");
      }

      const userData = userInfo;

      // 削除フラグを確認
      if (userData.deleted) {
        throw new Error("このユーザーは削除されています");
      }

      // 店舗ID確認（実メールアドレスの場合はFirestoreのstoreIdを使用）
      if (emailFormatCheck) {
        storeIdToUse = userData.storeId;
      } else if (userData.storeId !== storeIdToUse) {
        throw new Error("店舗IDが一致しません");
      }

      // パスワード確認
      if (userData.currentPassword !== password) {
        throw new Error("パスワードが正しくありません");
      }

      // Firebase Authでのログイン
      const firebaseAuthEmail = emailFormatCheck ? emailToUse : userData.email;
      
      
      let userCredential;
      try {
        // 実メールアドレスの場合、入力されたパスワードでまず試行
        userCredential = await signInWithEmailAndPassword(
          getAuth(),
          firebaseAuthEmail,
          password
        );
      } catch (authError: any) {
        
        // 入力されたパスワードで失敗した場合、Firestoreのパスワードで試行
        if (emailFormatCheck && userData.currentPassword && userData.currentPassword !== password) {
          try {
            userCredential = await signInWithEmailAndPassword(
              getAuth(),
              firebaseAuthEmail,
              userData.currentPassword
            );
          } catch (firestorePasswordError: any) {
            authError = firestorePasswordError; // 最後のエラーを保持
          }
        }
        
        if (!userCredential) {
          
          // 実メールアドレスでログインしようとしてアカウントが見つからない場合、自動作成を試行
          if (emailFormatCheck && authError.code === 'auth/user-not-found') {
            try {
            const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
            
            // Firebase Authアカウントを作成（Firestoreのパスワードを使用）
            const newUserCredential = await createUserWithEmailAndPassword(
              getAuth(),
              firebaseAuthEmail,
              userData.currentPassword
            );
            
            // プロフィール更新
            await updateProfile(newUserCredential.user, {
              displayName: userData.nickname,
            });
            
            // Firestoreに実メールアドレス用のユーザードキュメントを作成
            const realEmailUserRef = doc(db, 'users', newUserCredential.user.uid);
            await setDoc(realEmailUserRef, {
              uid: newUserCredential.user.uid,
              nickname: userData.nickname,
              email: firebaseAuthEmail,
              role: userData.role,
              currentPassword: userData.currentPassword,
              color: userData.color,
              storeId: userData.storeId,
              hourlyWage: userData.hourlyWage,
              isActive: userData.isActive,
              createdAt: new Date(),
              updatedAt: new Date(),
              originalUserId: userData.id,
            });
            
            // 元のFirestoreドキュメントに実メールアドレス情報を追加
            const originalUserRef = doc(db, 'users', userData.id);
            await updateDoc(originalUserRef, {
              realEmail: firebaseAuthEmail,
              realEmailUserId: newUserCredential.user.uid,
              updatedAt: new Date(),
            });
            
            userCredential = newUserCredential;
          } catch (createError: any) {
            throw new Error("Firebase認証アカウントの作成に失敗しました: " + createError.message);
          }
          } else {
            throw new Error("Firebase認証に失敗しました: " + authError.message);
          }
        }
      }

      setUser({
        uid: userCredential.user.uid,
        nickname: userData.nickname,
        role: userData.role,
        email: userCredential.user.email || undefined,
        storeId: userData.storeId,
      });
      setRole(userData.role);
      setStoreId(userData.storeId);
      setAuthError(null);
    } catch (error: any) {
      setUser(null);
      setRole(null);
      setStoreId(null);
      setAuthError(error.message || "認証に失敗しました");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // セキュリティ: ログアウト時にCSRFトークンをクリア
      CSRFTokenManager.clearToken();
      
      await getAuth().signOut();
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

  // ユーザー情報取得のリトライロジック
  const fetchUserWithRetry = async (uid: string, email?: string | null, retries = 3): Promise<any> => {
    for (let i = 0; i < retries; i++) {
      try {
        // 直接UIDで検索
        const userDoc = await getDoc(doc(db, "users", uid));
        const userData = userDoc.data();
        if (userData) return userData;

        // メールアドレスで検索
        if (email) {
          const { UserService } = await import("../firebase/firebase-user");
          const userInfo = await UserService.findUserByEmail(email);
          if (userInfo) return userInfo;
        }
        
        return null;
      } catch (error) {
        console.error(`ユーザー情報取得エラー (試行 ${i + 1}/${retries}):`, error);
        
        // 最後の試行または永続的なエラーの場合はエラーを投げる
        if (i === retries - 1 || !isTemporaryError(error)) {
          throw error;
        }
        
        // リトライ前に待機（指数バックオフ）
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (firebaseUser) => {
      
      if (firebaseUser) {
        try {
          // リトライ付きでユーザー情報を取得
          const userData = await fetchUserWithRetry(firebaseUser.uid, firebaseUser.email);

          if (userData) {
            // 削除フラグを確認
            if (userData.deleted) {
              await getAuth().signOut();
              setUser(null);
              setRole(null);
              setStoreId(null);
              setAuthError("このユーザーは削除されています。");
              setLoading(false);
              return;
            }

            // storeIdが設定されている場合のみチェック（ログイン時のみ）
            // 既に認証済みの場合は、再度チェックしない
            const userStoreId = userData.storeId || storeId;

            setUser({
              uid: userData.id || firebaseUser.uid, // メール検索で見つかった場合は元のIDを使用
              nickname: userData.nickname,
              role: userData.role,
              email: firebaseUser.email || undefined,
              storeId: userStoreId,
            });
            setRole(userData.role);
            setStoreId(userStoreId);
            setAuthError(null); // 成功時はエラーをクリア
          } else {
            // リトライしても見つからない場合のみログアウト
            console.error("ユーザー情報が見つかりません（リトライ後）");
            await getAuth().signOut();
            setUser(null);
            setRole(null);
            setStoreId(null);
            setAuthError("ユーザー情報が見つかりません。");
          }
        } catch (error) {
          console.error("認証状態確認エラー:", error);
          
          // 一時的なエラーの場合は現在の状態を維持
          if (isTemporaryError(error)) {
            console.log("一時的なエラーのため、現在の認証状態を維持します");
            // エラー表示はしない（ユーザー体験を損なわないため）
          } else {
            // 永続的なエラーの場合のみログアウト
            await getAuth().signOut();
            setUser(null);
            setRole(null);
            setStoreId(null);
            setAuthError("認証エラーが発生しました。");
          }
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
    const auth = getAuth();
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
