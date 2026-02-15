export interface User {
  uid: string;
  nickname: string;
  role: "master" | "user";
  email?: string;
  storeId?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: "master" | "user" | null;
  authError: string | null;
  signIn: (emailOrUsername: string, password: string, storeId?: string) => Promise<void>;
  signOut: () => Promise<void>;
}
