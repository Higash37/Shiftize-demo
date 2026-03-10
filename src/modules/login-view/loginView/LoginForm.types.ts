/**
 * @file LoginForm.types.ts
 * @description LoginFormコンポーネントが受け取るProps（親コンポーネントから渡されるデータ）の型定義。
 *
 * TypeScript の interface:
 *   オブジェクトの「形」を定義する。どんなプロパティがあり、それぞれ何型かを決める。
 *   `interface` で定義した型は、コンポーネントの引数（Props）の型として使うことが多い。
 *
 * `?` （オプショナル）:
 *   プロパティ名の後に `?` をつけると「あってもなくてもいい」という意味になる。
 *   つまり、親コンポーネントからこのPropを渡さなくてもエラーにならない。
 */

/**
 * LoginFormコンポーネントのProps型。
 *
 * 全てのプロパティが `?`（オプショナル）なので、
 * <LoginForm /> のように何も渡さずに使うこともできる。
 */
export interface LoginFormProps {
  /**
   * ログインボタンが押されたときに呼ばれるコールバック関数。
   * 引数として username, password, storeId を受け取る。
   * 戻り値は `Promise<void>` = 非同期処理で、完了後に何も返さない。
   *
   * `?` がついているので、この関数を渡さない使い方も可能。
   * その場合、コンポーネント内で `if (onLogin)` のようにチェックしてから呼ぶ。
   */
  onLogin?: (
    username: string,
    password: string,
    storeId: string
  ) => Promise<void>;

  /** ログイン処理中かどうかのフラグ。trueならボタンを無効化する */
  loading?: boolean;

  /** デモモーダルの表示状態（外部から制御する場合に使う） */
  showDemoModal?: boolean;

  /**
   * デモモーダルの表示/非表示を切り替える関数。
   * `(show: boolean) => void` は「boolean型の引数を受け取って何も返さない関数」の型。
   */
  setShowDemoModal?: (show: boolean) => void;
}
