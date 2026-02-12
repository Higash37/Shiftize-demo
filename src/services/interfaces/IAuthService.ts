import { User } from "@/common/common-models/model-user/UserModel";

export interface IAuthService {
  signIn(email: string, password: string): Promise<User>;

  signOut(): Promise<void>;

  getUserRole(user: { uid: string }): Promise<"master" | "user">;

  createUser(
    email: string,
    password: string,
    nickname?: string,
    color?: string,
    storeId?: string,
    role?: "master" | "user",
    hourlyWage?: number
  ): Promise<User>;

  updateUser(
    user: User,
    updates: {
      nickname?: string;
      email?: string;
      password?: string;
      role?: "master" | "user";
      color?: string;
      storeId?: string;
    }
  ): Promise<User | undefined>;

  changePassword(currentPassword: string, newPassword: string): Promise<void>;

  createSecondaryEmailAccount(
    originalUser: { uid: string; nickname?: string; role?: string; color?: string; storeId?: string; hourlyWage?: number },
    realEmail: string,
    password: string
  ): Promise<void>;

  createInitialMasterUser(): Promise<void>;

  /** OAuth連携: プロバイダーにリンク */
  linkOAuthIdentity(provider: "google" | "apple"): Promise<void>;

  /** OAuth連携: 連携済みプロバイダー一覧取得 */
  getLinkedIdentities(): Promise<Array<{ provider: string; email?: string }>>;

  /** OAuth連携: プロバイダーのリンク解除 */
  unlinkOAuthIdentity(provider: "google" | "apple"): Promise<void>;

  /** Google OAuth連携（Calendarスコープ付き） */
  linkGoogleWithCalendarScope(): Promise<void>;

  /** Access to the underlying auth state (for onAuthStateChanged, currentUser, etc.) */
  getCurrentUser(): { uid: string; email: string | null; displayName: string | null } | null;

  onAuthStateChanged(callback: (user: { uid: string; email: string | null; displayName: string | null } | null) => void): () => void;
}
