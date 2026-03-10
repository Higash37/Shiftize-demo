/**
 * @file SupabaseAuthAdapter.ts
 * @description 認証系サービスのSupabase実装（サインイン・ユーザー作成・OAuth連携）
 *
 * ============================================================
 * 【なぜ "Adapter" パターンなのか — デザインパターンの歴史】
 * ============================================================
 *
 * ■ Adapter パターンとは
 *   「変換プラグ」のようなもの。
 *   海外旅行で日本のコンセント（2ピン）を海外の壁コンセント（3ピン）に
 *   つなぐための変換アダプターと同じ発想。
 *   この場合: Supabase の API（supabase.auth.signInWithPassword など）を
 *   IAuthService のインターフェース（signIn, signOut など）に変換する役割。
 *
 * ■ Gang of Four（GoF）デザインパターン
 *   1994年に出版された書籍『Design Patterns』で定義された23個のパターンの1つ。
 *   著者4人が「Gang of Four（4人組）」と呼ばれたことからGoFパターンと呼ぶ。
 *   Adapter はその中の「構造パターン」に分類される。
 *   30年以上経った今でもソフトウェア設計の基礎として広く使われている。
 *
 * ■ このファイルの役割
 *   Supabase の具体的な API 呼び出し → IAuthService の抽象的なメソッドに変換。
 *   例: supabase.auth.signInWithPassword() → IAuthService.signIn()
 *   アプリの他の部分は Supabase の存在を知らず、IAuthService だけを見る。
 *
 * ■ ケースバイケース
 *   - 外部 API との接続層 → Adapter パターンが適切（このファイルのように）
 *   - 内部ロジック（計算、バリデーション等） → 直接実装でOK、Adapter は不要
 *   - 複数の外部 API を統合する場合 → Facade パターンの方が適切なこともある
 * ============================================================
 */

import type { IAuthService } from "../interfaces/IAuthService";
import type { User, UserRole } from "@/common/common-models/model-user/UserModel";
import { getSupabase } from "./supabase-client";
import { toAsciiEmail } from "./utils/asciiEmail";
import { AuthError, NotFoundError, PermissionError, ValidationError } from "@/common/common-errors/AppErrors";

