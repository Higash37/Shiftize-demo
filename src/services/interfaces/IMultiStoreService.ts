/** @file IMultiStoreService.ts @description 複数店舗管理・店舗間連携のインターフェース */

import type { UserRole } from "@/common/common-models/model-user/UserModel";

/** ユーザーの店舗アクセス情報 */
export interface StoreAccess {
  /** 店舗ID */
  storeId: string;
  /** 店舗名 */
  storeName: string;
  /** ロール */
  role: UserRole;
  /** ニックネーム */
  nickname: string;
  /** 参加日時 */
  joinedAt: Date;
  /** アクティブかどうか */
  isActive: boolean;
}

/** 店舗の基本情報 */
export interface StoreInfo {
  /** 店舗ID */
  storeId: string;
  /** 店舗名 */
  storeName: string;
  /** 管理者UID */
  adminUid: string;
  /** 管理者ニックネーム */
  adminNickname: string;
  /** アクティブかどうか */
  isActive: boolean;
  /** 作成日時 */
  createdAt: Date;
  /** 連携中の店舗ID一覧 */
  connectedStores?: string[];
  /** 店舗連携パスワード */
  connectionPassword?: string;
  /** 連携パスワードの有効期限 */
  connectionPasswordExpiry?: Date;
}

/** ユーザーの全店舗アクセス情報 */
export interface UserStoreAccess {
  /** ユーザーUID */
  uid: string;
  /** メールアドレス */
  email: string;
  /** ニックネーム */
  nickname: string;
  /** 店舗ごとのアクセス情報 */
  storesAccess: Record<string, StoreAccess>;
  /** 現在選択中の店舗ID */
  currentStoreId: string;
}

/** 連携店舗のユーザー情報 */
export interface ConnectedStoreUser {
  /** ユーザーUID */
  uid: string;
  /** ニックネーム */
  nickname: string;
  /** メールアドレス */
  email: string;
  /** ロール */
  role: string;
  /** 所属店舗ID */
  storeId: string;
  /** 所属店舗名 */
  storeName: string;
  /** 他店舗からの連携ユーザーかどうか */
  isFromOtherStore: boolean;
}

/** 複数店舗の管理・店舗間連携を行うサービス */
export interface IMultiStoreService {
  /** ユーザーの店舗アクセス情報を取得する */
  getUserStoreAccess(userUid: string): Promise<UserStoreAccess | null>;

  /** ユーザーを店舗に招待する */
  inviteUserToStore(
    inviterUid: string,
    inviterStoreId: string,
    userEmail: string,
    nickname: string,
    role?: UserRole
  ): Promise<void>;

  /** 現在の店舗を切り替える */
  switchCurrentStore(userUid: string, storeId: string): Promise<void>;

  /** 全店舗一覧を取得する */
  getAllStores(): Promise<StoreInfo[]>;

  /** ユーザーを店舗から削除する */
  removeUserFromStore(removerUid: string, targetUserUid: string, storeId: string): Promise<void>;

  /** 旧形式のユーザーデータを移行する */
  migrateLegacyUser(userUid: string): Promise<void>;

  /** 店舗連携用パスワードを生成する */
  generateConnectionPassword(storeId: string, userUid: string): Promise<string>;

  /** 店舗同士を連携する */
  connectStores(
    fromStoreId: string,
    toStoreId: string,
    connectionPassword: string,
    userUid: string
  ): Promise<void>;

  /** 店舗間の連携を解除する */
  disconnectStores(storeId1: string, storeId2: string, userUid: string): Promise<void>;

  /** 連携店舗のユーザー一覧を取得する */
  getConnectedStoreUsers(storeId: string): Promise<ConnectedStoreUser[]>;

  /** 連携済み店舗一覧を取得する */
  getConnectedStores(userUid: string): Promise<StoreInfo[]>;

  /** 店舗連携時にユーザーのconnectedStoresを更新する */
  updateUsersConnectedStores(
    storeId1: string,
    storeId2: string,
    action: "connect" | "disconnect"
  ): Promise<void>;
}
