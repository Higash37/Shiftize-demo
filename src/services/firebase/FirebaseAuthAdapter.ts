import type { IAuthService } from "../interfaces/IAuthService";
import { AuthService } from "./firebase-auth";
import { auth } from "./firebase-core";
import type { User } from "@/common/common-models/model-user/UserModel";

export class FirebaseAuthAdapter implements IAuthService {
  signIn(email: string, password: string): Promise<User> {
    return AuthService.signIn(email, password);
  }

  signOut(): Promise<void> {
    return AuthService.signOut();
  }

  getUserRole(user: { uid: string }): Promise<"master" | "user"> {
    return AuthService.getUserRole(user);
  }

  createUser(
    email: string,
    password: string,
    nickname?: string,
    color?: string,
    storeId?: string,
    role?: "master" | "user",
    hourlyWage?: number
  ): Promise<User> {
    return AuthService.createUser(email, password, nickname, color, storeId, role, hourlyWage);
  }

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
  ): Promise<User | undefined> {
    return AuthService.updateUser(user, updates);
  }

  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return AuthService.changePassword(currentPassword, newPassword);
  }

  createSecondaryEmailAccount(
    originalUser: { uid: string; nickname?: string; role?: string; color?: string; storeId?: string; hourlyWage?: number },
    realEmail: string,
    password: string
  ): Promise<void> {
    return AuthService.createSecondaryEmailAccount(originalUser, realEmail, password);
  }

  createInitialMasterUser(): Promise<void> {
    return AuthService.createInitialMasterUser();
  }

  getCurrentUser(): { uid: string; email: string | null; displayName: string | null } | null {
    const user = auth.currentUser;
    if (!user) return null;
    return { uid: user.uid, email: user.email, displayName: user.displayName };
  }

  onAuthStateChanged(callback: (user: { uid: string; email: string | null; displayName: string | null } | null) => void): () => void {
    return auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        callback({ uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName });
      } else {
        callback(null);
      }
    });
  }
}
