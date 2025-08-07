import type {
  SampleSlot,
  SampleScheduleColumn,
} from "../home-types/home-view-types";

export const allTimes: string[] = [];
for (let h = 9; h <= 22; h++) {
  allTimes.push(`${h}:00`);
  if (h !== 22) allTimes.push(`${h}:30`);
}

export const pad = (n: number) => n.toString().padStart(2, "0");
