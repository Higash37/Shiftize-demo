export interface StoreAccess {
  storeId: string;
  storeName: string;
  role: "master" | "user";
  nickname: string;
  joinedAt: Date;
  isActive: boolean;
}

export interface StoreInfo {
  storeId: string;
  storeName: string;
  adminUid: string;
  adminNickname: string;
  isActive: boolean;
  createdAt: Date;
  connectedStores?: string[];
  connectionPassword?: string;
  connectionPasswordExpiry?: Date;
}

export interface UserStoreAccess {
  uid: string;
  email: string;
  nickname: string;
  storesAccess: Record<string, StoreAccess>;
  currentStoreId: string;
}

export interface ConnectedStoreUser {
  uid: string;
  nickname: string;
  email: string;
  role: string;
  storeId: string;
  storeName: string;
  isFromOtherStore: boolean;
}

export interface IMultiStoreService {
  getUserStoreAccess(userUid: string): Promise<UserStoreAccess | null>;

  inviteUserToStore(
    inviterUid: string,
    inviterStoreId: string,
    userEmail: string,
    nickname: string,
    role?: "master" | "user"
  ): Promise<void>;

  switchCurrentStore(userUid: string, storeId: string): Promise<void>;

  getAllStores(): Promise<StoreInfo[]>;

  removeUserFromStore(removerUid: string, targetUserUid: string, storeId: string): Promise<void>;

  migrateLegacyUser(userUid: string): Promise<void>;

  generateConnectionPassword(storeId: string, userUid: string): Promise<string>;

  connectStores(
    fromStoreId: string,
    toStoreId: string,
    connectionPassword: string,
    userUid: string
  ): Promise<void>;

  disconnectStores(storeId1: string, storeId2: string, userUid: string): Promise<void>;

  getConnectedStoreUsers(storeId: string): Promise<ConnectedStoreUser[]>;

  getConnectedStores(userUid: string): Promise<StoreInfo[]>;

  updateUsersConnectedStores(
    storeId1: string,
    storeId2: string,
    action: "connect" | "disconnect"
  ): Promise<void>;
}
