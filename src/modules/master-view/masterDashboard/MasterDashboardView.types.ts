/**
 * @file MasterDashboardView.types.ts
 * @description マスターダッシュボード画面で使う型定義
 */

// StatCard（統計カード）1枚分のProps
export interface StatCardProps {
  title: string;   // カードのラベル（例: "総ユーザー数"）
  value: number;   // カードに表示する数値
}

// MasterDashboardView全体のProps
export interface MasterDashboardViewProps {
  users: any[];          // ユーザー一覧（any[]は本来もっと型を厳密にすべきだが現状はこのまま）
  loading: boolean;      // データ読み込み中かどうか
  error: string | null;  // エラーメッセージ。正常時はnull
}
