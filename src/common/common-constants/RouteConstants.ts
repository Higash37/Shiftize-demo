/**
 * アプリケーションのルートパス定数
 * Expo Routerのファイルベースルーティングに対応
 */
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

/**
 * ロールに応じたデフォルトホームパスを取得
 */
import type { UserRole } from "@/common/common-models/model-user/UserModel";

export const getDefaultHomeRoute = (role: UserRole | null): string => {
  if (role === "master") {
    return Routes.main.master.home;
  }
  if (role === "user") {
    return Routes.main.user.home;
  }
  return Routes.auth.login;
};

/**
 * セグメントグループの判定ヘルパー
 */
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

