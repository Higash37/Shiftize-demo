export interface User {
  uid: string;
  nickname: string;
  role: "master" | "user";
  email?: string;
  storeId?: string; // Store IDを追加
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: "master" | "user" | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
