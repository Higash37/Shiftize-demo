import { ShiftStatus } from "../common-models/model-shift/shiftTypes";

export type ColorsType = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    white: string;
    disabled: string;
  };
  border: string;
  error: string;
  success: string;
  warning: string;
  selected: string;
  shift: Record<ShiftStatus, string>;
};

export const colors: ColorsType = {
  primary: "#1565C0", // メインカラー（ヘッダーと同じ青）
  secondary: "#657786", // サブカラー
  background: "#FFFFFF", // 背景色
  surface: "#F5F8FA", // カード背景色
  text: {
    primary: "#14171A", // メインテキスト
    secondary: "#657786", // サブテキスト
    white: "#FFFFFF", // 白テキスト
    disabled: "#AAB8C2", // 無効テキスト
  },
  border: "#E1E8ED", // ボーダー
  error: "#E0245E", // エラー
  success: "#17BF63", // 成功
  warning: "#FFAD1F", // 警告
  selected: "#E3F2FD",
  shift: {
    draft: "#9E9E9E", // 灰色 - 下書き
    pending: "#FFA726", // 黄 - 変更申請中
    approved: "#1565C0", // 青色 - 承認済み
    rejected: "#EF5350", // 赤 - 削除済み
    deleted: "#B0BEC5", // 青 - 承認済み（未完了）
    completed: "#42A5F5", // 青色 - 完了
    deletion_requested: "#FFA500", // オレンジ - 削除申請中
    purged: "#000000", // 黒 - 完全非表示
  },
};
