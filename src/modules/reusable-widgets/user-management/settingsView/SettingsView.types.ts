/** @file SettingsView.types.ts
 *  @description 設定画面コンポーネントの型定義。
 *
 *  【このファイルの位置づけ】
 *  - 依存なし（純粋な型定義ファイル）
 *  - 利用先: SettingsView コンポーネント
 */

/** 設定画面に渡す Props。ログインユーザー情報・ログアウト・ユーザー管理コールバックを含む */
export interface SettingsViewProps {
  user: {
    uid: string;
    role: string;
    nickname: string;
  } | null;
  role: string;
  onLogout: () => void;
  onUserManage?: () => void;
}