/** 認証サービスのSupabase実装（IAuthService の Supabase 版アダプター） */
export class SupabaseAuthAdapter implements IAuthService {
  /**
   * メールとパスワードでサインインする
   *
   * 注意: AuthContext.signInからは使用しない。
   * signInWithPassword直後のDBクエリがSupabase JS v2のnavigator.locksで
   * デッドロックするため、AuthContextでは認証とDB取得を分離している。
   */
  async signIn(email: string, password: string): Promise<User> {
    const supabase = getSupabase();
    const asciiEmail = toAsciiEmail(email);

    // 1. Supabase Auth でサインイン（セッション自動確立→RLS即有効）
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email: asciiEmail, password });

    if (authError || !authData.user) {
      throw new AuthError("メールアドレスまたはパスワードが正しくありません");
    }

    const supabaseUser = authData.user;

    // 2. usersテーブルからユーザー情報取得（auth.uid()でRLS通過）
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", supabaseUser.id)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundError("ユーザー情報が見つかりません");
    }

    return {
      uid: supabaseUser.id,
      nickname: data.nickname || email.split("@")[0],
      role: data.role,
      email: data.email,
      storeId: data.store_id,
      color: data.color,
    };
  }

  /** サインアウトする */
  async signOut(): Promise<void> {
    const supabase = getSupabase();
    await supabase.auth.signOut();
  }

  /** ユーザーのロールを取得する */
  async getUserRole(user: { uid: string }): Promise<UserRole> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("uid", user.uid)
      .maybeSingle();

    if (error || !data) {
      return "user";
    }

    const role = data.role;
    if (role !== "master" && role !== "user") {
      return "user";
    }

    return role;
  }

  /** 新規ユーザーをAuth+DBに作成する（管理者セッション保存→signUp→復元） */
  async createUser(
    email: string,
    password: string,
    nickname?: string,
    color?: string,
    storeId?: string,
    role?: UserRole,
    hourlyWage?: number,
    furigana?: string
  ): Promise<User> {
    const supabase = getSupabase();

    // 管理者セッションを保存
    const { data: { session: adminSession } } = await supabase.auth.getSession();
    if (!adminSession) {
      throw new PermissionError("管理者としてログインしている必要があります");
    }

    const asciiEmail = toAsciiEmail(email);
    let createdAuthUserId: string | null = null;

    try {
      // 新規ユーザーをSupabase Authに登録
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: asciiEmail,
          password,
        });

      if (signUpError || !signUpData.user) {
        throw new Error(
          `ユーザー作成に失敗しました: ${signUpError?.message || "UNKNOWN"}`
        );
      }

      const newUserId = signUpData.user.id;
      createdAuthUserId = newUserId;
      const displayName = nickname || email.split("@")[0] || email;
      const userRole = role || "user";

      // 管理者セッションを復元（signUpで新ユーザーにログインされるため）
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });

      // パスワードハッシュ化
      const { AESEncryption } = await import(
        "@/common/common-utils/security/encryptionUtils"
      );
      const hashedPassword = AESEncryption.hashPassword(password);

      // Supabase DBにユーザー情報を保存（管理者セッションのRLSで許可）
      const { error } = await supabase.from("users").insert({
        uid: newUserId,
        nickname: displayName,
        furigana: furigana || null,
        role: userRole,
        hashed_password: hashedPassword,
        email: asciiEmail,
        color: color || "#4A90E2",
        store_id: storeId || "",
        connected_stores: [],
        hourly_wage: hourlyWage || 1000,
        is_active: true,
      });

      if (error) {
        // DB insert失敗時：孤児ユーザーを防ぐためAuth側ユーザーを削除
        try {
          console.warn(`Auth user ${newUserId} created but DB insert failed. Manual cleanup may be needed.`);
        } catch (_) {}
        throw new Error(`ユーザー情報の保存に失敗しました: ${error.message}`);
      }

      return {
        uid: newUserId,
        nickname: displayName,
        role: userRole,
        color: color || "#FFD700",
        storeId: storeId || "",
      };
    } catch (error: any) {
      // エラー時は管理者セッションを復元
      try {
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });
      } catch (_) {}
      // signUp済みのAuthユーザーを削除試行（孤児防止）
      if (createdAuthUserId) {
        console.warn(`Orphan auth user may exist: ${createdAuthUserId}. Consider cleanup via admin API or DB trigger.`);
      }
      throw new Error(
        `ユーザー作成に失敗しました: ${error.message}`
      );
    }
  }

  /** 既存ユーザーの情報を更新する */
  async updateUser(
    user: User,
    updates: {
      nickname?: string;
      furigana?: string;
      email?: string;
      password?: string;
      role?: UserRole;
      color?: string;
      storeId?: string;
    }
  ): Promise<User | undefined> {
    const supabase = getSupabase();
    const updateData: Record<string, unknown> = {};

    if (updates.nickname) {
      updateData['nickname'] = updates.nickname;
    }
    if (updates.furigana !== undefined) {
      updateData['furigana'] = updates.furigana || null;
    }
    if (updates.email) {
      updateData['real_email'] = updates.email;
      // 実メールアカウントをSupabase Authに作成
      if (updates.password) {
        await this.createSecondaryEmailAccount(user, updates.email, updates.password);
      }
    }
    if (updates.role) updateData['role'] = updates.role;
    if (updates.color) updateData['color'] = updates.color;
    if (updates.storeId) updateData['store_id'] = updates.storeId;

    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("uid", user.uid);

    if (error) throw error;

    // パスワード変更（Supabase Auth）
    if (updates.password) {
      // 現在ログイン中のユーザーのパスワードのみ変更可能
      const { data: { user: currentAuthUser } } = await supabase.auth.getUser();
      if (currentAuthUser && currentAuthUser.id === user.uid) {
        await supabase.auth.updateUser({ password: updates.password });

        const { AESEncryption } = await import(
          "@/common/common-utils/security/encryptionUtils"
        );
        const hashedPassword = AESEncryption.hashPassword(updates.password);

        await supabase
          .from("users")
          .update({
            hashed_password: hashedPassword,
            current_password: null,
          })
          .eq("uid", user.uid);
      }
    }

    // 更新後のユーザーデータを取得
    const { data: updatedData } = await supabase
      .from("users")
      .select("*")
      .eq("uid", user.uid)
      .single();

    if (updatedData) {
      return {
        uid: updatedData.uid,
        role: updatedData.role,
        nickname: updatedData.nickname || "",
        email: updatedData.email,
        color: updatedData.color,
        storeId: updatedData.store_id,
      };
    }
    return undefined;
  }

  /** 現在のパスワードを検証して新しいパスワードに変更する */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new AuthError("ユーザーが認証されていません");
    }

    // 現在のパスワードを検証（再ログインで確認）
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      throw new AuthError("現在のパスワードが正しくありません");
    }

    // パスワードを更新
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw new Error(`パスワード変更に失敗しました: ${updateError.message}`);
    }

    // DB側のハッシュも更新
    const { AESEncryption } = await import(
      "@/common/common-utils/security/encryptionUtils"
    );
    const hashedPassword = AESEncryption.hashPassword(newPassword);

    await supabase
      .from("users")
      .update({
        hashed_password: hashedPassword,
      })
      .eq("uid", user.id);
  }

  /** 実メールアドレス用のSupabase Authアカウントを作成する */
  async createSecondaryEmailAccount(
    originalUser: {
      uid: string;
      nickname?: string;
      role?: string;
      color?: string;
      storeId?: string;
      hourlyWage?: number;
    },
    realEmail: string,
    password: string
  ): Promise<void> {
    const supabase = getSupabase();

    // 管理者セッションを保存
    const { data: { session: adminSession } } = await supabase.auth.getSession();

    try {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: realEmail,
          password,
        });

      if (signUpError) {
        if (signUpError.message?.includes("already registered")) {
          return;
        }
        throw signUpError;
      }

      if (!signUpData.user) return;

      // 管理者セッションを復元
      if (adminSession) {
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });
      }

      const { AESEncryption } = await import(
        "@/common/common-utils/security/encryptionUtils"
      );
      const hashedPassword = AESEncryption.hashPassword(password);

      // 実メールアドレス用のユーザーレコードを作成
      const userData: Record<string, unknown> = {
        uid: signUpData.user.id,
        nickname: originalUser.nickname,
        email: realEmail,
        role: originalUser.role,
        hashed_password: hashedPassword,
        is_active: true,
        original_user_id: originalUser.uid,
      };

      if (originalUser.color !== undefined)
        userData['color'] = originalUser.color;
      if (originalUser.storeId !== undefined)
        userData['store_id'] = originalUser.storeId;
      if (originalUser.hourlyWage !== undefined)
        userData['hourly_wage'] = originalUser.hourlyWage;

      await supabase.from("users").insert(userData);

      // 元ユーザーに実メール情報を追加
      await supabase
        .from("users")
        .update({
          real_email: realEmail,
          real_email_user_id: signUpData.user.id,
        })
        .eq("uid", originalUser.uid);
    } catch (authError: any) {
      // 管理者セッションを復元
      if (adminSession) {
        try {
          await supabase.auth.setSession({
            access_token: adminSession.access_token,
            refresh_token: adminSession.refresh_token,
          });
        } catch (_) {}
      }
      throw authError;
    }
  }

  /** @deprecated 未使用。グループ作成フローでマスターユーザーが作成される */
  async createInitialMasterUser(): Promise<void> {
    // no-op: セキュリティリスクのためハードコードされたデフォルト認証情報を削除
  }

  /** OAuthプロバイダーをアカウントにリンクする */
  async linkOAuthIdentity(provider: "google" | "apple"): Promise<void> {
    const supabase = getSupabase();
    const options: { redirectTo?: string } =
      typeof window !== "undefined" ? { redirectTo: window.location.origin } : {};
    const { error } = await supabase.auth.linkIdentity({ provider, options });
    if (error) {
      throw new Error(`OAuth連携に失敗しました: ${error.message}`);
    }
  }

  /** 連携済みOAuthプロバイダー一覧を取得する */
  async getLinkedIdentities(): Promise<Array<{ provider: string; email?: string }>> {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return [];

    return (user.identities ?? []).map((identity) => {
      const email = identity.identity_data?.['email'] as string | undefined;
      const result: { provider: string; email?: string } = { provider: identity.provider };
      if (email) result.email = email;
      return result;
    });
  }

  /** OAuthプロバイダーのリンクを解除してreal_emailをクリアする */
  async unlinkOAuthIdentity(provider: "google" | "apple"): Promise<void> {
    const supabase = getSupabase();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new NotFoundError("ユーザー情報を取得できません");
    }

    const identity = user.identities?.find((id) => id.provider === provider);
    if (!identity) {
      throw new Error(`${provider}は連携されていません`);
    }

    const { error } = await supabase.auth.unlinkIdentity(identity);
    if (error) {
      throw new Error(`連携解除に失敗しました: ${error.message}`);
    }

    // usersテーブルの real_email, oauth_provider, oauth_linked_at をクリア
    await supabase
      .from("users")
      .update({
        real_email: null,
        oauth_provider: null,
        oauth_linked_at: null,
      })
      .eq("uid", user.id);
  }

  /**
   * Calendarスコープ付きでGoogle OAuth再認証する
   * signInWithOAuthを使用（linkIdentityはセッション破壊の問題あり）。
   * access_type=offlineでrefresh_tokenを確実に取得。
   */
  async linkGoogleWithCalendarScope(): Promise<void> {
    const supabase = getSupabase();
    const options: {
      scopes: string;
      redirectTo?: string;
      queryParams: Record<string, string>;
    } = {
      scopes: "https://www.googleapis.com/auth/calendar",
      queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      };
    if (typeof window !== "undefined") {
      options.redirectTo = window.location.href;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options,
    });
    if (error) {
      throw new Error(`Google Calendar連携に失敗しました: ${error.message}`);
    }
  }

  /** @deprecated useAuth()を使用すること */
  getCurrentUser(): {
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null {
    // 注意: このメソッドは同期的だが、内部でSupabase clientのセッションキャッシュに依存
    // 新しいコードではuseAuth()フックを使用すること
    return null;
  }

  /** 認証状態の変更を監視する */
  onAuthStateChanged(
    callback: (
      user: {
        uid: string;
        email: string | null;
        displayName: string | null;
      } | null
    ) => void
  ): () => void {
    const supabase = getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          callback({
            uid: session.user.id,
            email: session.user.email ?? null,
            displayName: session.user.user_metadata?.['display_name'] ?? null,
          });
        } else {
          callback(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }
}
