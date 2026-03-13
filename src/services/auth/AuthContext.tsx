/**
 * @file AuthContext.tsx
 * @description アプリ全体の認証状態を管理するReact Context。
 *
 * ============================================================
 * 【なぜ "Context" というパターンを使うのか — React Context の歴史と代替手段】
 * ============================================================
 *
 * ■ Props drilling（バケツリレー）問題
 *   Reactでは親から子へデータを渡すのに「props」を使う。
 *   しかし、認証情報のように「アプリ全体」で必要なデータを props だけで渡そうとすると、
 *   途中の全てのコンポーネントが「自分は使わないのに子に渡すためだけに」props を受け取る
 *   ことになる。これを Props drilling（バケツリレー）と呼ぶ。
 *
 *   例: App → Layout → Header → UserMenu → UserIcon で user を表示したい場合、
 *       App → Layout → Header → UserMenu → UserIcon の全階層に user props が必要になる。
 *       Layout や Header は user を使わないのに、通過のためだけに props を持つ。
 *
 * ■ Context が解決する問題
 *   Context を使うと、Provider で包んだ範囲内のどのコンポーネントからでも、
 *   中間のコンポーネントを経由せずに直接データを取得できる。
 *   useAuth() と書くだけで、どの階層からでも認証情報にアクセスできる。
 *
 * ■ 代替手段との比較
 *   - Redux: 大規模アプリ向けの状態管理ライブラリ。ボイラープレートが多い。
 *            グローバルな状態が多い（50以上の状態）場合に威力を発揮する。
 *   - Zustand: Redux よりシンプルな状態管理。中規模アプリに適している。
 *   - Jotai: アトム（原子）単位で状態を管理。React の思想に近い。
 *   - この場合は Context で十分な理由:
 *     認証情報は「アプリ全体で1つだけ」「更新頻度が低い（ログイン/ログアウト時のみ）」
 *     「状態の種類が少ない（user, role, loading, error の4つ）」ため、
 *     Redux や Zustand のような外部ライブラリを導入する必要がない。
 *     Context + useReducer で必要十分。
 *
 * ■ なぜ AuthContext は Context で、ShiftData は Context ではないのか
 *   ケースバイケースの判断基準:
 *   - Context が適切: 更新頻度が低い、アプリ全体で共有、状態が少ない（認証、テーマ、言語設定）
 *   - Context が不適切: 更新頻度が高い、一部の画面だけで使う、データ量が多い
 *   シフトデータは「特定の画面でしか使わない」「データ量が多い」「頻繁に更新される」ため、
 *   Context に入れると関係ない画面まで不要なリレンダリングが発生する。
 *   シフトデータは各画面で個別にフェッチし、ローカルの state で管理している。
 * ============================================================
 *
 * 【このファイルの位置づけ — 認証フロー全体図】
 *
 *   ユーザー操作（LoginForm）
 *        ↓ emailOrUsername, password を渡す
 *   AuthContext.signIn()    ← ★このファイル
 *        ↓ メールをASCII変換 → supabase.auth.signInWithPassword()
 *   Supabase Auth API（クラウド側で認証）
 *        ↓ 認証成功時にセッション発行
 *   ServiceProvider.users.getUserFullProfile()
 *        ↓ usersテーブルからプロフィール取得
 *   AuthContext の state を更新 → useAuth() 経由で全画面に反映
 *
 * 【Context API の仕組み】
 * - createContext: 「入れ物」を作る。初期値は undefined。
 * - AuthProvider: アプリのルートに配置し、value に認証情報を流す。
 * - useContext(AuthContext): 子コンポーネントから認証情報を取り出す。
 * - useAuth(): useContext をラップしたカスタムフック。Provider外で使うとエラーを投げる。
 *
 * 【useReducer パターン】
 * 複数の状態（user, role, loading, authError）を1つの dispatch でまとめて更新する。
 * useState を4つ並べるより、状態遷移が明確になりバグが減る。
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
// User: 認証済みユーザーの型（uid, nickname, role, email, storeId）
import { User } from "./auth";
// UserRole: "master" | "user" などのリテラル型
import type { UserRole } from "@/common/common-models/model-user/UserModel";
// ServiceProvider: 各サービス（auth, users, shifts等）のシングルトンアクセサ
import { ServiceProvider } from "../ServiceProvider";
// getSupabase: Supabaseクライアントインスタンスを取得する関数
import { getSupabase } from "../supabase/supabase-client";
// StoreIdStorage: 店舗IDをAsyncStorageに永続化するユーティリティ
import { StoreIdStorage } from "@/common/common-utils/util-storage/StoreIdStorage";
// validateEmail: メールアドレスの形式を検証するバリデーション関数
import { validateEmail } from "@/common/common-utils/util-validation/inputValidation";
// SecurityLogger: セキュリティイベントをログに記録するユーティリティ
// RateLimiter: ログイン試行回数を制限するユーティリティ（ブルートフォース対策）
// CSRFTokenManager: CSRFトークンの生成・検証を行うユーティリティ
import { SecurityLogger, RateLimiter, CSRFTokenManager } from "@/common/common-utils/security/securityUtils";
// toAsciiEmail: 日本語メールをSupabase Auth互換のASCII文字列に変換する関数
import { toAsciiEmail } from "@/services/supabase/utils/asciiEmail";

/**
 * プラットフォーム安全なユーザーエージェント取得。
 * サーバーサイドレンダリング時やReact Native環境では navigator が存在しない場合がある。
 * そのためフォールバック値 "react-native" を返す。
 */
