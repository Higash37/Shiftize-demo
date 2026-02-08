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
      files: "/(main)/master/files",
      info: "/(main)/master/info",
      users: "/(main)/master/users",
      settings: "/(main)/master/master-settings",
    },
    user: {
      home: "/(main)/user/home",
      shifts: "/(main)/user/shifts",
      shiftsCreate: "/(main)/user/shifts/create",
      files: "/(main)/user/files",
      recruitment: "/(main)/user/recruitment",
      changePassword: "/(main)/user/change-password",
    },
  },

  // ランディング
  landing: {
    root: "/(landing)",
  },
} as const;

/**
 * ロールに応じたデフォルトホームパスを取得
 */
export const getDefaultHomeRoute = (role: "master" | "user" | null): string => {
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
  isLandingGroup: (segments: string[]): boolean => segments[0] === "(landing)",
  isMainGroup: (segments: string[]): boolean => {
    return (
      segments[0] === "(main)" ||
      segments[0] === "(quick)" ||
      segments[0] === "user" ||
      segments[0] === "master" ||
      segments[0] === "user-settings" ||
      segments.includes("user") ||
      segments.includes("master")
    );
  },
  isAtRoot: (segments: string[]): boolean => segments.length < 1,
} as const;

