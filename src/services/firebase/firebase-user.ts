/**
 * Firebase ユーザー管理モジュール
 *
 * ユーザーデータの取得・管理を提供します。
 */

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { User, UserData } from "@/common/common-models/model-user/UserModel";
import { db } from "./firebase-core";

/**
 * ユーザー管理サービス
 * ユーザーデータの取得・管理を提供します
 */
export const UserService = {
  /**
   * 全ユーザーの一覧を取得します
   */
  getUsers: async (
    storeId?: string
  ): Promise<(User & { currentPassword?: string })[]> => {
    try {
      const usersRef = collection(db, "users");
      let q = query(usersRef);

      // storeIdが指定されている場合はフィルタリング
      if (storeId) {
        q = query(usersRef, where("storeId", "==", storeId));
      }

      const snapshot = await getDocs(q);
      const users = snapshot.docs.map((doc) => {
        const data = doc.data();
        const user = {
          uid: doc.id,
          role: data.role || "user",
          nickname: data.nickname || "",
          email: data.email, // メールアドレスを追加
          color: data.color, // 追加
          storeId: data.storeId || "", // storeIdを追加
          currentPassword: data.currentPassword,
        };
        
        
        return user;
      });
      
      return users;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ユーザーを削除します
   */
  deleteUser: async (id: string): Promise<void> => {
    try {
      const userRef = doc(db, "users", id);
      await deleteDoc(userRef);
    } catch (error) {
      throw error;
    }
  },
  /**
   * ユーザーデータを取得します
   */ getUserData: async (userId: string): Promise<UserData | null> => {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          nickname: data.nickname,
          role: data.role,
          email: data.email,
          currentPassword: data.currentPassword,
          createdAt: data.createdAt.toDate(),
        };
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  /**
   * マスターユーザーが存在するか確認します
   */
  checkMasterExists: async (): Promise<boolean> => {
    try {
      const usersRef = collection(db, "users");
      const masterQuery = query(usersRef, where("role", "==", "master"));
      const masterSnapshot = await getDocs(masterQuery);
      return !masterSnapshot.empty;
    } catch (error) {
      throw error;
    }
  },

  /**
   * メールアドレスが既に使用されているか確認します
   */
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, "users");
      const emailQuery = query(usersRef, where("email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);
      return !emailSnapshot.empty;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 既存ユーザーに実際のメールアドレスを追加
   * デュアルメールログイン対応（自動生成メール + 実メール両方でログイン可能）
   */
  addSecondaryEmail: async (userId: string, realEmail: string): Promise<void> => {
    try {
      // 1. メールアドレスの重複チェック
      await UserService.checkEmailDuplicate(realEmail);

      // 2. 既存ユーザー情報を取得
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('ユーザーが見つかりません');
      }

      const userData = userDoc.data();

      // 3. 既に実メールアドレスが設定されているかチェック
      if (userData.realEmail) {
        throw new Error('実際のメールアドレスは既に設定されています');
      }

      // 4. Firebase Authに実メールアドレスでの新しいアカウントを作成
      const { createUserWithEmailAndPassword, initializeApp, getAuth, updateProfile, deleteApp } = await import('firebase/auth');
      const { firebaseConfig } = await import('./firebase-core');
      
      // 一時的なFirebaseアプリインスタンスを作成（現在のセッションに影響しないように）
      const tempApp = initializeApp(firebaseConfig, "temp-app-" + Date.now());
      const tempAuth = getAuth(tempApp);

      try {
        // 実メールアドレスでFirebase Authアカウント作成
        const userCredential = await createUserWithEmailAndPassword(
          tempAuth,
          realEmail,
          userData.currentPassword // 既存のパスワードを使用
        );

        // プロフィール更新
        await updateProfile(userCredential.user, {
          displayName: userData.nickname,
        });

        // 5. Firestoreに実メールアドレス用の新しいユーザードキュメント作成
        const realEmailUserRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(realEmailUserRef, {
          uid: userCredential.user.uid,
          nickname: userData.nickname,
          email: realEmail, // 実メールアドレスをemailフィールドに
          role: userData.role,
          currentPassword: userData.currentPassword,
          color: userData.color,
          storeId: userData.storeId,
          hourlyWage: userData.hourlyWage,
          isActive: userData.isActive,
          createdAt: userData.createdAt,
          updatedAt: new Date(),
          // 元のアカウントへの参照
          originalUserId: userId,
        });

        // 6. 元のFirestoreドキュメントに実メールアドレス情報を追加
        await updateDoc(userRef, {
          realEmail: realEmail,
          realEmailUserId: userCredential.user.uid, // 実メールアカウントのUID
          updatedAt: new Date(),
        });


        // 一時的なアプリを削除
        await deleteApp(tempApp);

      } catch (authError) {
        // Firebase Authでエラーが発生した場合、一時的なアプリを削除
        try {
          await deleteApp(tempApp);
        } catch (deleteError) {
        }
        throw authError;
      }

    } catch (error) {
      throw error;
    }
  },

  /**
   * メールアドレスの重複チェック（自動生成メール + 実メール両方）
   */
  checkEmailDuplicate: async (email: string): Promise<void> => {
    try {
      const usersRef = collection(db, 'users');
      
      // emailフィールドでチェック（自動生成メールと実メール両方含む）
      const emailQuery = query(usersRef, where('email', '==', email));
      const emailSnapshot = await getDocs(emailQuery);
      
      if (!emailSnapshot.empty) {
        throw new Error('このメールアドレスは既に使用されています');
      }

    } catch (error) {
      throw error;
    }
  },

  /**
   * メールアドレスでユーザーを検索（両方のメールアドレスタイプに対応）
   */
  findUserByEmail: async (email: string): Promise<any | null> => {
    try {
      const usersRef = collection(db, 'users');
      
      // 1. emailフィールドで検索（自動生成メール）
      const emailQuery = query(usersRef, where('email', '==', email));
      const emailSnapshot = await getDocs(emailQuery);
      
      if (!emailSnapshot.empty) {
        const doc = emailSnapshot.docs[0];
        const userData = { id: doc.id, ...doc.data() };
        
        // 実メールアドレス用のアカウントの場合、元のアカウント情報を取得
        if (userData.originalUserId) {
          const originalUserRef = doc(db, 'users', userData.originalUserId);
          const originalUserDoc = await getDoc(originalUserRef);
          
          if (originalUserDoc.exists()) {
            const originalData = originalUserDoc.data();
            // 元のアカウント情報を返すが、実メールアドレスも含める
            return {
              id: originalUserDoc.id,
              ...originalData,
              realEmail: email, // 実メールアドレスを追加
              realEmailUserId: userData.id, // 実メールアカウントのUIDも保存
            };
          }
        }
        
        return userData;
      }

      // 2. realEmailフィールドで検索（実メール）
      const realEmailQuery = query(usersRef, where('realEmail', '==', email));
      const realEmailSnapshot = await getDocs(realEmailQuery);
      
      if (!realEmailSnapshot.empty) {
        const doc = realEmailSnapshot.docs[0];
        const userData = { id: doc.id, ...doc.data() };
        return userData;
      }

      return null;
    } catch (error) {
      return null;
    }
  },
};

// エクスポート
export const {
  getUsers,
  deleteUser,
  getUserData,
  checkMasterExists,
  checkEmailExists,
  findUserByEmail,
} = UserService;
