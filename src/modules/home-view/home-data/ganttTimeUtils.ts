import type {
  SampleSlot,
  SampleScheduleColumn,
} from "../home-types/home-view-types";

export const pad = (n: number) => n.toString().padStart(2, "0");

export const allTimes: string[] = [];
for (let h = 0; h < 24; h++) {
  allTimes.push(`${pad(h)}:00`);
  allTimes.push(`${pad(h)}:30`);
}
allTimes.push("24:00"); // 終了時刻として24:00を追加
