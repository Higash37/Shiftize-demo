/**
 * Firebase グループ管理モジュール
 *
 * 新規グループの作成とグループ参加機能を提供します。
 */

import {
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  getIdToken,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { AESEncryption } from "@/common/common-utils/security/encryptionUtils";

import { auth, db } from "./firebase-core";

export interface CreateGroupData {
  groupName: string;
  storeId: string;
  adminNickname: string;
  adminEmail?: string; // 実際のメールアドレス（任意）
  adminPassword: string;
  initialMembers?: InitialMember[];
}

export interface InitialMember {
  nickname: string;
  password: string;
  role: "master" | "user";
  color: string;
  hourlyWage?: number;
}

export interface GroupCreationResult {
  success: boolean;
  storeId: string;
  adminUid: string;
  adminEmail?: string; // 管理者のメールアドレス
  message: string;
}

// メール自動生成: {storeId}{nickname}@example.com (マスター・ユーザー共通)
// 例: 店舗ID「8117」、ニックネーム「いちご」 → 8117いちご@example.com
const buildGeneratedEmail = (
  storeId: string,
  nickname: string,
  role: "master" | "user"
): string => {
  return `${storeId}${nickname}@example.com`;
};

const createUserWithFallbackEmail = async (
  storeId: string,
  nickname: string,
  role: "master" | "user",
  password: string
): Promise<{ user: any; email: string }> => {
  let email = buildGeneratedEmail(storeId, nickname, role);
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: credential.user, email };
  } catch (error: any) {
    if (error?.code === "auth/email-already-in-use") {
      // リトライ時は数字サフィックスを追加
      const retryNickname = `${nickname}${Date.now()}`;
      email = buildGeneratedEmail(storeId, retryNickname, role);
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      return { user: credential.user, email };
    }
    throw error;
  }
};

/**
 * グループ管理サービス
 */
