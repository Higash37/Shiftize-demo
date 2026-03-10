/**
 * @file loginApi.ts
 * @description ログインAPI処理をまとめたファイル。
 * UIコンポーネント（LoginForm）から呼ばれて、実際の認証処理を行う。
 *
 * 処理の流れ（層をまたぐ呼び出し順序）:
 *   1. LoginForm (UI層) → handleLogin() を呼ぶ
 *   2. handleLogin() → ServiceProvider.auth.signIn() を呼ぶ
 *   3. ServiceProvider.auth → SupabaseAuthAdapter.signIn() を呼ぶ
 *   4. SupabaseAuthAdapter → Supabase Auth API にリクエスト送信
 *   5. 認証成功 → AuthContext がユーザー情報を更新 → 画面遷移
 *   6. 認証失敗 → catch で setError にエラーメッセージをセット → UI に表示
 */

// ServiceProviderはアプリ全体のサービス（認証、DB等）への統一アクセスポイント
import { ServiceProvider } from "@/services/ServiceProvider";

/**
 * ログイン処理を実行する非同期関数。
 *
 * @param email    - ユーザーのメールアドレス（実際にはstoreId+nicknameから生成されたもの）
 * @param password - ユーザーが入力したパスワード
 * @param setError - エラーメッセージをUIに表示するための関数。
 *                   `(msg: string) => void` は「string型の引数を受け取って何も返さない関数」の型。
 *                   ※ React の useState の setter 関数がこの型に該当する
 *
 * async/await:
 *   - `async` をつけた関数は非同期関数になり、中で `await` が使える
 *   - `await` はPromise（非同期処理の結果）が返ってくるまで待つ
 *   - ネットワーク通信のように時間がかかる処理で使う
 */
export const handleLogin = async (
  email: string,
  password: string,
  setError: (msg: string) => void
) => {
  try {
    // ServiceProvider経由で認証サービスのsignInメソッドを呼ぶ
    // awaitで認証処理の完了を待つ。失敗した場合はcatchブロックに飛ぶ
    await ServiceProvider.auth.signIn(email, password);
  } catch (err: any) {
    // `catch (err: any)` の `any` は「どんな型でも受け入れる」という意味
    // エラーオブジェクトの型が不定なので any を使っている
    // `err.message || "..."` は、err.messageが存在すればそれを、なければデフォルト文字列を使う
    setError(err.message || "ログインに失敗しました");
  }
};
