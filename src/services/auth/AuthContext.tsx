import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, signIn, signOutUser } from "../firebase/firebase";
import { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  role: "master" | "user" | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUserAndRole: (user: User, role: "master" | "user") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"master" | "user" | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        // メールアドレスからロールを判定
        const userRole = user.email?.includes("master") ? "master" : "user";
        setRole(userRole);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
    } catch (error) {
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      throw error;
    }
  };
  const setUserAndRole = (user: User, role: "master" | "user") => {
    setUser(user);
    setRole(role);
  };
  const value = {
    user,
    role,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    setUserAndRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
