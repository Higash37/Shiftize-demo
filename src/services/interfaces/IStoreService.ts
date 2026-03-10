/** @file IStoreService.ts @description 店舗（グループ）の作成・取得・存在確認のインターフェース */

import type { UserRole } from "@/common/common-models/model-user/UserModel";

/** グループ作成時の入力データ */
export interface CreateGroupData {
  /** グループ名 */
  groupName: string;
  /** 店舗ID */
  storeId: string;
  /** 管理者のニックネーム */
  adminNickname: string;
  /** 管理者のメールアドレス */
  adminEmail?: string;
  /** 管理者のパスワード */
  adminPassword: string;
  /** 初期メンバー一覧 */
  initialMembers?: InitialMember[];
}

/** 初期メンバーの情報 */
export interface InitialMember {
  /** ニックネーム */
  nickname: string;
  /** パスワード */
  password: string;
  /** ロール */
  role: UserRole;
  /** 表示カラー */
  color: string;
  /** 時給 */
  hourlyWage?: number;
}

/** グループ作成の結果 */
export interface GroupCreationResult {
  /** 成功したかどうか */
  success: boolean;
  /** 店舗ID */
  storeId: string;
  /** 管理者UID */
  adminUid: string;
  /** 管理者メールアドレス */
  adminEmail?: string;
  /** 結果メッセージ */
  message: string;
}

/** 店舗プロフィール */
export interface StoreProfile {
  /** 店舗ID */
  storeId: string;
  /** 店舗名 */
  storeName: string;
  /** 管理者UID */
  adminUid?: string;
  /** 管理者ニックネーム */
  adminNickname?: string;
  /** アクティブかどうか */
  isActive?: boolean;
}

/** 店舗の作成・取得・存在確認を行うサービス */
export interface IStoreService {
  /** 店舗情報を取得する */
  getStore(storeId: string): Promise<StoreProfile | null>;

  /** 店舗IDの存在を確認する */
  checkStoreIdExists(storeId: string): Promise<boolean>;

  /** 一意な店舗IDを生成する */
  generateUniqueStoreId(): Promise<string>;

  /** グループ（店舗）を作成する */
  createGroup(data: CreateGroupData): Promise<GroupCreationResult>;

  /** グループの存在を確認する */
  checkGroupExists(storeId: string): Promise<{ exists: boolean; groupName?: string }>;
}
