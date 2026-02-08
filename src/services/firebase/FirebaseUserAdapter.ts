import type { IUserService } from "../interfaces/IUserService";
import { UserService } from "./firebase-user";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase-core";

export class FirebaseUserAdapter implements IUserService {
  getUsers = UserService.getUsers;
  deleteUser = UserService.deleteUser;
  getUserData = UserService.getUserData;
  checkMasterExists = UserService.checkMasterExists;
  checkEmailExists = UserService.checkEmailExists;
  checkEmailDuplicate = UserService.checkEmailDuplicate;
  findUserByEmail = UserService.findUserByEmail;
  addSecondaryEmail = UserService.addSecondaryEmail;
  secureDeleteUser = UserService.secureDeleteUser;
  secureDeleteUserByAdmin = UserService.secureDeleteUserByAdmin;

  async getUserFullProfile(userId: string): Promise<{
    storeId?: string;
    connectedStores?: string[];
    [key: string]: any;
  } | null> {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return null;
    const data = userDoc.data();
    return {
      ...data,
      storeId: data["storeId"],
      connectedStores: data["connectedStores"] || [],
    };
  }
}
