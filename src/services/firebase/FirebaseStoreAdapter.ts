import type { IStoreService } from "../interfaces/IStoreService";
import { GroupService } from "./firebase-group";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase-core";

export class FirebaseStoreAdapter implements IStoreService {
  async getStore(storeId: string): Promise<{ storeId: string; storeName: string; adminUid?: string; adminNickname?: string; [key: string]: any } | null> {
    const docRef = doc(db, "stores", storeId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return {
      storeId,
      storeName: data["storeName"] || data["name"] || "",
      adminUid: data["adminUid"],
      adminNickname: data["adminNickname"],
      ...data,
    };
  }

  checkStoreIdExists = GroupService.checkStoreIdExists;
  generateUniqueStoreId = GroupService.generateUniqueStoreId;
  createGroup = GroupService.createGroup;
  checkGroupExists = GroupService.checkGroupExists;
}
