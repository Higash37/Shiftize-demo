import { useState, useEffect } from "react";
import {
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
import { auth, db } from "../../services/firebase/firebase-core";
import { StoreIdStorage } from "@/common/common-utils/util-storage/StoreIdStorage";
import { validateEmail, validatePassword } from "@/common/common-utils/validation/inputValidation";
import { SecurityLogger, RateLimiter, CSRFTokenManager } from "@/common/common-utils/security/securityUtils";

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
      const { UserService } = await import("../../services/firebase/firebase-user");
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
          auth,
          firebaseAuthEmail,
          password
        );
      } catch (authError: any) {
        
        // 入力されたパスワードで失敗した場合、Firestoreのパスワードで試行
        if (emailFormatCheck && userData.currentPassword && userData.currentPassword !== password) {
          try {
            userCredential = await signInWithEmailAndPassword(
              auth,
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
              auth,
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
              role: userData["role"],
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
        ...(userCredential.user.email ? { email: userCredential.user.email } : {}),
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
      
      await auth.signOut();
      // ログアウト時は店舗IDを保持する（ユーザーが明示的にログアウトした場合のみクリア）
      setUser(null);
      setRole(null);
      setStoreId(null);
      setAuthError(null);

      // セキュリティ: ログアウトログ
      SecurityLogger.logEvent({
        type: 'unauthorized_access',
        details: 'User logged out',
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      
      if (firebaseUser) {
        
        let userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        let userData = userDoc.data();


        // 直接UIDで見つからない場合、メールアドレスで検索
        if (!userData && firebaseUser.email) {
          const { UserService } = await import("../../services/firebase/firebase-user");
          const userInfo = await UserService.findUserByEmail(firebaseUser.email);
          
          if (userInfo) {
            userData = userInfo;
          }
        }

        if (userData) {
          // 削除フラグを確認
          if (userData["deleted"]) {
            await auth.signOut();
            setUser(null);
            setRole(null);
            setStoreId(null);
            setAuthError("このユーザーは削除されています。");
            return;
          }

          // storeIdが設定されている場合のみチェック（ログイン時のみ）
          // 既に認証済みの場合は、再度チェックしない
          const userStoreId = userData["storeId"] || storeId;

          setUser({
            uid: userData["id"] || firebaseUser.uid, // メール検索で見つかった場合は元のIDを使用
            nickname: userData["nickname"],
            role: userData["role"],
            ...(firebaseUser.email ? { email: firebaseUser.email } : {}),
            storeId: userStoreId,
          });
          setRole(userData["role"]);
          setStoreId(userStoreId);
          setAuthError(null); // 成功時はエラーをクリア
        } else {
          // Firebase認証をログアウト
          await auth.signOut();
          setUser(null);
          setRole(null);
          setStoreId(null);
          setAuthError("ユーザー情報が見つかりません。");
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
