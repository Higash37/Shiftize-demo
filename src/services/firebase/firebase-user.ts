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
import { PersonalDataDeletion } from "@/common/common-utils/security/encryptionUtils";
import { SecurityLogger } from "@/common/common-utils/security/securityUtils";

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
          role: data['role'] || "user",
          nickname: data['nickname'] || "",
          email: data['email'], // メールアドレスを追加
          color: data['color'], // 追加
          storeId: data['storeId'] || "", // storeIdを追加
          currentPassword: data['currentPassword'],
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
          nickname: data['nickname'],
          role: data['role'],
          email: data['email'],
          currentPassword: data['currentPassword'],
          createdAt: data['createdAt'].toDate(),
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
      if (userData['realEmail']) {
        throw new Error('実際のメールアドレスは既に設定されています');
      }

      // 4. Firebase Authに実メールアドレスでの新しいアカウントを作成
      const { createUserWithEmailAndPassword, getAuth, updateProfile } = await import('firebase/auth');
      const { initializeApp, deleteApp } = await import('firebase/app');
      const { firebaseConfig } = await import('./firebase-core');
      
      // 一時的なFirebaseアプリインスタンスを作成（現在のセッションに影響しないように）
      const tempApp = initializeApp(firebaseConfig, "temp-app-" + Date.now());
      const tempAuth = getAuth(tempApp);

      try {
        // 実メールアドレスでFirebase Authアカウント作成
        const userCredential = await createUserWithEmailAndPassword(
          tempAuth,
          realEmail,
          userData['currentPassword'] // 既存のパスワードを使用
        );

        // プロフィール更新
        await updateProfile(userCredential.user, {
          displayName: userData['nickname'],
        });

        // 5. Firestoreに実メールアドレス用の新しいユーザードキュメント作成
        const realEmailUserRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(realEmailUserRef, {
          uid: userCredential.user.uid,
          nickname: userData['nickname'],
          email: realEmail, // 実メールアドレスをemailフィールドに
          role: userData['role'],
          currentPassword: userData['currentPassword'],
          color: userData['color'],
          storeId: userData['storeId'],
          hourlyWage: userData['hourlyWage'],
          isActive: userData['isActive'],
          createdAt: userData['createdAt'],
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
      
      if (!emailSnapshot.empty && emailSnapshot.docs.length > 0) {
        const userDoc = emailSnapshot.docs[0];
        if (userDoc) {
          const userData = { id: userDoc.id, ...userDoc.data() };
        
        // 実メールアドレス用のアカウントの場合、元のアカウント情報を取得
        if ((userData as any).originalUserId) {
          const originalUserRef = doc(db, 'users', (userData as any).originalUserId);
          const originalUserDoc = await getDoc(originalUserRef);
          
          if (originalUserDoc.exists()) {
            const originalData = originalUserDoc.data();
            // 元のアカウント情報を返すが、実メールアドレスも含める
            return {
              id: originalUserDoc.id,
              ...(originalData as any),
              realEmail: email, // 実メールアドレスを追加
              realEmailUserId: userData.id, // 実メールアカウントのUIDも保存
            };
          }
        }
        
          return userData;
        }
      }

      // 2. realEmailフィールドで検索（実メール）
      const realEmailQuery = query(usersRef, where('realEmail', '==', email));
      const realEmailSnapshot = await getDocs(realEmailQuery);
      
      if (!realEmailSnapshot.empty && realEmailSnapshot.docs.length > 0) {
        const userDoc = realEmailSnapshot.docs[0];
        if (userDoc) {
          const userData = { id: userDoc.id, ...userDoc.data() };
          return userData;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  },

  /**
   * ユーザーデータの完全削除（GDPR対応）
   */
  secureDeleteUser: async (userId: string, storeId: string): Promise<void> => {
    try {
      await PersonalDataDeletion.deleteUserData(userId, storeId);
      
      SecurityLogger.logEvent({
        type: 'unauthorized_access',
        userId: userId,
        details: 'User requested data deletion (GDPR)',
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      SecurityLogger.logEvent({
        type: 'unauthorized_access',
        userId: userId,
        details: `Data deletion failed: ${error}`,
        userAgent: navigator.userAgent,
      });
      throw error;
    }
  },

  /**
   * 管理者による他ユーザーデータの削除
   */
  secureDeleteUserByAdmin: async (targetUserId: string, storeId: string, adminUserId: string): Promise<void> => {
    try {
      // 管理者権限の確認
      const adminUser = await UserService.getUserData(adminUserId);
      if (!adminUser || adminUser.role !== 'master') {
        throw new Error('管理者権限が必要です');
      }

      await PersonalDataDeletion.deleteUserDataByAdmin(targetUserId, storeId, adminUserId);
      
      SecurityLogger.logEvent({
        type: 'unauthorized_access',
        userId: adminUserId,
        details: `Admin deleted user: ${targetUserId}`,
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      SecurityLogger.logEvent({
        type: 'unauthorized_access',
        userId: adminUserId,
        details: `Admin deletion failed: ${error}`,
        userAgent: navigator.userAgent,
      });
      throw error;
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
  secureDeleteUser,
  secureDeleteUserByAdmin,
} = UserService;
