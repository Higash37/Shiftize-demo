/**
 * @file auth.d.ts
 * @description 認証関連の型定義ファイル。
 *
 * 【このファイルの位置づけ】
 * `.d.ts` はTypeScriptの「型宣言ファイル」。
 * 実際のコード（関数の実装など）は含まず、型情報だけを定義する。
 * AuthContext.tsx やその他の認証関連ファイルから参照される。
 *
 * 【TypeScript構文解説: interface】
 * interface はオブジェクトの「形」を定義するもの。
 * 例えば User interface を使うと「uid, nickname, role を持つオブジェクト」を表現できる。
 * 実行時には消えるが、コンパイル時に型チェックが行われ、タイプミスを防げる。
 */

import type { UserRole } from "@/common/common-models/model-user/UserModel";

/**
 * 認証済みユーザーの情報を表す型。
 * AuthContext 内でログイン後にセットされる。
 */
export interface User {
  /** Supabase Auth が発行する一意のユーザーID（UUID形式） */
  uid: string;
  /** ユーザーの表示名 */
  nickname: string;
  /** ユーザーの権限。"master"（管理者）または "user"（一般ユーザー） */
  role: UserRole;
  /** メールアドレス（オプショナル。`?` は「あってもなくてもよい」の意味） */
  email?: string;
  /** 所属店舗のID（オプショナル） */
  storeId?: string;
}

/**
 * AuthContext が提供する値の型。
 * useAuth() フックを通じてコンポーネントからアクセスできるプロパティ・メソッド。
 *
 * 【認証フローの全体像】
 *
 *   LoginForm（UI）
 *       │
 *       │ onLogin(email, password)
 *       ▼
 *   login/index.tsx の handleLogin
 *       │
 *       │ signIn(email, password)  ← ここが AuthContextType.signIn
 *       ▼
 *   AuthContext.tsx の signIn 実装
 *       │
 *       │ supabase.auth.signInWithPassword({ email, password })
 *       ▼
 *   Supabase Auth API（サーバー側でパスワード検証）
 *       │
 *       │ 成功 → session が返る
 *       ▼
 *   AuthContext が user 情報を state にセット
 *       │
 *       │ useAuth() 経由で全コンポーネントに通知
 *       ▼
 *   画面遷移（master → master/home, user → user/home）
 */
export interface AuthContextType {
  /** 現在ログインしているユーザー情報。未ログインなら null */
  user: User | null;
  /** 認証情報の読み込み中フラグ */
  loading: boolean;
  /** ログイン済みかどうか */
  isAuthenticated: boolean;
  /** ユーザーの権限。未ログインなら null */
  role: UserRole | null;
  /** 認証エラーメッセージ。エラーがなければ null */
  authError: string | null;
  /**
   * ログイン処理。
   * @param emailOrUsername - メールアドレスまたはニックネーム
   * @param password        - パスワード
   * @param storeId         - 店舗ID（ニックネームログイン時に必要）
   */
  signIn: (emailOrUsername: string, password: string, storeId?: string) => Promise<void>;
  /** ログアウト処理 */
  signOut: () => Promise<void>;
}
