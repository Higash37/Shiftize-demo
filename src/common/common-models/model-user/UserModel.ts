/**
 * @file UserModel.ts
 * @description ユーザー関連の型定義
 *
 * ============================================================
 * 【なぜ "Model" を型定義に使うのか — MVC パターンの歴史】
 * ============================================================
 *
 * ■ Model とは
 *   現実世界の「もの」をコードで表現したもの。
 *   ユーザー、シフト、店舗など、アプリが扱うデータの「形」を定義する。
 *   例: ユーザーには uid, nickname, role がある → それを TypeScript の型で書く。
 *
 * ■ MVC パターンの歴史
 *   MVC（Model-View-Controller）は 1979 年に Smalltalk 言語で発明された
 *   ソフトウェア設計パターン。40年以上の歴史を持つ。
 *   - Model: データの形と業務ロジック（このファイル）
 *   - View: 画面表示（React コンポーネント）
 *   - Controller: ユーザー操作の処理（イベントハンドラ、フックなど）
 *
 * ■ このプロジェクトでの使い方
 *   Model = TypeScript の type / interface でデータの「形」を定義するファイル。
 *   DB のテーブル構造に対応する型を定義するのが主な役割。
 *   例: User インターフェースは Supabase の users テーブルの列に対応している。
 *
 * ■ ケースバイケース（Model vs types.ts）
 *   - DB のテーブル構造に対応する型 → Model（例: UserModel.ts, ShiftModel.ts）
 *     理由: アプリ全体で共有され、永続化されるデータだから
 *   - UI 専用の一時的な型 → types.ts（例: LoginForm.types.ts, GanttView.types.ts）
 *     理由: 特定の画面でしか使わず、DB に保存しないデータだから
 * ============================================================
 */

/** ユーザーのロール */
export type UserRole = "master" | "user";

/** ユーザーの基本情報。DBのusersテーブルに対応 */
export interface User {
  /** Supabase Auth UID */
  uid: string;
  /** ロール */
  role: UserRole;
  /** 表示名 */
  nickname: string;
  /** ふりがな */
  furigana?: string;
  /** メールアドレス */
  email?: string;
  /** 所属店舗ID */
  storeId?: string;
  /** ガントチャート等で使うユーザー固有色 */
  color?: string;
  /** 時給（円） */
  hourlyWage?: number;
  /** 現在のパスワード（変更時のみ使用） */
  currentPassword?: string;
  /** 作成日時 */
  createdAt?: string;
}

/** ユーザーデータの詳細情報（管理画面の一覧表示用） */
export interface UserData {
  /** 表示名 */
  nickname: string;
  /** ロール */
  role: UserRole;
  /** メールアドレス */
  email: string;
  /** 現在のパスワード（変更時のみ） */
  currentPassword?: string;
  /** 作成日時 */
  createdAt: Date;
  /** 時給（円） */
  hourlyWage?: number;
}