const getSafeUserAgent = () => typeof navigator !== "undefined" ? navigator.userAgent : "react-native";

/**
 * プラットフォーム安全なオリジン取得。
 * Web環境では window.location.origin（例: "https://app.shiftize.com"）を返し、
 * ネイティブ環境では "app" を返す。
 */
const getSafeOrigin = () => typeof window !== "undefined" && window.location ? window.location.origin : "app";

// ============================================================
// --- Reducer（状態管理ロジック） ---
// ============================================================

/**
 * AuthState: 認証状態を表す型。
 * - user: ログイン済みユーザー情報。未認証時はnull。
 * - role: ユーザーのロール（"master" | "user"等）。未認証時はnull。
 * - loading: 認証状態の確認中かどうか。初回はtrue（セッション復元を待つ）。
 * - authError: 認証エラーのメッセージ。正常時はnull。
 */
interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  authError: string | null;
}

/**
 * AuthAction: Reducerに渡すアクションの型。
 * TypeScriptのユニオン型（Union Type）を使い、3種類のアクションを定義。
 * dispatch({ type: "AUTH_SUCCESS", user, role }) のように使う。
 *
 * | でつなぐことで「このうちのどれか」を表現できる。
 * action.type で switch して、それぞれの分岐で型が自動的に絞り込まれる
 * （TypeScriptの「Discriminated Union」機能）。
 */
type AuthAction =
  | { type: "AUTH_SUCCESS"; user: User; role: UserRole }  // 認証成功
  | { type: "AUTH_CLEAR" }                                 // ログアウト・セッション切れ
  | { type: "AUTH_ERROR"; error: string };                 // 認証エラー

/**
 * 初期状態: loading: true にすることで、
 * セッション復元が完了するまでUIを表示しない（ちらつき防止）。
 */
const initialState: AuthState = {
  user: null,
  role: null,
  loading: true,   // ← 初回はtrue。セッション確認後にfalseになる
  authError: null,
};

/**
 * authReducer: アクションに応じて新しい状態を返す純粋関数。
 * Reducerは「現在の状態」と「アクション」を受け取り、「新しい状態」を返す。
 * 直接stateを変更（ミューテーション）してはいけない。必ず新しいオブジェクトを返す。
 *
 * @param state - 現在の認証状態
 * @param action - 発火されたアクション
 * @returns 新しい認証状態
 */
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_SUCCESS":
      // 認証成功: ユーザー情報をセットし、loading=false, エラーをクリア
      return { user: action.user, role: action.role, loading: false, authError: null };
    case "AUTH_CLEAR":
      // ログアウト: 全てをリセット。loading=falseのまま（ログアウト完了）
      return { user: null, role: null, loading: false, authError: null };
    case "AUTH_ERROR":
      // エラー: ユーザー情報をクリアし、エラーメッセージをセット
      return { user: null, role: null, loading: false, authError: action.error };
    default:
      // 未知のアクションは状態を変更しない
      return state;
  }
}

