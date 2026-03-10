/**
 * @file IAuthService.ts
 * @description 認証・ユーザー作成・OAuth連携のインターフェース
 *
 * ============================================================
 * 【なぜ "I" プレフィックス付きの "Interface" を使うのか — インターフェースの歴史】
 * ============================================================
 *
 * ■ インターフェースとは
 *   インターフェース = 「契約書」。
 *   実装の中身（どう動くか）は知らなくていい。
 *   メソッドの名前と型（何ができるか）だけを定義する。
 *   例: 「signIn は email と password を受け取って User を返す」という約束だけ決める。
 *
 * ■ "I" プレフィックスの由来
 *   C# / .NET の命名規約が起源。IDisposable, IEnumerable など。
 *   TypeScript では "I" を付けるかどうかは任意（公式スタイルガイドでは推奨していない）。
 *   しかし、このプロジェクトでは「インターフェースと実装クラスを一目で区別できる」
 *   というメリットを重視して "I" プレフィックスを採用している。
 *
 * ■ 代替パターン（ケースバイケース）
 *   - プレフィックスなし（Java スタイル）: AuthService（インターフェース） / AuthServiceImpl（実装）
 *   - "Service" サフィックスのみ: AuthService（実装も同名、フォルダで分離）
 *   → 小規模プロジェクトならプレフィックスなしでもOK。
 *     実装が複数ある場合（Supabase版、Firebase版など）は "I" 付きが分かりやすい。
 *
 * ■ なぜ interface なのか（最も重要なポイント）
 *   将来 Supabase 以外のバックエンド（Firebase、自前APIなど）に切り替えたくなっても、
 *   この IAuthService インターフェースを満たす別のアダプター（例: FirebaseAuthAdapter）を
 *   作るだけでOK。呼び出し側のコードは一切変更不要。
 *   → これを「依存性の逆転（Dependency Inversion）」と呼ぶ。
 * ============================================================
 */

import { User, UserRole } from "@/common/common-models/model-user/UserModel";

/** 認証・ユーザー管理・OAuth連携を行うサービス */
export interface IAuthService {
  /** メールとパスワードでサインインする */
  signIn(email: string, password: string): Promise<User>;

  /** サインアウトする */
  signOut(): Promise<void>;

  /** ユーザーのロールを取得する */
  getUserRole(user: { uid: string }): Promise<UserRole>;

  /** ユーザーを新規作成する */
  createUser(
    email: string,
    password: string,
    nickname?: string,
    color?: string,
    storeId?: string,
    role?: UserRole,
    hourlyWage?: number,
    furigana?: string
  ): Promise<User>;

  /** ユーザー情報を更新する */
  updateUser(
    user: User,
    updates: {
      nickname?: string;
      furigana?: string;
      email?: string;
      password?: string;
      role?: UserRole;
      color?: string;
      storeId?: string;
    }
  ): Promise<User | undefined>;

  /** パスワードを変更する */
  changePassword(currentPassword: string, newPassword: string): Promise<void>;

  /** 実メールアドレス用のセカンダリアカウントを作成する */
  createSecondaryEmailAccount(
    originalUser: { uid: string; nickname?: string; role?: string; color?: string; storeId?: string; hourlyWage?: number },
    realEmail: string,
    password: string
  ): Promise<void>;

  /** 初期マスターユーザーを作成する */
  createInitialMasterUser(): Promise<void>;

  /** OAuthプロバイダーをアカウントにリンクする */
  linkOAuthIdentity(provider: "google" | "apple"): Promise<void>;

  /** 連携済みOAuthプロバイダー一覧を取得する */
  getLinkedIdentities(): Promise<Array<{ provider: string; email?: string }>>;

  /** OAuthプロバイダーのリンクを解除する */
  unlinkOAuthIdentity(provider: "google" | "apple"): Promise<void>;

  /** Google OAuth連携（Calendarスコープ付き） */
  linkGoogleWithCalendarScope(): Promise<void>;

  /** 現在のログインユーザーを取得する */
  getCurrentUser(): { uid: string; email: string | null; displayName: string | null } | null;

  /** 認証状態の変更をリアルタイム監視する */
  onAuthStateChanged(callback: (user: { uid: string; email: string | null; displayName: string | null } | null) => void): () => void;
}
