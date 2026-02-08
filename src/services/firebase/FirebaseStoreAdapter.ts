import type { IStoreService } from "../interfaces/IStoreService";
import { GroupService } from "./firebase-group";

export class FirebaseStoreAdapter implements IStoreService {
  checkStoreIdExists = GroupService.checkStoreIdExists;
  generateUniqueStoreId = GroupService.generateUniqueStoreId;
  createGroup = GroupService.createGroup;
  checkGroupExists = GroupService.checkGroupExists;
}
