/**
 * @file scheduleSample.ts
 * @description ガントチャートのサンプル（デモ用）スケジュールデータを生成するファイル。
 *   実際のシフトデータがない場合に表示するダミーデータを作成する。
 *   makeSlots / makeSlots90min で各スタッフのスロットを自動生成し、
 *   sampleSchedule として外部からインポートできるようにエクスポートする。
 *
 *   データの流れ: scheduleSample.ts → useHomeGanttState → 各画面コンポーネント
 */

import type { SampleSlot } from "../home-types/home-view-types";

// --- 定数: タスクの種類 ---

// サンプルスケジュールデータ（全て手動で配列化・9:00〜22:00を30分刻みで全員分埋める）

// 通常タスクの一覧（ローテーションで割り当てる）
const tasks = ["レジ打ち", "品出し", "清掃", "FF補充", "宅急便受付"];
// 閉店時のタスク一覧
const closingTasks = ["終業作業", "戸締り・レジ締め"];

// 9:00〜21:30 までの30分刻みの時間リスト（スロット生成用）
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

/**
 * 30分刻みのスロットを生成する関数
 * @param name - スタッフ名（SampleSlot.name に入る）
 * @returns SampleSlot[] - 9:00〜22:00の全スロット配列
 *
 * tasks配列を「i % tasks.length」でローテーションして、異なるタスクを割り当てる。
 * 「%」は剰余演算子で、配列の長さで割った余りを使うことで、配列を繰り返しアクセスできる。
 */
function makeSlots(name: string): SampleSlot[] {
  const slots: SampleSlot[] = [];
  for (let i = 0; i < timeList.length - 1; i++) {
    const start = timeList[i];
    const end = timeList[i + 1];
    const task = tasks[i % tasks.length]; // 余り演算でタスクをローテーション

    if (!start || !end || !task) {
      continue; // 値が undefined の場合はスキップ（TypeScriptの厳格チェック対策）
    }

    slots.push({
      name,
      start,
      end,
      task,
      date: "2025-06-01", // 追加
    });
  }
  // 21:30-22:00は終業作業系
  const closingTask = closingTasks[0];
  if (closingTask) {
    slots.push({
      name,
      start: "21:30",
      end: "22:00",
      task: closingTask,
      date: "2025-06-01", // 追加
    });
  }
  return slots;
}

/**
 * 90分刻みのスロットを生成する関数（休憩付き）
 * @param name - スタッフ名
 * @returns SampleSlot[] - 9:00〜22:00の全スロット配列（16:00〜17:00は休憩でスキップ）
 *
 * makeSlots が30分刻みなのに対し、こちらは90分単位でタスクを割り当てる。
 * 休憩時間（16:00〜17:00）を挟む処理がある。
 */
function makeSlots90min(name: string): SampleSlot[] {
  const slots: SampleSlot[] = [];
  let cur = "9:00";    // 現在処理中の時刻（while ループで更新していく）
  let taskIdx = 0;     // タスクのインデックス（ローテーション用）
  while (cur < "21:30") {
    // 16:00~17:00は休憩としてスキップ
    if (cur === "16:00") {
      cur = "17:00";
      continue; // continue でループの先頭に戻る
    }
    // 90分後の時刻を計算（時刻文字列を分に変換→90分足す→時刻文字列に戻す）
    const timeParts = cur.split(":"); // "9:00" → ["9", "00"]
    const h = timeParts[0] ? Number.parseInt(timeParts[0], 10) : 0;
    // ↑ Number.parseInt(文字列, 基数) で文字列を整数に変換。10 は10進数を意味する。
    const m = timeParts[1] ? Number.parseInt(timeParts[1], 10) : 0;
    const endMin = h * 60 + m + 90; // 分単位に変換して90分追加
    const endH = Math.floor(endMin / 60); // Math.floor = 小数点以下切り捨て
    const endM = endMin % 60;
    let end = `${endH}:${endM.toString().padStart(2, "0")}`;
    // 16:00をまたぐ場合は15:30~16:00で区切る
    if (cur < "16:00" && end > "16:00") {
      slots.push({
        name,
        start: cur,
        end: "16:00",
        task: tasks[taskIdx % tasks.length] || "作業",
        // ↑ || "作業" はフォールバック。tasks[...] が undefined の場合に "作業" を使う
        date: "2025-06-01", // 追加
      });
      cur = "17:00"; // 休憩後の17:00から再開
      taskIdx++;
      continue;
    }
    // 21:30以降は終業作業
    if (end > "21:30") end = "21:30";
    slots.push({
      name,
      start: cur,
      end,
      task: tasks[taskIdx % tasks.length] || "作業",
      date: "2025-06-01", // 追加
    });
    cur = end; // 次のスロットの開始時刻を更新
    taskIdx++;
    if (cur === "21:30") break; // break で while ループを終了
  }
  // 21:30-22:00は終業作業
  const closingTask = closingTasks[0];
  if (closingTask) {
    slots.push({
      name,
      start: "21:30",
      end: "22:00",
      task: closingTask,
      date: "2025-06-01", // 追加
    });
  }
  return slots;
}

// --- サンプルスケジュールデータ（エクスポート） ---
// 各ポジション（Aレジ、Bレジ、C品出し）ごとにスタッフのスロットをまとめたもの。
// スプレッド構文 (...) で複数スタッフのスロットを1つの配列に結合している。
export const sampleSchedule = [
  {
    position: "Aレジ",
    slots: [
      ...makeSlots("石黒"),     // スプレッド構文: 配列を展開して別の配列に統合する
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
      ...makeSlots90min("午前追加2"), // 90分刻みのスロット
    ],
  },
];

// 9:00〜22:00 までの30分刻みの時間ラベル（ガントチャートの行ヘッダーに使用）
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
