import type { UserRole } from "@/common/common-models/model-user/UserModel";

export interface User {
  uid: string;
  nickname: string;
  role: UserRole;
  email?: string;
  storeId?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  authError: string | null;
  signIn: (emailOrUsername: string, password: string, storeId?: string) => Promise<void>;
  signOut: () => Promise<void>;
}
