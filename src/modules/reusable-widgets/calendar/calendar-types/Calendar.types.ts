/**
 * @file Calendar.types.ts
 * @description カレンダー本体のデータモデル（型定義）を定義するファイル。
 *              カレンダーの基本情報（ID、名前、色など）を表す。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: なし（プリミティブ型のみ使用）
// インポート先: カレンダー関連コンポーネントがこの型を参照する可能性がある

/**
 * Calendar インターフェース
 *
 * カレンダー1つ分のデータ構造を定義する。
 * `interface` は「この形のオブジェクトだけ許可する」という型の設計図。
 *
 * 各プロパティ:
 *   - id:        カレンダーを一意に識別するID（例: "cal-001"）
 *   - name:      カレンダーの表示名（例: "メインカレンダー"）
 *   - color:     カレンダーに紐づく色（例: "#FF0000"）。UI上の色分けに使う
 *   - userId:    このカレンダーを所有するユーザーのID
 *   - createdAt: 作成日時。Date 型はJavaScript組み込みの日時オブジェクト
 *   - updatedAt: 最終更新日時
 */
export interface Calendar {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
