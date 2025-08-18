/**
 * Firebase グループ管理モジュール
 *
 * 新規グループの作成とグループ参加機能を提供します。
 */

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
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
  message: string;
}

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
      // 1. 店舗IDの重複チェック
      const storeIdExists = await GroupService.checkStoreIdExists(data.storeId);

      if (storeIdExists) {
        throw new Error("この店舗IDは既に使用されています");
      }

      // 2. 管理者用のメールアドレス（実際のメールまたは自動生成）
      const adminEmail = data.adminEmail || `${data.storeId}${data.adminNickname}@example.com`;

      // 3. Firebase Authで管理者アカウントを作成
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminEmail,
        data.adminPassword
      );

      const adminUser = userCredential.user;

      // 4. プロフィールを更新（ニックネーム設定）
      await updateProfile(adminUser, {
        displayName: data.adminNickname,
      });

      // 5. storesコレクションにグループ情報を保存
      await setDoc(doc(db, "stores", data.storeId), {
        storeName: data.groupName,
        storeId: data.storeId,
        adminUid: adminUser.uid,
        adminNickname: data.adminNickname,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      });

      // 6. usersコレクションに管理者情報を保存（パスワードハッシュ化）
      const hashedPassword = AESEncryption.hashPassword(data.adminPassword);
      await setDoc(doc(db, "users", adminUser.uid), {
        uid: adminUser.uid,
        nickname: data.adminNickname,
        email: adminEmail,
        role: "master",
        hashedPassword: hashedPassword, // 🔒 ハッシュ化されたパスワード
        storeId: data.storeId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      });

      // 7. 初期メンバーを作成（もしあれば）
      if (data.initialMembers && data.initialMembers.length > 0) {
        for (const member of data.initialMembers) {
          try {
            // バリデーション
            if (
              !member.nickname ||
              !member.password ||
              member.password.length < 6
            ) {
              continue;
            }

            // メンバー用のメールアドレス生成（店舗ID + ニックネームの順でユニークにする）
            const memberEmail = `${data.storeId}${member.nickname}@example.com`;

            // Firebase Authでメンバーアカウント作成
            const memberCredential = await createUserWithEmailAndPassword(
              auth,
              memberEmail,
              member.password
            );

            const memberUser = memberCredential.user;

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
      }

      return {
        success: true,
        storeId: data.storeId,
        adminUid: adminUser.uid,
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
          groupName: storeData.storeName,
        };
      }

      return { exists: false };
    } catch (error) {
      throw new Error("グループの確認に失敗しました");
    }
  },
};
