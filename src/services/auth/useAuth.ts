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
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebase-core";
import { StoreIdStorage } from "@/common/common-utils/util-storage/StoreIdStorage";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"master" | "user" | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const signIn = async (email: string, password: string, storeId: string) => {
    setAuthError(null);

    try {
      // Firestoreからユーザー情報を取得
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("email", "==", email));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        throw new Error("ユーザーが見つかりません");
      }

      const userData = userSnapshot.docs[0].data();

      // 削除フラグを確認
      if (userData.deleted) {
        throw new Error("このユーザーは削除されています");
      }

      // storeIdの一致を確認
      if (userData.storeId !== storeId) {
        throw new Error("店舗IDが一致しません");
      }

      if (userData.currentPassword !== password) {
        throw new Error("パスワードが正しくありません");
      }

      // Firebase Authでのログイン（入力されたパスワードを使用）
      const userCredential = await signInWithEmailAndPassword(
        getAuth(),
        email,
        password
      );

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
      await getAuth().signOut();
      // ログアウト時は店舗IDを保持する（ユーザーが明示的にログアウトした場合のみクリア）
      setUser(null);
      setRole(null);
      setStoreId(null);
      setAuthError(null);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = userDoc.data();

        if (userData) {
          // 削除フラグを確認
          if (userData.deleted) {
            await getAuth().signOut();
            setUser(null);
            setRole(null);
            setStoreId(null);
            setAuthError("このユーザーは削除されています。");
            return;
          }

          // storeIdが設定されている場合のみチェック（ログイン時のみ）
          // 既に認証済みの場合は、再度チェックしない
          const userStoreId = userData.storeId || storeId;

          setUser({
            uid: firebaseUser.uid,
            nickname: userData.nickname,
            role: userData.role,
            email: firebaseUser.email || undefined,
            storeId: userStoreId,
          });
          setRole(userData.role);
          setStoreId(userStoreId);
          setAuthError(null); // 成功時はエラーをクリア
        } else {
          // Firebase認証をログアウト
          await getAuth().signOut();
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
