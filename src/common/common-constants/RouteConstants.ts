/**
 * @file RouteConstants.ts
 * @description アプリのルートパス定数とルーティングヘルパー
 */
// ============================================================================
// 【なぜルートパスを定数で管理するのか — マジックストリング問題】
// ============================================================================
// ルートパス（画面遷移先のURL）をこのファイルに集約している理由は、
// 「マジックストリング」を排除するため。
//
// ■ マジックストリングとは:
//   コード中にハードコードされた文字列のこと。
//   例: router.push("/(main)/master/home")
//   この書き方の問題:
//   - タイプミスしてもコンパイルエラーにならない（実行時に初めて気づく）
//   - 同じパスが10箇所に書かれていたら、変更時に10箇所全て修正が必要
//   - 文字列なので IDE の補完が効かない
//
// ■ 定数化のメリット:
//   例: router.push(Routes.main.master.home)
//   - タイプミス防止: Routes.main.master.hoem → TypeScript がコンパイルエラーで検出
//   - 一括変更が容易: パスを変更するとき、このファイルだけ修正すれば全体に反映
//   - 補完が効く: Routes. と入力すれば候補が表示される → 開発速度アップ
//   - as const: オブジェクトを読み取り専用にし、値がリテラル型になる
//     （string ではなく "/(main)/master/home" という具体的な型）
//
// ■ Expo Router のファイルベースルーティングについて:
//   Expo Router は Next.js と同様に、ファイル構造がそのままURLパスになる。
//   app/(main)/master/home.tsx → "/(main)/master/home" でアクセス可能。
//   (auth), (main) のカッコ付きフォルダは「ルートグループ」と呼ばれ、
//   URLには含まれないが、レイアウトの共有に使われる。
//
// ■ ケースバイケース:
//   - 2箇所以上で使う文字列 → 定数化する（このファイルのように）
//   - 1箇所だけで使う文字列 → そのまま書いてもOK（ただし将来増える可能性を考慮）
//   - 環境依存の文字列（APIのURL等）→ 環境変数（.env）で管理
// ============================================================================

/** Expo Routerのファイルベースルーティングに対応するパス定数 */
export const Routes = {
  // 認証関連
  auth: {
    login: "/(auth)/login",
    welcome: "/(auth)/auth-welcome",
    createGroup: "/(auth)/auth-create-group",
  },

  // メイン - マスター
  main: {
    master: {
      home: "/(main)/master/home",
      ganttView: "/(main)/master/gantt-view",
      ganttEdit: "/(main)/master/gantt-edit",
      info: "/(main)/master/info",
      today: "/(main)/master/today",
      settings: "/(main)/master/settings",
      users: "/(main)/master/users",
    },
    user: {
      home: "/(main)/user/home",
      shifts: "/(main)/user/shifts",
      shiftsCreate: "/(main)/user/shifts/create",
      today: "/(main)/user/today",
      changePassword: "/(main)/user/change-password",
    },
  },

} as const;

import type { UserRole } from "@/common/common-models/model-user/UserModel";

/** ロールに応じたデフォルトホームパスを返す */
export const getDefaultHomeRoute = (role: UserRole | null): string => {
  if (role === "master") {
    return Routes.main.master.home;
  }
  if (role === "user") {
    return Routes.main.user.home;
  }
  return Routes.auth.login;
};

/** URLセグメントからルートグループを判定するヘルパー */
export const RouteGroups = {
  isAuthGroup: (segments: string[]): boolean => segments[0] === "(auth)",
  isMainGroup: (segments: string[]): boolean => {
    return (
      segments[0] === "(main)" ||
      segments[0] === "user" ||
      segments[0] === "master" ||
      segments.includes("user") ||
      segments.includes("master")
    );
  },
  isAtRoot: (segments: string[]): boolean => segments.length < 1,
} as const;

