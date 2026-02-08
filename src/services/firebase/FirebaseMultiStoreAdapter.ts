import type {
  IMultiStoreService,
  StoreAccess,
  StoreInfo,
  UserStoreAccess,
  ConnectedStoreUser,
} from "../interfaces/IMultiStoreService";
import { MultiStoreService } from "../firebase/firebase-multistore";

/**
 * Firebase adapter that delegates to the existing MultiStoreService.
 * The underlying service already uses Firebase directly.
 */
export class FirebaseMultiStoreAdapter implements IMultiStoreService {
  async getUserStoreAccess(userUid: string): Promise<UserStoreAccess | null> {
    return MultiStoreService.getUserStoreAccess(userUid);
  }

  async inviteUserToStore(
    inviterUid: string,
    inviterStoreId: string,
    userEmail: string,
    nickname: string,
    role: "master" | "user" = "user"
  ): Promise<void> {
    return MultiStoreService.inviteUserToStore(inviterUid, inviterStoreId, userEmail, nickname, role);
  }

  async switchCurrentStore(userUid: string, storeId: string): Promise<void> {
    return MultiStoreService.switchCurrentStore(userUid, storeId);
  }

  async getAllStores(): Promise<StoreInfo[]> {
    return MultiStoreService.getAllStores();
  }

  async removeUserFromStore(
    removerUid: string,
    targetUserUid: string,
    storeId: string
  ): Promise<void> {
    return MultiStoreService.removeUserFromStore(removerUid, targetUserUid, storeId);
  }

  async migrateLegacyUser(userUid: string): Promise<void> {
    return MultiStoreService.migrateLegacyUser(userUid);
  }

  async generateConnectionPassword(storeId: string, userUid: string): Promise<string> {
    return MultiStoreService.generateConnectionPassword(storeId, userUid);
  }

  async connectStores(
    fromStoreId: string,
    toStoreId: string,
    connectionPassword: string,
    userUid: string
  ): Promise<void> {
    return MultiStoreService.connectStores(fromStoreId, toStoreId, connectionPassword, userUid);
  }

  async disconnectStores(
    storeId1: string,
    storeId2: string,
    userUid: string
  ): Promise<void> {
    return MultiStoreService.disconnectStores(storeId1, storeId2, userUid);
  }

  async getConnectedStoreUsers(storeId: string): Promise<ConnectedStoreUser[]> {
    return MultiStoreService.getConnectedStoreUsers(storeId);
  }

  async getConnectedStores(userUid: string): Promise<StoreInfo[]> {
    return MultiStoreService.getConnectedStores(userUid);
  }

  async updateUsersConnectedStores(
    storeId1: string,
    storeId2: string,
    action: "connect" | "disconnect"
  ): Promise<void> {
    return MultiStoreService.updateUsersConnectedStores(storeId1, storeId2, action);
  }
}
