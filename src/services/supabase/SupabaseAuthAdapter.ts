import type { IAuthService } from "../interfaces/IAuthService";
import type { User } from "@/common/common-models/model-user/UserModel";
import { getSupabase, authenticateSupabase } from "./supabase-client";
import { auth } from "@/services/firebase/firebase-core";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  getAuth,
} from "firebase/auth";
import { initializeApp, deleteApp } from "firebase/app";
import { firebaseConfig } from "@/services/firebase/firebase-core";
import { toSnakeCase, toCamelCase, removeUndefined } from "./utils/caseConverter";

export class SupabaseAuthAdapter implements IAuthService {
  /**
   * サインイン: Firebase Auth + Supabase JWT交換 + Supabase DBからユーザー取得
   */
  async signIn(email: string, password: string): Promise<User> {
    // 1. Firebase Auth でサインイン
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

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

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error("認証ユーザーが取得できませんでした");

    // 2. Supabase JWT を取得
    await authenticateSupabase();

    // 3. Supabase DBからユーザー情報取得
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", firebaseUser.uid)
      .single();

    if (error || !data) {
      throw new Error("ユーザー情報が見つかりません");
    }

    return {
      uid: firebaseUser.uid,
      nickname:
        firebaseUser.displayName || data.nickname || email.split("@")[0],
      role: data.role,
    };
  }

  /**
   * サインアウト: Firebase Auth + Supabase
   */
  async signOut(): Promise<void> {
    await signOut(auth);
    const supabase = getSupabase();
    await supabase.auth.signOut();
  }

  /**
   * ユーザーロール取得
   */
  async getUserRole(user: { uid: string }): Promise<"master" | "user"> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("uid", user.uid)
      .single();

    if (error || !data) {
      return "user";
    }

    const role = data.role;
    if (role !== "master" && role !== "user") {
      return "user";
    }

