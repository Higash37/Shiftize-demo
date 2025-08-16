import { useState, useEffect, useCallback } from "react";
import { User } from "@/common/common-models/model-user/UserModel";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase-core";
import {
  getUsers as getUsersService,
  deleteUser,
  checkMasterExists,
  checkEmailExists,
} from "@/services/firebase/firebase-user";
import { createUser, updateUser } from "@/services/firebase/firebase-auth";

/**
 * Enhanced user management hook with production-ready error handling
 * and consistent sanitization patterns
 */

export const useUser = (storeId?: string) => {
  const [users, setUsers] = useState<(User & { currentPassword?: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (storeId) {
      fetchUsers();
    }
  }, [storeId]);
  const fetchUsers = useCallback(async () => {
    if (!UserValidationHelper.isValidStoreId(storeId)) {
      setError("有効な店舗IDが設定されていません");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userData = await getUsersService(storeId);
      setUsers(userData || []);
    } catch (err) {
      const errorMessage = UserValidationHelper.extractErrorMessage(err);
      setError(errorMessage);
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);
  // For backward compatibility with old naming
  async function fetchUMembers() {
    await fetchUsers();
  }
  const addUser = useCallback(async (
    email: string,
    password: string,
    nickname: string,
    role: "master" | "user",
    color?: string,
    storeId?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Comprehensive validation using helper
      const validationResult = UserValidationHelper.validateUserCreation({
        email,
        password,
        nickname,
        role,
        storeId,
      });

      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }

      // Check for existing master user
      if (role === "master") {
        const hasMaster = await checkMasterExists();
        if (hasMaster) {
          throw new Error("マスターユーザーは既に存在します");
        }
      }

      // Generate safe email address
      const userEmail = UserValidationHelper.generateSafeEmail({
        providedEmail: email,
        nickname,
        storeId: storeId!,
        role,
      });

      // Check for email duplication
      const emailExists = await checkEmailExists(userEmail);
      if (emailExists) {
        const errorMsg = email 
          ? "このメールアドレスは既に使用されています" 
          : "このニックネームは既に使用されています";
        throw new Error(errorMsg);
      }

      const newUser = await createUser(
        userEmail,
        password,
        UserValidationHelper.sanitizeNickname(nickname),
        color,
        storeId
      );

      // Refresh user list
      await fetchUsers();
      return newUser;
    } catch (err: unknown) {
      const errorMessage = UserValidationHelper.getFirebaseErrorMessage(err);
      
      if (__DEV__) {
        console.error('🚨 useUser addUser Error:', {
          error: err,
          email,
          storeId,
          nickname,
          role,
        });
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const editUser = useCallback(async (
    user: User,
    updates: {
      nickname?: string;
      email?: string;
      password?: string;
      role?: "master" | "user";
      color?: string;
      storeId?: string;
    }
  ): Promise<User | undefined> => {
    try {
      setLoading(true);
      setError(null);

      // Validate user updates
      const validationResult = UserValidationHelper.validateUserUpdate({
        user,
        updates,
      });

      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }

      // Sanitize updates
      const sanitizedUpdates = UserValidationHelper.sanitizeUserUpdates(updates);
      
      const updatedUser = await updateUser(user, sanitizedUpdates);
      
      if (updatedUser) {
        setUsers((prev) =>
          prev.map((u) => (u.uid === user.uid ? updatedUser : u))
        );
      }

      await fetchUsers();
      return updatedUser;
    } catch (err: unknown) {
      const errorMessage = UserValidationHelper.extractErrorMessage(err);
      setError(errorMessage);
      
      if (__DEV__) {
        console.error('🚨 useUser editUser Error:', err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const removeUser = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!UserValidationHelper.isValidUserId(uid)) {
        throw new Error("無効なユーザーIDです");
      }

      await deleteUser(uid);
      await fetchUsers();
    } catch (err: unknown) {
      const errorMessage = UserValidationHelper.extractErrorMessage(err);
      setError(errorMessage);
      
      if (__DEV__) {
        console.error('🚨 useUser removeUser Error:', err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);
  return {
    users,
    loading,
    error,
    addUser,
    editUser,
    removeUser,
    refreshUsers: fetchUsers,
    setUsers,
  } as const;
};

/**
 * User validation and sanitization helper class
 */
class UserValidationHelper {
  /**
   * Validate store ID
   */
  static isValidStoreId(storeId?: string): boolean {
    return Boolean(storeId && typeof storeId === 'string' && storeId.trim().length > 0);
  }

  /**
   * Validate user ID
   */
  static isValidUserId(uid?: string): boolean {
    return Boolean(uid && typeof uid === 'string' && uid.trim().length > 0);
  }

  /**
   * Extract error message from various error types
   */
  static extractErrorMessage(err: unknown): string {
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === 'string') {
      return err;
    }
    if (err && typeof err === 'object' && 'message' in err) {
      return String((err as any).message);
    }
    return "予期しないエラーが発生しました";
  }

  /**
   * Get Firebase-specific error messages
   */
  static getFirebaseErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'code' in err) {
      const firebaseError = err as { code: string; message: string };
      
      switch (firebaseError.code) {
        case "auth/weak-password":
          return "パスワードは6文字以上で入力してください";
        case "auth/email-already-in-use":
          return "このメールアドレス・ニックネームは既に使用されています";
        case "auth/invalid-email":
          return "メールアドレスの形式が無効です";
        case "auth/operation-not-allowed":
          return "このプロジェクトでメール認証が無効になっています";
        default:
          return firebaseError.message || "ユーザーの作成に失敗しました";
      }
    }
    
    return this.extractErrorMessage(err);
  }

  /**
   * Validate user creation parameters
   */
  static validateUserCreation(params: {
    email: string;
    password: string;
    nickname: string;
    role: "master" | "user";
    storeId?: string;
  }): { isValid: boolean; error?: string } {
    const { email, password, nickname, storeId } = params;

    if (!this.isValidStoreId(storeId)) {
      return { isValid: false, error: "店舗IDを入力してください" };
    }

    const trimmedNickname = (nickname || "").trim();
    if (!trimmedNickname) {
      return { isValid: false, error: "ニックネームを入力してください" };
    }

    if (trimmedNickname.length > 50) {
      return { isValid: false, error: "ニックネームは50文字以内で入力してください" };
    }

    if (!password || password.length < 6) {
      return { isValid: false, error: "パスワードは6文字以上で入力してください" };
    }

    // Email validation (optional)
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return { isValid: false, error: "有効なメールアドレスを入力してください" };
      }
    }

    return { isValid: true };
  }

  /**
   * Validate user update parameters
   */
  static validateUserUpdate(params: {
    user: User;
    updates: {
      nickname?: string;
      email?: string;
      password?: string;
      role?: "master" | "user";
      color?: string;
      storeId?: string;
    };
  }): { isValid: boolean; error?: string } {
    const { updates } = params;

    // Validate nickname if provided
    if (updates.nickname !== undefined) {
      const trimmedNickname = (updates.nickname || "").trim();
      if (!trimmedNickname) {
        return { isValid: false, error: "ニックネームを入力してください" };
      }
      if (trimmedNickname.length > 50) {
        return { isValid: false, error: "ニックネームは50文字以内で入力してください" };
      }
    }

    // Validate email if provided
    if (updates.email !== undefined && updates.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email.trim())) {
        return { isValid: false, error: "有効なメールアドレスを入力してください" };
      }
    }

    // Validate password if provided
    if (updates.password !== undefined && updates.password) {
      if (updates.password.length < 6) {
        return { isValid: false, error: "パスワードは6文字以上で入力してください" };
      }
    }

    return { isValid: true };
  }

  /**
   * Sanitize nickname
   */
  static sanitizeNickname(nickname: string): string {
    return (nickname || "").trim().substring(0, 50);
  }

  /**
   * Sanitize email
   */
  static sanitizeEmail(email: string): string {
    return (email || "").trim();
  }

  /**
   * Generate safe email address
   */
  static generateSafeEmail(params: {
    providedEmail: string;
    nickname: string;
    storeId: string;
    role: "master" | "user";
  }): string {
    const { providedEmail, nickname, storeId, role } = params;
    
    if (providedEmail && providedEmail.trim()) {
      return providedEmail.trim();
    }

    const sanitizeForEmail = (str: string) =>
      (str || "").replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    const sanitizedStoreId = sanitizeForEmail(storeId);
    const sanitizedNickname = sanitizeForEmail(nickname);

    if (role === "master") {
      return `${sanitizedStoreId}master@example.com`;
    } else {
      return `${sanitizedStoreId}${sanitizedNickname}@example.com`;
    }
  }

  /**
   * Sanitize user updates
   */
  static sanitizeUserUpdates(updates: {
    nickname?: string;
    email?: string;
    password?: string;
    role?: "master" | "user";
    color?: string;
    storeId?: string;
  }) {
    const sanitized: typeof updates = {};

    if (updates.nickname !== undefined) {
      sanitized.nickname = this.sanitizeNickname(updates.nickname);
    }

    if (updates.email !== undefined) {
      sanitized.email = this.sanitizeEmail(updates.email);
    }

    if (updates.password !== undefined) {
      sanitized.password = updates.password;
    }

    if (updates.role !== undefined) {
      sanitized.role = updates.role;
    }

    if (updates.color !== undefined) {
      sanitized.color = updates.color;
    }

    if (updates.storeId !== undefined) {
      sanitized.storeId = updates.storeId;
    }

    return sanitized;
  }
}
