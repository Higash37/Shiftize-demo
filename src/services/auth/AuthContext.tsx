import React, { createContext, useContext, useEffect, useState } from "react";
import { ServiceProvider } from "../ServiceProvider";
import { getSupabase } from "../supabase/supabase-client";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  role: "master" | "user" | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUserAndRole: (user: AuthUser, role: "master" | "user") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<"master" | "user" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const supabaseUser = session.user;
          try {
            const userRole = await ServiceProvider.auth.getUserRole({
              uid: supabaseUser.id,
            });
            setUser({
              uid: supabaseUser.id,
              email: supabaseUser.email ?? null,
              displayName:
                supabaseUser.user_metadata?.['display_name'] ?? null,
            });
            setRole(userRole);
          } catch {
            setUser({
              uid: supabaseUser.id,
              email: supabaseUser.email ?? null,
              displayName: null,
            });
            setRole(null);
          }
        } else {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    await ServiceProvider.auth.signIn(email, password);
  };

  const handleSignOut = async () => {
    await ServiceProvider.auth.signOut();
  };

  const setUserAndRole = (user: AuthUser, role: "master" | "user") => {
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