    return role;
  }

  /**
   * 新しいユーザーを作成
   */
  async createUser(
    email: string,
    password: string,
    nickname?: string,
    color?: string,
    storeId?: string,
    role?: "master" | "user",
    hourlyWage?: number
  ): Promise<User> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("管理者としてログインしている必要があります");
    }

    // 一時的なFirebaseアプリインスタンスを作成
    const tempApp = initializeApp(firebaseConfig, "temp-app-" + Date.now());
    const tempAuth = getAuth(tempApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        tempAuth,
        email,
        password
      );
      const firebaseUser = userCredential.user;
      const displayName = nickname || email.split("@")[0] || email;

      if (displayName) {
        await updateProfile(firebaseUser, { displayName });
      }

      // パスワードハッシュ化
      const { AESEncryption } = await import(
        "@/common/common-utils/security/encryptionUtils"
      );
      const hashedPassword = AESEncryption.hashPassword(password);
      const userRole = role || "user";

      // Supabase DBにユーザー情報を保存
      const supabase = getSupabase();
      const { error } = await supabase.from("users").insert({
        uid: firebaseUser.uid,
        nickname: displayName,
        role: userRole,
        hashed_password: hashedPassword,
        current_password: password,
        email: email,
        color: color || "#4A90E2",
        store_id: storeId || "",
        connected_stores: [],
        hourly_wage: hourlyWage || 1000,
        is_active: true,
      });

      if (error) {
        // ロールバック: Firebase Authユーザーを削除
        try {
          await firebaseUser.delete();
        } catch (_) {}
        throw new Error(`ユーザー情報の保存に失敗しました: ${error.message}`);
      }

      await deleteApp(tempApp);

      return {
        uid: firebaseUser.uid,
        nickname: displayName,
        role: userRole,
        color: color || "#FFD700",
        storeId: storeId || "",
      };
    } catch (error: any) {
      try {
        await deleteApp(tempApp);
      } catch (_) {}
      throw new Error(
        `ユーザー作成に失敗しました: ${error.code || "UNKNOWN"} - ${error.message}`
      );
    }
  }

  /**
   * 既存ユーザーを更新
   */
  async updateUser(
    user: User,
    updates: {
      nickname?: string;
      email?: string;
      password?: string;
      role?: "master" | "user";
      color?: string;
      storeId?: string;
    }
  ): Promise<User | undefined> {
    const supabase = getSupabase();
    const updateData: Record<string, unknown> = {};

    if (updates.nickname) {
      updateData['nickname'] = updates.nickname;
    }
    if (updates.email) {
      updateData['real_email'] = updates.email;
      // 実メールアカウントをFirebase Authに作成
      const { data: currentData } = await supabase
        .from("users")
        .select("current_password")
        .eq("uid", user.uid)
        .single();
      const passwordToUse =
        updates.password || currentData?.current_password;
      if (passwordToUse) {
        await this.createSecondaryEmailAccount(user, updates.email, passwordToUse);
      }
    }
    if (updates.role) updateData['role'] = updates.role;
    if (updates.password) updateData['current_password'] = updates.password;
    if (updates.color) updateData['color'] = updates.color;
    if (updates.storeId) updateData['store_id'] = updates.storeId;

    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("uid", user.uid);

    if (error) throw error;

    // Firebase Auth更新
    const currentUser = auth.currentUser;
    if (currentUser) {
      if (updates.nickname) {
        await updateProfile(currentUser, { displayName: updates.nickname });
      }
      if (updates.password) {
        const { data: userData } = await supabase
          .from("users")
          .select("current_password")
          .eq("uid", user.uid)
          .single();

        const currentPasswordForAuth = userData?.current_password;
        if (currentPasswordForAuth && currentUser.email) {
          const credential = EmailAuthProvider.credential(
            currentUser.email,
            currentPasswordForAuth
          );
          await reauthenticateWithCredential(currentUser, credential);
          await updatePassword(currentUser, updates.password);

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

  /**
   * パスワード変更
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("ユーザーが認証されていません");
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);

    if (user.uid) {
      const { AESEncryption } = await import(
        "@/common/common-utils/security/encryptionUtils"
      );
      const hashedPassword = AESEncryption.hashPassword(newPassword);

      const supabase = getSupabase();
      await supabase
        .from("users")
        .update({
          hashed_password: hashedPassword,
          current_password: null,
        })
        .eq("uid", user.uid);
    }
  }

  /**
   * 実メールアドレス用のFirebase Authアカウントを作成
   */
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
    const tempApp = initializeApp(
      firebaseConfig,
      "temp-app-secondary-" + Date.now()
    );
    const tempAuth = getAuth(tempApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        tempAuth,
        realEmail,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: originalUser.nickname || null,
      });

      const { AESEncryption } = await import(
        "@/common/common-utils/security/encryptionUtils"
      );
      const hashedPassword = AESEncryption.hashPassword(password);

      const supabase = getSupabase();

      // 実メールアドレス用のユーザードキュメントを作成
      const userData: Record<string, unknown> = {
        uid: userCredential.user.uid,
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
          real_email_user_id: userCredential.user.uid,
        })
        .eq("uid", originalUser.uid);

      await deleteApp(tempApp);
    } catch (authError: any) {
      try {
        await deleteApp(tempApp);
      } catch (_) {}

      if (authError.code === "auth/email-already-in-use") {
        return;
      }
      throw authError;
    }
  }

  /**
   * 初期マスターユーザー作成
   */
  async createInitialMasterUser(): Promise<void> {
    try {
      await this.createUser("master@example.com", "123456");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        return;
      }
    }
  }

  /**
   * 現在のFirebaseユーザーを取得
   */
  getCurrentUser(): {
    uid: string;
    email: string | null;
    displayName: string | null;
  } | null {
    const user = auth.currentUser;
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    };
  }

  /**
   * 認証状態の変更を監視
   */
  onAuthStateChanged(
    callback: (
      user: {
        uid: string;
        email: string | null;
        displayName: string | null;
      } | null
    ) => void
  ): () => void {
    return auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        callback(null);
      }
    });
  }
}
