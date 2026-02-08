import type {
  IStoreService,
  CreateGroupData,
  GroupCreationResult,
} from "../interfaces/IStoreService";
import { getSupabase } from "./supabase-client";
import { AESEncryption } from "@/common/common-utils/security/encryptionUtils";
import { toAsciiEmail } from "./utils/asciiEmail";

// メール自動生成（ASCII変換付き）
const buildGeneratedEmail = (storeId: string, nickname: string): string => {
  return toAsciiEmail(`${storeId}${nickname}@example.com`);
};

export class SupabaseStoreAdapter implements IStoreService {
  async getStore(storeId: string): Promise<{ storeId: string; storeName: string; adminUid?: string; adminNickname?: string; [key: string]: any } | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("store_id", storeId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      storeId: data.store_id,
      storeName: data.store_name || "",
      adminUid: data.admin_uid,
      adminNickname: data.admin_nickname,
      isActive: data.is_active,
    };
  }

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
    let createdAdminUid: string | null = null;
    try {
      const supabase = getSupabase();

      // 1. 店舗ID重複チェック
      const storeIdExists = await this.checkStoreIdExists(data.storeId);
      if (storeIdExists) {
        throw new Error("この店舗IDは既に使用されています");
      }

      // 2. Supabase Authで管理者アカウント作成
      let adminEmail = buildGeneratedEmail(data.storeId, data.adminNickname);
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: adminEmail,
          password: data.adminPassword,
        });

      if (signUpError) {
        // メールアドレスが重複した場合のフォールバック（status codeで判定）
        const isAlreadyRegistered =
          (signUpError as any).status === 422 ||
          (signUpError as any).code === "user_already_exists" ||
          signUpError.message?.includes("already registered");

        if (isAlreadyRegistered) {
          const retryNickname = `${data.adminNickname}${Date.now()}`;
          adminEmail = buildGeneratedEmail(data.storeId, retryNickname);
          const { data: retryData, error: retryError } =
            await supabase.auth.signUp({
              email: adminEmail,
              password: data.adminPassword,
            });
          if (retryError || !retryData.user) {
            throw new Error(`管理者アカウント作成に失敗しました: ${retryError?.message}`);
          }
          Object.assign(signUpData!, retryData);
        } else {
          throw signUpError;
        }
      }

      if (!signUpData?.user) {
        throw new Error("管理者アカウント作成に失敗しました");
      }

      const adminUid = signUpData.user.id;
      createdAdminUid = adminUid;

      // signUpで自動ログインされるのでセッションを確認
      // メール確認が有効な場合sessionがnullになるため、明示的にsignInする
      const { data: { session: signUpSession } } = await supabase.auth.getSession();
      if (!signUpSession) {
        await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: data.adminPassword,
        });
      }

      // 3. stores テーブルに保存
      const { error: storeError } = await supabase.from("stores").insert({
        store_id: data.storeId,
        store_name: data.groupName,
        admin_uid: adminUid,
        admin_nickname: data.adminNickname,
        is_active: true,
      });

      if (storeError) throw storeError;

      // 4. users テーブルに管理者を保存
      const hashedPassword = AESEncryption.hashPassword(data.adminPassword);
      const { error: userError } = await supabase.from("users").insert({
        uid: adminUid,
        nickname: data.adminNickname,
        email: adminEmail,
        role: "master",
        hashed_password: hashedPassword,
        current_password: data.adminPassword,
        store_id: data.storeId,
        is_active: true,
      });

      if (userError) throw userError;

      // 5. 管理者セッションを保存（メンバー作成のため）
      const { data: { session: adminSession } } = await supabase.auth.getSession();

      // 6. 初期メンバー作成
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

            const memberEmail = buildGeneratedEmail(data.storeId, member.nickname);

            const { data: memberSignUp, error: memberError } =
              await supabase.auth.signUp({
                email: memberEmail,
                password: member.password,
              });

            if (memberError || !memberSignUp.user) continue;

            // 管理者セッションを復元（signUpで変わるため）
            if (adminSession) {
              await supabase.auth.setSession({
                access_token: adminSession.access_token,
                refresh_token: adminSession.refresh_token,
              });
            }

            const memberHashedPassword = AESEncryption.hashPassword(
              member.password
            );
            await supabase.from("users").insert({
              uid: memberSignUp.user.id,
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

        // 管理者セッションを復元
        if (adminSession) {
          try {
            await supabase.auth.setSession({
              access_token: adminSession.access_token,
              refresh_token: adminSession.refresh_token,
            });
          } catch (_) {}
        }
      }

      return {
        success: true,
        storeId: data.storeId,
        adminUid: adminUid,
        adminEmail: adminEmail,
        message: "グループが正常に作成されました",
      };
    } catch (error: any) {
      // Auth作成済みだがDB挿入失敗した場合は孤児ユーザー警告
      if (createdAdminUid) {
        console.warn(
          `createGroup failed after Auth user creation. Orphan user ID: ${createdAdminUid}. ` +
          `Cleanup via admin API or DB trigger recommended.`
        );
      }

      let errorMessage = "グループの作成に失敗しました";

      if (error.message?.includes("weak") || error.message?.includes("password")) {
        errorMessage = "パスワードは6文字以上で入力してください";
      } else if (error.message?.includes("already")) {
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
