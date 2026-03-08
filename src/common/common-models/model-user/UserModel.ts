/**
 * ユーザー関連の型定義
 */

/** ユーザーのロール */
export type UserRole = "master" | "user";

/**
 * ユーザーの基本情報
 */
export interface User {
  uid: string;
  role: UserRole;
  nickname: string;
  furigana?: string;
  email?: string;
  storeId?: string;
  color?: string;
  hourlyWage?: number;
  currentPassword?: string;
  createdAt?: string;
}

/**
 * ユーザーデータの詳細情報
 */
export interface UserData {
  nickname: string;
  role: UserRole;
  email: string;
  currentPassword?: string;
  createdAt: Date;
  hourlyWage?: number;
}