// ============================================================
// --- Context（認証情報の共有チャネル） ---
// ============================================================

/**
 * AuthContextValue: Context経由で子コンポーネントに公開する値の型。
 * 状態（user, role, loading, authError, isAuthenticated）と
 * 操作（signIn, signOut）をまとめて提供する。
 */
interface AuthContextValue {
  user: User | null;            // 現在のログインユーザー
  role: UserRole | null;        // ユーザーのロール
  loading: boolean;             // 認証状態確認中フラグ
  isAuthenticated: boolean;     // 認証済みかどうかの便利フラグ
  authError: string | null;     // エラーメッセージ
  signIn: (emailOrUsername: string, password: string, storeId?: string) => Promise<{ role: UserRole }>;  // ログイン関数
  signOut: () => Promise<void>; // ログアウト関数
}

/**
 * AuthContext: createContextで作った「入れ物」。
 * 初期値は undefined。AuthProvider の外で useAuth() を使うとエラーになる仕組み。
 *
 * createContext<T | undefined>(undefined) パターン:
 * - Provider外で使った場合に undefined を検出してエラーを投げられる
 * - 型安全性を確保しつつ、Provider必須であることを強制できる
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================
// --- Provider（認証状態の提供者） ---
// ============================================================

/**
 * AuthProvider: アプリのルートに配置し、全子コンポーネントに認証状態を提供する。
 *
 * React.FC<{ children: React.ReactNode }> の意味:
 * - React.FC: React Function Component の型
 * - children: このコンポーネントで囲まれた子要素（アプリ全体）
 *
 * 使い方: <AuthProvider><App /></AuthProvider>
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /**
   * useReducer: useState の代わりに使う状態管理フック。
   * [state, dispatch] = useReducer(reducerFn, initialState)
   * - state: 現在の状態
   * - dispatch: アクションを発火する関数。dispatch({ type: "AUTH_SUCCESS", user, role })
   */
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * useRef: レンダリング間で値を保持するが、値が変わってもリレンダリングしない。
   * signInInProgress: signIn関数の実行中フラグ。
   * onAuthStateChangeのSIGNED_INイベントとsignIn関数が競合しないようにする。
   * signIn関数が直接プロフィールを取得するので、リスナー側では重複取得をスキップする。
   */
  const signInInProgress = useRef(false);

  /**
   * cachedProfile: プロフィール情報のキャッシュ。
   * TOKEN_REFRESHED（トークン更新）イベント時にDBへの再クエリを回避する。
   * DBが一時的に障害を起こしても、キャッシュから復旧できる。
   */
  const cachedProfile = useRef<{ uid: string; nickname: string; role: UserRole; email: string; storeId: string } | null>(null);

  // ============================================================
  // --- signIn（ログイン処理） ---
  // ============================================================

  /**
   * signIn: ログイン処理を実行する関数。
   *
   * useCallback: 関数をメモ化（キャッシュ）するフック。
   * 依存配列 [] が空なので、コンポーネントの生存期間中ずっと同じ関数オブジェクトを返す。
   * これにより、子コンポーネントの不要なリレンダリングを防ぐ。
   *
   * @param emailOrUsernameWithStore - メールアドレスまたは「ニックネーム」
   * @param password - パスワード
   * @param storeId - 店舗ID（ニックネームログイン時に必要）
   * @returns Promise<{ role: UserRole }> - ログイン成功時にユーザーのロールを返す
   * @throws Error - バリデーション失敗・認証失敗時にエラーを投げる
   */
  const signIn = useCallback(async (
    emailOrUsernameWithStore: string,
    password: string,
    storeId?: string
  ): Promise<{ role: UserRole }> => {
    try {
      // --- セキュリティ検証（ブルートフォース攻撃対策） ---

      // ユーザーエージェントとオリジンからクライアント識別子を生成
      const userAgent = getSafeUserAgent();
      const clientId = `${userAgent}_${getSafeOrigin()}`;

      // レート制限チェック: 短時間に大量のログイン試行を防ぐ
      // RateLimiter.isAllowed() は内部でカウンタを管理し、閾値を超えるとfalseを返す
      if (!RateLimiter.isAllowed(clientId)) {
        // セキュリティログに記録（異常な試行を検知するため）
        SecurityLogger.logEvent({
          type: 'rate_limit_exceeded',
          details: 'Login rate limit exceeded',
          userAgent,
        });
        throw new Error("ログイン試行回数が上限に達しました。しばらく時間を置いてから再試行してください。");
      }

      // --- 入力値の基本検証 ---

      // 空欄チェック: メールアドレスとパスワードが両方入力されているか
      if (!emailOrUsernameWithStore || !password) {
        SecurityLogger.logEvent({
          type: 'invalid_input',
          details: 'Empty email or password provided',
        });
        throw new Error("メールアドレスとパスワードを入力してください");
      }

      // メールアドレス形式の判定: @を含むかどうかで判定
      // 正規表現 /^[^\s@]+@[^\s@]+\.[^\s@]+$/ は最低限のメール形式を検証する
      const isEmailFormatInput = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsernameWithStore);
      if (isEmailFormatInput) {
        // メール形式ならより厳密なバリデーションを実行
        const emailValidation = validateEmail(emailOrUsernameWithStore);
        if (!emailValidation.isValid) {
          SecurityLogger.logEvent({
            type: 'invalid_input',
            details: `Invalid email format: ${emailValidation.error}`,
          });
          throw new Error(emailValidation.error);
        }
      }

      // パスワード最小長チェック: 6文字以上
      if (password.length < 6) {
        SecurityLogger.logEvent({
          type: 'invalid_input',
          details: 'Password too short',
        });
        throw new Error("パスワードは6文字以上で入力してください");
      }

      // --- メールアドレスの構築 ---

      let emailToUse = emailOrUsernameWithStore;

      // ニックネームログインの場合:
      // 「店舗ID + ニックネーム + @example.com」形式のメールアドレスを自動生成する。
      // 例: storeId="1456", nickname="田中" → "1456田中@example.com"
      // これはSupabase Authがメールベース認証のみ対応しているための工夫。
      if (!isEmailFormatInput) {
        if (!storeId) {
          throw new Error("店舗IDが必要です");
        }
        emailToUse = `${storeId}${emailOrUsernameWithStore}@example.com`;
      }

      // Supabase Authは非ASCII文字を受け付けないため、日本語部分をエンコードする
      // 例: "1456田中@example.com" → "1456u7530u4e2d@example.com"
      emailToUse = toAsciiEmail(emailToUse);

      // --- Supabase Auth でサインイン ---

      // onAuthStateChangeのSIGNED_INイベントをスキップするフラグをON。
      // signIn関数が直接プロフィール取得を行うため、リスナー側での重複取得を防ぐ。
      signInInProgress.current = true;

      // signInWithPasswordを直接呼び出す（SupabaseAuthAdapter.signIn経由だと
      // navigator.locksのデッドロックが起きるため）。
      //
      // 【navigator.locksとは】
      // Supabase JS v2はブラウザのWeb Locks APIを使ってセッション操作を排他制御する。
      // signInWithPassword実行中にDB操作を行うと、内部でgetSession()が再帰的にロックを
      // 取得しようとしてデッドロック（永久に待ち続ける状態）になる。
      // そのため、認証とDB取得を分離して実行する。
      const supabase = getSupabase();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToUse,  // ASCII変換済みメール
        password,           // ユーザーが入力したパスワード
      });

      // 認証失敗時のエラーハンドリング
      if (authError || !authData.user) {
        throw new Error("メールアドレスまたはパスワードが正しくありません");
      }

      // --- プロフィール取得（navigator.locksのスコープ外で実行） ---

      // signInWithPassword完了後、setTimeout(fn, 0) でmacrotaskキューに入れる。
      // これにより、navigator.locksが完全に解放された後にDB操作が実行される。
      //
      // 【macrotaskとは】
      // JavaScriptのイベントループには2種類のタスクキューがある:
      // - microtask: Promise.then, queueMicrotask等。現在の処理の直後に実行
      // - macrotask: setTimeout, setInterval等。次のイベントループサイクルで実行
      // setTimeout(fn, 0) は即座に実行されるわけではなく、現在のタスク完了後に実行される
      const userData = await new Promise<Record<string, any> | null>((resolve, reject) => {
        setTimeout(async () => {
          try {
            // usersテーブルからUID指定でプロフィールを取得
            const result = await ServiceProvider.users.getUserFullProfile(authData.user!.id);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        }, 0);
      });

      // プロフィールが見つからない場合（usersテーブルにレコードがない）
      if (!userData) {
        throw new Error("ユーザー情報が見つかりません");
      }

      // --- プロフィール情報の組み立て ---

      // DBから取得した値をアプリ内で使う形に整形
      const nickname = userData['nickname'] as string || "";
      const userRole = (userData['role'] as UserRole) || "user";  // デフォルトは"user"
      const profile = {
        uid: authData.user.id,              // SupabaseのユーザーUID
        nickname,                            // 表示名
        role: userRole,                      // ロール（master/user）
        email: authData.user.email || "",    // メールアドレス
        storeId: userData['storeId'] || "",  // 所属店舗ID
      };

      // キャッシュに保存: TOKEN_REFRESHED時のDB再クエリ回避用
      cachedProfile.current = profile;

      // Reducerを通して状態を更新 → 全子コンポーネントにリレンダリングが伝播
      dispatch({
        type: "AUTH_SUCCESS",
        user: profile,
        role: userRole,
      });

      // 店舗IDをバックグラウンドで永続化（AsyncStorageに保存）。
      // .catch(() => {}) で保存失敗を握りつぶす（ログインの成功をブロックしない）
      if (profile.storeId) {
        StoreIdStorage.saveStoreId(profile.storeId).catch(() => {});
      }

      // セキュリティ: ログイン成功をログに記録
      SecurityLogger.logEvent({
        type: 'system_event',
        details: `User ${nickname} logged in successfully`,
        userAgent,
      });

      // 呼び出し元にロールを返す（ログイン後のリダイレクト先決定に使用）
      return { role: userRole };
    } catch (error: any) {
      // --- エラーハンドリング ---
      let errorMessage = "ログインに失敗しました";
      if (error.message) {
        errorMessage = error.message;
      }
      // エラー状態をReducerに反映
      dispatch({ type: "AUTH_ERROR", error: errorMessage });
      // 呼び出し元にもエラーを伝播
      throw new Error(errorMessage);
    } finally {
      // finally: try/catch の後に必ず実行される。成功・失敗に関わらずフラグをリセット。
      signInInProgress.current = false;
    }
  }, []); // 依存配列が空 = マウント時に1回だけ関数を生成

  // ============================================================
  // --- signOut（ログアウト処理） ---
  // ============================================================

  /**
   * signOut: ログアウト処理を実行する関数。
   * CSRFトークンのクリア → キャッシュのクリア → Supabase Auth でサインアウト → 状態リセット
   */
  const signOut = useCallback(async () => {
    try {
      // CSRFトークンをクリア（セキュリティ対策）
      CSRFTokenManager.clearToken();
      // プロフィールキャッシュをクリア
      cachedProfile.current = null;
      // Supabase Auth のセッションを破棄
      await ServiceProvider.auth.signOut();
      // 状態をリセット
      dispatch({ type: "AUTH_CLEAR" });

      // ログアウトイベントをログに記録
      SecurityLogger.logEvent({
        type: 'user_logout',
        details: 'User logged out',
        userAgent: getSafeUserAgent(),
      });
    } catch (error) {
      // エラーが発生しても状態はクリアする（半端な状態を避ける）
      dispatch({ type: "AUTH_CLEAR" });
      throw error;
    }
  }, []);

  // ============================================================
  // --- onAuthStateChange（認証状態変更リスナー） ---
  // ============================================================

  /**
   * useEffect: コンポーネントのマウント時に1回だけ実行される副作用フック。
   * Supabaseの認証状態変更イベント（SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED等）を
   * リスンし、状態を同期する。
   *
   * 【重要な注意点】
   * onAuthStateChangeのコールバック内でsupabase.from()等のDB操作を直接実行すると、
   * navigator.locksのスコープ内でgetSession()が再帰ロックを取得しようとして
   * デッドロックする。そのため全てのDB操作はsetTimeout(0)でmacrotask遅延させる。
   */
  useEffect(() => {
    const supabase = getSupabase();

    /**
     * fallbackOrSignOut: プロフィール取得失敗時のフォールバック。
     * キャッシュがあればキャッシュから復旧し、なければサインアウトする。
     * DB一時障害時でもユーザー体験を維持するための防御的な実装。
     *
     * @param errorMessage - 表示するエラーメッセージ
     */
    const fallbackOrSignOut = async (errorMessage: string) => {
      if (cachedProfile.current) {
        // キャッシュがあればそこから復旧
        dispatch({
          type: "AUTH_SUCCESS",
          user: cachedProfile.current,
          role: cachedProfile.current.role,
        });
        return;
      }
      // キャッシュもない場合はサインアウト
      await ServiceProvider.auth.signOut();
      dispatch({ type: "AUTH_ERROR", error: errorMessage });
    };

    /**
     * fetchAndDispatchProfile: ユーザープロフィールをDBから取得してReducerに反映する。
     * navigator.locksのスコープ外（setTimeout内）で呼ぶこと。
     *
     * @param userId - SupabaseのユーザーUID
     * @param email - ユーザーのメールアドレス
     */
    const fetchAndDispatchProfile = async (userId: string, email: string) => {
      try {
        // usersテーブルからプロフィールを取得
        const userData = await ServiceProvider.users.getUserFullProfile(userId);

        if (!userData) {
          await fallbackOrSignOut("ユーザー情報が見つかりません。");
          return;
        }

        // プロフィール情報の組み立て
        const nickname = userData['nickname'] as string || "";
        const userRole = (userData['role'] as UserRole) || "user";
        const profile = {
          uid: userId,
          nickname,
          role: userRole,
          email,
          storeId: userData['storeId'] || "",
        };

        // キャッシュに保存
        cachedProfile.current = profile;
        // Reducerに反映
        dispatch({ type: "AUTH_SUCCESS", user: profile, role: userRole });

        // 店舗IDをバックグラウンドで保存
        if (profile.storeId) {
          await StoreIdStorage.saveStoreId(profile.storeId);
        }
      } catch {
        await fallbackOrSignOut("認証エラーが発生しました。");
      }
    };

    // --- Supabase認証状態変更のサブスクリプション登録 ---
    // onAuthStateChange は { data: { subscription } } を返す。
    // subscription.unsubscribe() でリスナーを解除できる。
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // --- イベントごとの処理分岐 ---

        // signIn処理中のSIGNED_INイベントはスキップ。
        // signIn関数が直接プロフィールを取得するため、二重取得を防ぐ。
        if (signInInProgress.current && event === "SIGNED_IN") {
          return;
        }

        // TOKEN_REFRESHED: アクセストークンが自動更新された場合。
        // キャッシュがあればDBクエリをスキップし、キャッシュから状態を復元する。
        // これによりトークン更新のたびにDB問い合わせが発生するのを防ぐ。
        if (event === "TOKEN_REFRESHED" && cachedProfile.current && session?.user) {
          dispatch({
            type: "AUTH_SUCCESS",
            user: cachedProfile.current,
            role: cachedProfile.current.role,
          });
          return;
        }

        if (session?.user) {
          // セッションが存在する場合（ログイン中）
          const userId = session.user.id;
          const email = session.user.email || "";

          // setTimeout(0) でmacrotask遅延:
          // navigator.locksスコープから完全に抜けてからDB操作を実行する
          setTimeout(() => {
            // --- Google Calendar OAuth連携 ---
            // provider_token: OAuth認証で取得したGoogleのアクセストークン。
            // Supabaseのセッション情報に付属している場合がある。
            if ((session as any).provider_token) {
              const identities = session.user!.identities ?? [];
              // identities: ユーザーに紐づくOAuthプロバイダの一覧
              const googleIdentity = identities.find((id) => id.provider === "google");
              if (googleIdentity) {
                // Googleのトークンをサービス経由でDBに保存（カレンダー同期用）
                ServiceProvider.googleCalendar
                  .saveOAuthTokens(userId, (session as any).provider_token, (session as any).provider_refresh_token || "")
                  .catch(() => {}); // 失敗しても認証フローをブロックしない
              }
            }

            // --- OAuth連携完了時のreal_email保存 ---
            // USER_UPDATED: ユーザー情報が更新された場合（OAuth連携等）
            if (event === "USER_UPDATED") {
              const identities = session.user!.identities ?? [];
              // GoogleまたはAppleのOAuth連携を検出
              const oauthIdentity = identities.find(
                (id) => id.provider === "google" || id.provider === "apple"
              );
              if (oauthIdentity) {
                // OAuthプロバイダから取得した実メールアドレスをusersテーブルに保存。
                // アプリ内部ではダミーメールを使っているため、
                // 実際のメールアドレスを別カラムに保持する。
                const oauthEmail = oauthIdentity.identity_data?.['email'] as string | undefined;
                if (oauthEmail) {
                  supabase
                    .from("users")
                    .update({
                      real_email: oauthEmail,                      // 実メールアドレス
                      oauth_provider: oauthIdentity.provider,      // "google" or "apple"
                      oauth_linked_at: new Date().toISOString(),   // 連携日時
                    })
                    .eq("uid", userId)
                    .then(() => {}, () => {}); // 成功・失敗ともに握りつぶし
                }
              }
            }

            // プロフィール取得＋Reducer反映
            fetchAndDispatchProfile(userId, email);
          }, 0);
        } else {
          // セッションがない場合（ログアウト済み）
          cachedProfile.current = null;  // キャッシュをクリア
          dispatch({ type: "AUTH_CLEAR" });
        }
      }
    );

    // クリーンアップ関数: コンポーネントがアンマウントされる時にリスナーを解除。
    // これを忘れるとメモリリークが発生する。
    return () => subscription.unsubscribe();
  }, []); // 依存配列が空 = マウント時に1回だけ実行

  // ============================================================
  // --- Context value の生成（メモ化） ---
  // ============================================================

  /**
   * useMemo: 計算結果をメモ化（キャッシュ）するフック。
   * 依存配列 [state, signIn, signOut] が変わらない限り、同じオブジェクトを返す。
   * これにより、不要なリレンダリングを防ぐ。
   *
   * useMemo<AuthContextValue>: ジェネリクス構文。
   * useMemoの戻り値の型を AuthContextValue に指定している。
   */
  const value = useMemo<AuthContextValue>(() => ({
    user: state.user,
    role: state.role,
    loading: state.loading,
    isAuthenticated: !!state.user && !state.authError,  // !!でboolean変換
    authError: state.authError,
    signIn,
    signOut,
  }), [state, signIn, signOut]);

  // AuthContext.Provider で value を子コンポーネントに提供する。
  // { children } は <AuthProvider> で囲まれた全ての子要素。
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================
// --- useAuth フック ---
// ============================================================

/**
 * useAuth: AuthContextの値を取り出すカスタムフック。
 * useContext(AuthContext) のラッパーで、Provider外での使用をエラーで検知する。
 *
 * 使い方:
 *   const { user, signIn, signOut } = useAuth();
 *
 * @returns AuthContextValue - 認証状態と操作関数
 * @throws Error - AuthProvider の外で使用した場合
 */
export const useAuth = () => {
  // useContext: Contextから値を取り出すReactフック
  const context = useContext(AuthContext);
  // createContext(undefined) で初期化しているため、Provider外ではundefinedになる
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