export const GroupService = {
  /**
   * 店舗IDの重複チェック
   */
  checkStoreIdExists: async (storeId: string): Promise<boolean> => {
    try {
      const storeDoc = await getDoc(doc(db, "stores", storeId));
      const exists = storeDoc.exists();

      return exists;
    } catch (error: any) {

      // 権限エラーやネットワークエラーの場合は例外を投げる
      if (error.code === "permission-denied") {
        throw new Error("店舗ID確認の権限がありません");
      } else if (error.code === "unavailable") {
        throw new Error(
          "ネットワークエラーです。しばらくしてからお試しください"
        );
      } else {
        throw new Error("店舗ID確認に失敗しました");
      }
    }
  },

  /**
   * ユニークな店舗IDを生成
   */
  generateUniqueStoreId: async (): Promise<string> => {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const storeId = Math.floor(1000 + Math.random() * 9000).toString();
      const exists = await GroupService.checkStoreIdExists(storeId);

      if (!exists) {
        return storeId;
      }

      attempts++;
    }

    throw new Error("ユニークな店舗IDの生成に失敗しました");
  },

  /**
   * 新規グループを作成
   */
  createGroup: async (data: CreateGroupData): Promise<GroupCreationResult> => {
    try {
      console.log("🔵 createGroup started with data:", data);

      // 1. 店舗IDの重複チェック
      console.log("🔍 Checking if store ID exists...");
      const storeIdExists = await GroupService.checkStoreIdExists(data.storeId);
      console.log("📊 Store ID exists:", storeIdExists);

      if (storeIdExists) {
        throw new Error("この店舗IDは既に使用されています");
      }

      // 2. 管理者用のメールアドレス（実際のメールまたは自動生成）
      // 形式: {storeId}{adminNickname}@example.com (例: 8117いちご@example.com)
      const adminEmailRequested =
        data.adminEmail ||
        buildGeneratedEmail(data.storeId, data.adminNickname, "master");
      console.log("📧 Admin email:", adminEmailRequested);

      // 3. Firebase Authで管理者アカウントを作成
      console.log("👤 Creating Firebase Auth user...");
      const { user: adminUser, email: adminEmail } = await createUserWithFallbackEmail(
        data.storeId,
        data.adminNickname,
        "master",
        data.adminPassword
      );
      console.log("✅ User created with UID:", adminUser.uid, "email:", adminEmail);

      // 4. 認証状態が反映されるまで待機
      console.log("⏳ Waiting for auth state to be reflected...");
      await new Promise<void>((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(
          auth,
          (firebaseUser) => {
            if (firebaseUser && firebaseUser.uid === adminUser.uid) {
              unsubscribe();
              resolve();
            }
          },
          (error) => {
            unsubscribe();
            reject(error);
          }
        );
        // タイムアウト設定（5秒）
        setTimeout(() => {
          unsubscribe();
          resolve(); // タイムアウトしても続行
        }, 5000);
      });
      console.log("✅ Auth state reflected");
      // トークン未発行で request.auth が null になるケースを防ぐ
      await getIdToken(adminUser, true);
      // 念のため再サインインして Firestore に確実に認証を反映
      await signInWithEmailAndPassword(auth, adminEmail, data.adminPassword);
      console.log("🔐 Auth re-validated for Firestore writes. currentUser:", auth.currentUser?.uid);

      // 5. プロフィールを更新（ニックネーム設定）
      console.log("📝 Updating user profile...");
      await updateProfile(adminUser, {
        displayName: data.adminNickname,
      });
      console.log("✅ Profile updated");

      // 6. storesコレクションにグループ情報を保存
      console.log("🏪 Creating store document...");
      await setDoc(doc(db, "stores", data.storeId), {
        storeName: data.groupName,
        storeId: data.storeId,
        adminUid: adminUser.uid,
        adminNickname: data.adminNickname,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      });
      console.log("✅ Store document created");

      // 7. usersコレクションに管理者情報を保存（パスワードハッシュ化）
      console.log("👥 Creating user document...");
      const hashedPassword = AESEncryption.hashPassword(data.adminPassword);
      await setDoc(doc(db, "users", adminUser.uid), {
        uid: adminUser.uid,
        nickname: data.adminNickname,
        email: adminEmail,
        role: "master",
        hashedPassword: hashedPassword, // 🔒 ハッシュ化されたパスワード
        currentPassword: data.adminPassword, // 平文パスワード（既存システムとの互換性のため）
        storeId: data.storeId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      });
      console.log("✅ User document created");

      // 8. 初期メンバーを作成（もしあれば）
      if (data.initialMembers && data.initialMembers.length > 0) {
        let memberIndex = 0;
        for (const member of data.initialMembers) {
          memberIndex += 1;
          try {
            // バリデーション
            if (
              !member.nickname ||
              !member.password ||
              member.password.length < 6
            ) {
              continue;
            }

            // メンバー用のメールアドレス生成
            // 形式: {storeId}{nickname}@example.com (例: 8117三橋@example.com)
            const { user: memberUser, email: memberEmail } = await createUserWithFallbackEmail(
              data.storeId,
              member.nickname,
              member.role,
              member.password
            );

            // プロフィール更新
            await updateProfile(memberUser, {
              displayName: member.nickname,
            });

            // usersコレクションにメンバー情報保存（パスワードハッシュ化）
            const memberHashedPassword = AESEncryption.hashPassword(member.password);
            await setDoc(doc(db, "users", memberUser.uid), {
              uid: memberUser.uid,
              nickname: member.nickname,
              email: memberEmail,
              role: member.role,
              hashedPassword: memberHashedPassword, // 🔒 ハッシュ化されたパスワード
              currentPassword: member.password, // 平文パスワード（既存システムとの互換性のため）
              color: member.color,
              hourlyWage: member.hourlyWage || null,
              storeId: data.storeId,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              isActive: true,
            });
          } catch (memberError: any) {
            // 個別のメンバー作成失敗は全体の失敗にしない
          }
        }

        // メンバー作成でセッションが切り替わるため、管理者に戻しておく
        if (!auth.currentUser || auth.currentUser.uid !== adminUser.uid) {
          try {
            await signInWithEmailAndPassword(auth, adminEmail, data.adminPassword);
          } catch (restoreError) {
            console.warn("⚠️ Failed to restore admin session:", restoreError);
          }
        }
      }

      return {
        success: true,
        storeId: data.storeId,
        adminUid: adminUser.uid,
        adminEmail: adminEmail, // 実際に作成されたメールアドレス
        message: "グループが正常に作成されました",
      };
    } catch (error: any) {

      // Firebase Authのエラーコードに応じたメッセージ
      let errorMessage = "グループの作成に失敗しました";

      if (error.code === "auth/weak-password") {
        errorMessage = "パスワードは6文字以上で入力してください";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "この店舗IDは既に使用されています";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        storeId: data.storeId,
        adminUid: "",
        message: errorMessage,
      };
    }
  },

  /**
   * グループに参加（店舗IDでグループ存在確認）
   */
  checkGroupExists: async (
    storeId: string
  ): Promise<{
    exists: boolean;
    groupName?: string;
  }> => {
    try {
      const storeDoc = await getDoc(doc(db, "stores", storeId));

      if (storeDoc.exists()) {
        const storeData = storeDoc.data();
        return {
          exists: true,
          groupName: storeData['storeName'],
        };
      }

      return { exists: false };
    } catch (error) {
      throw new Error("グループの確認に失敗しました");
    }
  },
};
