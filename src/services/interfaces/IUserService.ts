/** @file IUserService.ts @description ユーザー情報の取得・検索・削除のインターフェース */

import { User, UserData, UserRole } from "@/common/common-models/model-user/UserModel";

/** メールアドレスによるユーザー検索の結果 */
export interface UserEmailLookupResult {
  /** ドキュメントID */
  id: string;
  /** ユーザーUID */
  uid: string;
  /** ニックネーム */
  nickname: string;
  /** メールアドレス */
  email: string;
  /** ロール */
  role: UserRole;
  /** 店舗ID */
  storeId: string;
  /** 表示カラー */
  color?: string;
  /** 時給 */
  hourlyWage?: number;
  /** 実メールアドレス */
  realEmail?: string;
  /** 実メールアドレスのユーザーID */
  realEmailUserId?: string;
}

/** ユーザーの完全プロフィール */
export interface UserFullProfile {
  /** ユーザーUID */
  uid?: string;
  /** ニックネーム */
  nickname?: string;
  /** ロール */
  role?: string;
  /** メールアドレス */
  email?: string;
  /** 店舗ID */
  storeId?: string;
  /** 連携店舗ID一覧 */
  connectedStores?: string[];
  /** 表示カラー */
  color?: string;
  /** 時給 */
  hourlyWage?: number;
}

/** ユーザー情報の取得・検索・削除を行うサービス */
export interface IUserService {
  /** 店舗のユーザー一覧を取得する */
  getUsers(storeId?: string): Promise<(User & { currentPassword?: string })[]>;

  /** ユーザーを削除する */
  deleteUser(id: string): Promise<void>;

  /** ユーザーデータを取得する */
  getUserData(userId: string): Promise<UserData | null>;

  /** マスターユーザーの存在を確認する */
  checkMasterExists(storeId?: string): Promise<boolean>;

  /** メールアドレスの存在を確認する */
  checkEmailExists(email: string, storeId?: string): Promise<boolean>;

  /** メールアドレスの重複をチェックする */
  checkEmailDuplicate(email: string): Promise<void>;

  /** メールアドレスでユーザーを検索する */
  findUserByEmail(email: string): Promise<UserEmailLookupResult | null>;

  /** ユーザーに実メールアドレスを追加する */
  addSecondaryEmail(userId: string, realEmail: string): Promise<void>;

  /** ユーザーを安全に削除する（本人操作） */
  secureDeleteUser(userId: string, storeId: string): Promise<void>;

  /** ユーザーを安全に削除する（管理者操作） */
  secureDeleteUserByAdmin(targetUserId: string, storeId: string, adminUserId: string): Promise<void>;

  /** ユーザーの完全プロフィールを取得する */
  getUserFullProfile(userId: string): Promise<UserFullProfile | null>;
}
