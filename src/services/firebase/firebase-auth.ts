/**
 * Firebase 認証モジュール
 *
 * スタッフの認証と権限管理を提供します。
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  updatePassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  Auth,
  getAuth,
} from "firebase/auth";

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";

import { User } from "@/common/common-models/model-user/UserModel";
import { auth, db, firebaseConfig } from "./firebase-core";

/**
 * 認証関連のサービス
 * スタッフの認証と権限管理を提供します
 */
export const AuthService = {
  /**
   * ユーザーサインイン
   * 認証状態が反映されるまで onAuthStateChanged で待機してからユーザー情報を返す
   */
  signIn: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // 認証状態が反映されるまで待つ
      await new Promise<void>((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(
          (firebaseUser) => {
            if (firebaseUser) {
              unsubscribe();
              resolve();
            }
          },
          (error) => {
            unsubscribe();
            reject(error);
          }
        );
      });
      // 認証状態が反映された後にユーザー情報を返す
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error("認証ユーザーが取得できませんでした");
      // 🔒 セキュリティ強化：Firestoreからロール情報を取得
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!userDoc.exists()) {
        throw new Error("ユーザー情報が見つかりません");
      }
      
      const userData = userDoc.data();
      return {
        uid: firebaseUser.uid,
        nickname: firebaseUser.displayName || userData['nickname'] || email.split("@")[0],
        role: userData['role'], // Firestoreから正確なロール情報を取得
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * ユーザーのロールを判定 - 🔒 セキュリティ強化版
   */
  getUserRole: async (user: any) => {
    try {
      // Firestoreからロール情報を安全に取得
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        throw new Error("ユーザー情報が見つかりません");
      }
      
      const userData = userDoc.data();
      const role = userData['role'];
      
      // ロール値の検証
      if (role !== "master" && role !== "user") {
        throw new Error("無効なロール情報です");
      }
      
      return role;
    } catch (error) {
      // フォールバック: セキュリティ上、デフォルトは最低権限
      return "user";
    }
  },

  /**
   * ユーザーのサインアウト
   */
  signOut: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  /**
   * 新しいユーザーを作成
   * 管理者権限でユーザーを作成し、現在のログインセッションを維持します
   */
  createUser: async (
    email: string,
    password: string,
    nickname?: string,
    color?: string,
    storeId?: string,
    role?: "master" | "user",
    hourlyWage?: number
  ): Promise<User> => {
    try {
      // 現在のユーザー情報を保存
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('❌ [createUser] No current user found');
        throw new Error("管理者としてログインしている必要があります");
      }

      // 一時的なFirebaseアプリインスタンスを作成
      const tempApp = initializeApp(firebaseConfig, "temp-app-" + Date.now());
      const tempAuth = getAuth(tempApp);

      try {
        // Firebase Auth処理開始

        // 1. 一時的なインスタンスでユーザーを作成
        const userCredential = await createUserWithEmailAndPassword(
          tempAuth,
          email,
          password
        );

        const firebaseUser = userCredential.user;

        // ニックネームを決定
        const displayName = nickname || email.split("@")[0];

        // 2. ユーザープロファイルを更新（一時的なインスタンス上で）
        if (displayName !== undefined) {
          await updateProfile(firebaseUser, {
            displayName: displayName,
          });
        }

        // 3. Firestoreにユーザー情報を保存（メインのdbインスタンスを使用）
        const userRef = doc(db, "users", firebaseUser.uid);
        // 🔒 セキュリティ強化：ロール判定をより安全に
        // UserFormから渡されるroleを使用（デフォルトは"user"）
        const userRole = role || "user";
        
        // 🔒 セキュリティ強化：パスワードハッシュ化
        const { AESEncryption } = await import("@/common/common-utils/security/encryptionUtils");
        const hashedPassword = AESEncryption.hashPassword(password);

        const userData: any = {
          uid: firebaseUser.uid, // Firestoreルールで必須（ドキュメントIDと一致検証）
          nickname: displayName,
          role: userRole,
          hashedPassword: hashedPassword, // ハッシュ化パスワードを使用
          currentPassword: password, // 平文パスワード（既存システムとの互換性のため）
          email: email,
          color: color || "#4A90E2", // デフォルト色を設定
          storeId: storeId || "", // storeIdを必須として設定
          connectedStores: [], // 空配列で初期化
          hourlyWage: hourlyWage || 1000, // デフォルト時給
          createdAt: new Date(),
          updatedAt: new Date(), // updatedAtを追加
        };

        try {
          await setDoc(userRef, userData);
        } catch (firestoreError: any) {
          console.error('❌ [createUser] Failed to save user data to Firestore:', firestoreError);
          // Firebase Authからユーザーを削除（ロールバック）
          try {
            await firebaseUser.delete();
          } catch (deleteError) {
            console.error('❌ [createUser] Failed to delete Firebase Auth user:', deleteError);
          }
          throw new Error(`ユーザー情報の保存に失敗しました: ${firestoreError.message}`);
        }

        // 4. 一時的なアプリを削除
        await deleteApp(tempApp);

        // 5. 作成されたユーザー情報を返す
        const result = {
          uid: firebaseUser.uid,
          nickname: displayName || email.split("@")[0] || "Unknown User",
          role: userRole,
          color: color || "#FFD700",
          storeId: storeId || "",
        };
        return result;
      } catch (error: any) {
        console.error('❌ [createUser] Error in Firebase Auth process:', error);

        // エラーが発生した場合は一時的なアプリを削除
        try {
          await deleteApp(tempApp);
        } catch (deleteError) {
          console.error('❌ [createUser] Failed to delete temporary app:', deleteError);
        }
        throw error;
      }
    } catch (error: any) {
      // より詳細なエラーメッセージ
      const errorMessage = `ユーザー作成に失敗しました: ${error.code || 'UNKNOWN'} - ${error.message}`;
      console.error('❌ [createUser] Final error:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * 既存ユーザーを更新
   */
  updateUser: async (
    user: User,
    updates: {
      nickname?: string;
      email?: string; // メールアドレス更新を追加
      password?: string;
      role?: "master" | "user";
      color?: string;
      storeId?: string;
    }
  ): Promise<User | undefined> => {
    try {
      const userRef = doc(db, "users", user.uid);
      const updateData: { [key: string]: any } = {};

      if (updates.nickname) {
        updateData['nickname'] = updates.nickname;
        updateData['displayName'] = updates.nickname;
      }
      if (updates.email) {
        // 実メールアドレスは別フィールドに保存（元のemailフィールドは変更しない）
        updateData['realEmail'] = updates.email;
        
        // 現在のユーザーデータを取得してパスワードを確認
        const currentUserData = await getDoc(userRef);
        if (currentUserData.exists()) {
          const userData = currentUserData.data();
          const passwordToUse = updates.password || userData['currentPassword'];
          
          // Firebase Authに実メールアドレスでの新しいアカウントを作成
          await AuthService.createSecondaryEmailAccount(user, updates.email, passwordToUse);
        }
      }
      if (updates.role) updateData['role'] = updates.role;
      if (updates.password) updateData['currentPassword'] = updates.password;
      if (updates.color) updateData['color'] = updates.color;
      if (updates.storeId) updateData['storeId'] = updates.storeId;

      await updateDoc(userRef, updateData);

      // Firebase Authenticationの更新
      const currentUser = auth.currentUser;
      if (currentUser) {
        if (updates.nickname) {
          await updateProfile(currentUser, {
            displayName: updates.nickname,
          });
        }

        if (updates.password) {
          // パスワード更新時のセキュリティ強化
          const userDoc = await getDoc(userRef);
          const userData = userDoc.data();
          
          // レガシー平文パスワードサポート（移行期間のみ）
          let currentPasswordForAuth = userData?.['currentPassword'];
          
          // ハッシュ化されたパスワードが存在する場合は無視（Firebase Authは平文が必要）
          if (userData?.['hashedPassword'] && !currentPasswordForAuth) {
            throw new Error("パスワード更新にはセキュア認証を使用してください");
          }
          
          if (currentPasswordForAuth) {
            try {
              const credential = EmailAuthProvider.credential(
                currentUser.email!,
                currentPasswordForAuth
              );
              await reauthenticateWithCredential(currentUser, credential);
              await updatePassword(currentUser, updates.password);
              
              // 🔒 新しいパスワードをハッシュ化して保存
              const { AESEncryption } = await import("@/common/common-utils/security/encryptionUtils");
              const hashedPassword = AESEncryption.hashPassword(updates.password);
              
              await updateDoc(userRef, {
                hashedPassword: hashedPassword,
                currentPassword: null, // 平文パスワードを削除
              });
            } catch (error) {
              throw new Error("パスワードの更新に失敗しました");
            }
          }
        }
      }

      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        const data = updatedDoc.data();
        return {
          uid: updatedDoc.id,
          role: data['role'] as "master" | "user",
          nickname: data['nickname'] || "",
          email: data['email'], // メールアドレスを追加
          color: data['color'],
          storeId: data['storeId'],
        };
      }
      return undefined;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 実メールアドレス用のFirebase Authアカウントを作成
   */
  createSecondaryEmailAccount: async (
    originalUser: any,
    realEmail: string,
    password: string
  ): Promise<void> => {
    try {

      // 一時的なFirebaseアプリインスタンスを作成
      const tempApp = initializeApp(firebaseConfig, "temp-app-secondary-" + Date.now());
      const tempAuth = getAuth(tempApp);

      try {
        // 実メールアドレスでFirebase Authアカウント作成
        const userCredential = await createUserWithEmailAndPassword(
          tempAuth,
          realEmail,
          password
        );

        // プロフィール更新
        await updateProfile(userCredential.user, {
          displayName: originalUser.nickname,
        });

        // Firestoreに実メールアドレス用の新しいユーザードキュメント作成
        const realEmailUserRef = doc(db, 'users', userCredential.user.uid);
        const userData: any = {
          uid: userCredential.user.uid,
          nickname: originalUser.nickname,
          email: realEmail, // 実メールアドレス
          role: originalUser.role,
          hashedPassword: await (async () => {
            const { AESEncryption } = await import("@/common/common-utils/security/encryptionUtils");
            return AESEncryption.hashPassword(password);
          })(), // ハッシュ化パスワード
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          // 元のアカウントへの参照
          originalUserId: originalUser.uid,
        };
        
        // undefined値を除外して追加
        if (originalUser.color !== undefined) userData.color = originalUser.color;
        if (originalUser.storeId !== undefined) userData.storeId = originalUser.storeId;
        if (originalUser.hourlyWage !== undefined) userData.hourlyWage = originalUser.hourlyWage;
        
        await setDoc(realEmailUserRef, userData);

        // 元のFirestoreドキュメントに実メールアカウント情報を追加
        const originalUserRef = doc(db, 'users', originalUser.uid);
        await updateDoc(originalUserRef, {
          realEmail: realEmail,
          realEmailUserId: userCredential.user.uid,
          updatedAt: new Date(),
        });


        // 一時的なアプリを削除
        await deleteApp(tempApp);

      } catch (authError: any) {
        
        // 一時的なアプリを削除
        try {
          await deleteApp(tempApp);
        } catch (deleteError) {
        }
        
        // メールアドレスが既に使用されている場合は警告だけ出して続行
        if (authError.code === 'auth/email-already-in-use') {
          return;
        }
        
        throw authError;
      }

    } catch (error) {
      throw error;
    }
  },

  /**
   * ユーザーのパスワードを変更します
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error("ユーザーが認証されていません");
      }

      // 現在のパスワードで再認証
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // パスワードの更新
      await updatePassword(user, newPassword);

      // Firestoreのユーザーデータも更新（ハッシュ化）
      if (user.uid) {
        const { AESEncryption } = await import("@/common/common-utils/security/encryptionUtils");
        const hashedPassword = AESEncryption.hashPassword(newPassword);
        
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          hashedPassword: hashedPassword,
          currentPassword: null, // 平文パスワードを削除
        });
      }
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        throw new Error("現在のパスワードが正しくありません");
      } else if (error.code === "auth/weak-password") {
        throw new Error("パスワードは6文字以上で入力してください");
      }
      throw new Error("パスワードの変更に失敗しました");
    }
  },

  /**
   * 初期マスターユーザーの作成（必要な場合のみ使用）
   */
  createInitialMasterUser: async (): Promise<void> => {
    try {
      await AuthService.createUser("master@example.com", "123456");
    } catch (error: any) {
      // すでにユーザーが存在する場合は無視
      if (error.code === "auth/email-already-in-use") {
        return;
      }
      // Initial master user creation failed
    }
  },
};

// エクスポート
export const {
  signIn,
  getUserRole,
  signOut: signOutUser,
  createUser,
  updateUser,
  changePassword,
  createInitialMasterUser,
} = AuthService;
