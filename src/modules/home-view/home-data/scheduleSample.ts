import type { SampleSlot } from "../home-types/home-view-types";

// サンプルスケジュールデータ（全て手動で配列化・9:00〜22:00を30分刻みで全員分埋める）

const tasks = ["レジ打ち", "品出し", "清掃", "FF補充", "宅急便受付"];
const closingTasks = ["終業作業", "戸締り・レジ締め"];

const timeList = [
  "9:00",
  "9:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
];

function makeSlots(name: string): SampleSlot[] {
  const slots: SampleSlot[] = [];
  for (let i = 0; i < timeList.length - 1; i++) {
    slots.push({
      name,
      start: timeList[i],
      end: timeList[i + 1],
      task: tasks[i % tasks.length],
      date: "2025-06-01", // 追加
    });
  }
  // 21:30-22:00は終業作業系
  slots.push({
    name,
    start: "21:30",
    end: "22:00",
    task: closingTasks[0],
    date: "2025-06-01", // 追加
  });
  return slots;
}

function makeSlots90min(name: string): SampleSlot[] {
  const slots: SampleSlot[] = [];
  let cur = "9:00";
  let taskIdx = 0;
  while (cur < "21:30") {
    // 16:00~17:00は休憩としてスキップ
    if (cur === "16:00") {
      cur = "17:00";
      continue;
    }
    // 90分後の時刻を計算
    const [h, m] = cur.split(":").map(Number);
    const endMin = h * 60 + m + 90;
    const endH = Math.floor(endMin / 60);
    const endM = endMin % 60;
    let end = `${endH}:${endM.toString().padStart(2, "0")}`;
    // 16:00をまたぐ場合は15:30~16:00で区切る
    if (cur < "16:00" && end > "16:00") {
      slots.push({
        name,
        start: cur,
        end: "16:00",
        task: tasks[taskIdx % tasks.length],
        date: "2025-06-01", // 追加
      });
      cur = "17:00";
      taskIdx++;
      continue;
    }
    // 21:30以降は終業作業
    if (end > "21:30") end = "21:30";
    slots.push({
      name,
      start: cur,
      end,
      task: tasks[taskIdx % tasks.length],
      date: "2025-06-01", // 追加
    });
    cur = end;
    taskIdx++;
    if (cur === "21:30") break;
  }
  // 21:30-22:00は終業作業
  slots.push({
    name,
    start: "21:30",
    end: "22:00",
    task: closingTasks[0],
    date: "2025-06-01", // 追加
  });
  return slots;
}

export const sampleSchedule = [
  {
    position: "Aレジ",
    slots: [
      ...makeSlots("石黒"),
      ...makeSlots("ウエノ"),
      ...makeSlots("全日フル"), // 9:00~22:00全て埋める人
    ],
  },
  {
    position: "Bレジ",
    slots: [...makeSlots("里田"), ...makeSlots("作安")],
  },
  {
    position: "C品出し",
    slots: [
      ...makeSlots("午前追加1"),
      ...makeSlots("午後追加1"),
      ...makeSlots90min("午前追加2"),
    ],
  },
];

export const timeSlots = [
  "9:00",
  "9:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
];
