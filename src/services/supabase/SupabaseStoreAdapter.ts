import type {
  IStoreService,
  CreateGroupData,
  GroupCreationResult,
} from "../interfaces/IStoreService";
import { getSupabase, authenticateSupabase } from "./supabase-client";
import { auth } from "@/services/firebase/firebase-core";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  getIdToken,
} from "firebase/auth";
import { AESEncryption } from "@/common/common-utils/security/encryptionUtils";

// メール自動生成
const buildGeneratedEmail = (storeId: string, nickname: string): string => {
  return `${storeId}${nickname}@example.com`;
};

const createUserWithFallbackEmail = async (
  storeId: string,
  nickname: string,
  password: string
): Promise<{ user: any; email: string }> => {
  let email = buildGeneratedEmail(storeId, nickname);
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: credential.user, email };
  } catch (error: any) {
    if (error?.code === "auth/email-already-in-use") {
      const retryNickname = `${nickname}${Date.now()}`;
      email = buildGeneratedEmail(storeId, retryNickname);
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { user: credential.user, email };
    }
    throw error;
  }
};

export class SupabaseStoreAdapter implements IStoreService {
  async checkStoreIdExists(storeId: string): Promise<boolean> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("stores")
      .select("store_id")
      .eq("store_id", storeId)
      .maybeSingle();

    if (error) {
      if (error.code === "PGRST116") return false; // not found
      throw new Error("店舗ID確認に失敗しました");
    }

    return data !== null;
  }

  async generateUniqueStoreId(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const storeId = Math.floor(1000 + Math.random() * 9000).toString();
      const exists = await this.checkStoreIdExists(storeId);

      if (!exists) {
        return storeId;
      }
      attempts++;
    }

    throw new Error("ユニークな店舗IDの生成に失敗しました");
  }

  async createGroup(data: CreateGroupData): Promise<GroupCreationResult> {
    try {
      // 1. 店舗ID重複チェック
      const storeIdExists = await this.checkStoreIdExists(data.storeId);
      if (storeIdExists) {
        throw new Error("この店舗IDは既に使用されています");
      }

      // 2. Firebase Authで管理者アカウント作成
      const { user: adminUser, email: adminEmail } =
        await createUserWithFallbackEmail(
          data.storeId,
          data.adminNickname,
          data.adminPassword
        );

      // 3. 認証状態待機
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
        setTimeout(() => {
          unsubscribe();
          resolve();
        }, 5000);
      });

      await getIdToken(adminUser, true);
      await signInWithEmailAndPassword(auth, adminEmail, data.adminPassword);

      // 4. Supabase JWT取得
      await authenticateSupabase();

      // 5. プロフィール更新
      await updateProfile(adminUser, { displayName: data.adminNickname });

      const supabase = getSupabase();

      // 6. stores テーブルに保存
      const { error: storeError } = await supabase.from("stores").insert({
        store_id: data.storeId,
        store_name: data.groupName,
        admin_uid: adminUser.uid,
        admin_nickname: data.adminNickname,
        is_active: true,
      });

      if (storeError) throw storeError;

      // 7. users テーブルに管理者を保存
      const hashedPassword = AESEncryption.hashPassword(data.adminPassword);
      const { error: userError } = await supabase.from("users").insert({
        uid: adminUser.uid,
        nickname: data.adminNickname,
        email: adminEmail,
        role: "master",
        hashed_password: hashedPassword,
        current_password: data.adminPassword,
        store_id: data.storeId,
        is_active: true,
      });

      if (userError) throw userError;

      // 8. 初期メンバー作成
      if (data.initialMembers && data.initialMembers.length > 0) {
        for (const member of data.initialMembers) {
          try {
            if (
              !member.nickname ||
              !member.password ||
              member.password.length < 6
            ) {
              continue;
            }

            const { user: memberUser, email: memberEmail } =
              await createUserWithFallbackEmail(
                data.storeId,
                member.nickname,
                member.password
              );

            await updateProfile(memberUser, { displayName: member.nickname });

            // Supabase JWT再取得（Firebase Authセッション変更のため）
            await authenticateSupabase();

            const memberHashedPassword = AESEncryption.hashPassword(
              member.password
            );
            await supabase.from("users").insert({
              uid: memberUser.uid,
              nickname: member.nickname,
              email: memberEmail,
              role: member.role,
              hashed_password: memberHashedPassword,
              current_password: member.password,
              color: member.color,
              hourly_wage: member.hourlyWage || null,
              store_id: data.storeId,
              is_active: true,
            });
          } catch (_) {
            // 個別メンバー失敗は全体の失敗にしない
          }
        }

        // 管理者セッションに戻す
        if (!auth.currentUser || auth.currentUser.uid !== adminUser.uid) {
          try {
            await signInWithEmailAndPassword(
              auth,
              adminEmail,
              data.adminPassword
            );
            await authenticateSupabase();
          } catch (_) {}
        }
      }

      return {
        success: true,
        storeId: data.storeId,
        adminUid: adminUser.uid,
        adminEmail: adminEmail,
        message: "グループが正常に作成されました",
      };
    } catch (error: any) {
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
  }

  async checkGroupExists(
    storeId: string
  ): Promise<{ exists: boolean; groupName?: string }> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("stores")
      .select("store_name")
      .eq("store_id", storeId)
      .maybeSingle();

    if (error || !data) {
      return { exists: false };
    }

    return {
      exists: true,
      groupName: data.store_name,
    };
  }
}
