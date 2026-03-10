/**
 * @file home-view-types.ts
 * @description ホーム画面のガントチャート・スケジュール表示で使う型定義ファイル。
 *   ガントチャートの1コマ（SampleSlot）と、1人分のスケジュール列（SampleScheduleColumn）を定義する。
 *   ホーム画面の複数コンポーネントからインポートされる。
 */

// --- SampleSlot: ガントチャートの1コマ（30分単位）を表す型 ---
// type キーワードで「型エイリアス」を作っている。interface でも同じことができるが、
// type は「=」で定義するのが特徴。ユニオン型やプリミティブ型のエイリアスも作れる。
export type SampleSlot = {
  name: string;       // このコマを担当するスタッフの名前
  start: string;      // 開始時刻（例: "09:00"）
  end: string;        // 終了時刻（例: "09:30"）
  task: string;       // このコマの作業内容（例: "レジ打ち"）
  date: string;       // 日付（例: "2025-06-01"）
  color?: string;     // シフト色（オプション）。「?」はオプショナルプロパティで、省略可能
  // ↑ オプショナル（?）を付けると undefined も許容される。
  //   つまり color の型は string | undefined と同じ意味になる。
  type?: "user" | "class"; // シフト種別（オプション）
  // ↑ ユニオン型リテラル: "user" か "class" の文字列だけを許可する。
  //   "user" = スタッフシフト、"class" = 授業シフト
};

// --- SampleScheduleColumn: 1人分のスケジュール（名前 + 全スロット）を表す型 ---
// ガントチャートでは1人1列で表示され、その列に複数のSampleSlotが並ぶ。
export type SampleScheduleColumn = {
  position: string;    // スタッフ名（列のヘッダーに表示される）
  slots: SampleSlot[]; // そのスタッフの全スロット配列
  status?: string;     // シフトの承認状態（"approved" | "pending" | "completed" 等）
};
