export type SampleSlot = {
  name: string;
  start: string; // 開始時刻
  end: string; // 終了時刻
  task: string;
  date: string; // 追加: 日付
  color?: string; // シフト色（オプション）
  type?: "user" | "class"; // シフト種別（オプション）
};

export type SampleScheduleColumn = {
  position: string;
  slots: SampleSlot[];
  status?: string;
};
