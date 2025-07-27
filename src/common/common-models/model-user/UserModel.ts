/**
 * ユーザー関連の型定義
 */

/**
 * ユーザーの基本情報
 */
export interface User {
  uid: string;
  role: "master" | "user";
  nickname: string;
  email?: string; // メールアドレスを追加
  storeId?: string; // 店舗IDを追加
  color?: string; // 講師ごとの色
  hourlyWage?: number; // 時給
  currentPassword?: string; // パスワード
}

/**
 * ユーザーデータの詳細情報
 */
export interface UserData {
  nickname: string;
  role: "master" | "user";
  email: string;
  currentPassword?: string;
  createdAt: Date;
  hourlyWage?: number; // 時給
}
