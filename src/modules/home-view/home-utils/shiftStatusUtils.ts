/**
 * @file shiftStatusUtils.ts
 * @description シフトの現在状態を判定するユーティリティ関数群。
 *   「勤務中」「休憩中」「勤務終了」などの状態判定と、
 *   連続スロットのグループ化（時計ウィジェットの円弧表示用）を提供する。
 *
 *   使われる画面: HomeGanttMobileScreen, HomeGanttTabletScreen, HomeGanttWideScreen
 *   データの流れ: useHomeGanttState → scheduleForSelectedDate → getShiftStatus
 */

import { colors } from "@/common/common-constants/ThemeConstants";

// --- 型定義 ---

/**
 * シフト状態の判定結果を表すインターフェース。
 * interface はオブジェクトの形を定義する。type と似ているが、
 * interface は extends で継承できる点が違う。
 */
export interface ShiftStatusResult {
  currentStatus: string;  // 状態テキスト（例: "現在: スタッフ中"）
  statusIcon: string;     // MaterialIcons のアイコン名（例: "work"）
  statusColor: string;    // アイコン・テキストの色（例: colors.primary）
}

// --- 定数 ---

// 空の状態（シフトがない場合や当日以外の場合に返す）
const EMPTY_STATUS: ShiftStatusResult = {
  currentStatus: "",
  statusIcon: "",
  statusColor: colors.text.secondary,
};

// --- メイン関数 ---

/**
 * 選択された日付とスロット情報から、現在のシフト状態を判定する。
 * 画面上で「現在: スタッフ中」「休憩中」「勤務終了」などを表示するために使う。
 *
 * @param selectedDate - 画面で選択されている日付
 * @param staffSlots - スタッフシフトのスロット配列（開始・終了時刻のペア）
 * @param classSlots - 授業シフトのスロット配列
 * @returns ShiftStatusResult - 状態テキスト、アイコン名、色の3つ組
 *
 * Array<{ start: string; end: string }> はジェネリクス構文で、
 * 「{ start: string; end: string } というオブジェクトの配列」を表す。
 * { start: string; end: string }[] と同じ意味。
 */
export function getShiftStatus(
  selectedDate: Date,
  staffSlots: Array<{ start: string; end: string }>,
  classSlots: Array<{ start: string; end: string }>
): ShiftStatusResult {
  // 当日かどうかを判定するため、時刻部分を0にリセットして比較
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDateOnly = new Date(selectedDate);
  selectedDateOnly.setHours(0, 0, 0, 0);
  // 当日でなければ空の状態を返す（過去・未来の日付には状態表示しない）
  if (today.getTime() !== selectedDateOnly.getTime()) return EMPTY_STATUS;
  // シフトが0件なら空の状態を返す
  if (staffSlots.length === 0 && classSlots.length === 0) return EMPTY_STATUS;

  // 現在時刻を "HH:MM" 形式の文字列にする（文字列比較で時刻の前後関係を判定するため）
  const now = new Date();
  const currentTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  // スタッフ + 授業の全スロットを開始時刻順にソート
  // localeCompare は文字列を辞書順で比較する。"09:00" < "10:00" のように正しく並ぶ。
  const allSlots = [...staffSlots, ...classSlots].sort((a, b) =>
    a.start.localeCompare(b.start)
  );
  const firstSlot = allSlots[0];           // 最初のスロット
  const lastSlot = allSlots.at(-1);        // 最後のスロット（.at(-1) は配列の末尾を取得）

  // シフト開始前の場合
  if (firstSlot && currentTimeStr < firstSlot.start) {
    // 開始まで6時間以上あれば「今日の」、それ未満なら「このあと」
    // 分割代入 + map(Number) で "HH:MM" を [時, 分] の数値配列に変換
    const [ch, cm] = currentTimeStr.split(":").map(Number);
    const [sh, sm] = firstSlot.start.split(":").map(Number);
    // ?? はNull合体演算子: 左辺が null/undefined なら右辺を使う
    const diffMin = ((sh ?? 0) * 60 + (sm ?? 0)) - ((ch ?? 0) * 60 + (cm ?? 0));
    const prefix = diffMin >= 360 ? "今日の" : "このあと"; // 360分 = 6時間
    return { currentStatus: `${prefix} ${firstSlot.start}~`, statusIcon: "schedule", statusColor: colors.text.secondary };
  }
  // シフト終了後の場合
  if (lastSlot && currentTimeStr >= lastSlot.end) {
    return { currentStatus: "勤務終了", statusIcon: "done", statusColor: colors.text.disabled };
  }
  // スタッフシフト中の場合
  // .some() は配列のいずれかの要素が条件を満たすかを真偽値で返す
  if (staffSlots.some((s) => s.start <= currentTimeStr && currentTimeStr < s.end)) {
    return { currentStatus: "現在: スタッフ中", statusIcon: "work", statusColor: colors.primary };
  }
  // 授業中の場合
  if (classSlots.some((s) => s.start <= currentTimeStr && currentTimeStr < s.end)) {
    return { currentStatus: "現在: 途中時間中", statusIcon: "school", statusColor: colors.text.secondary };
  }
  // どのスロットにも該当しない場合 = 休憩中
  return { currentStatus: "現在: 休憩中", statusIcon: "free-breakfast", statusColor: colors.text.disabled };
}

// --- TimeSlot型（グループ化関数用） ---

interface TimeSlot {
  start: string;   // 開始時刻
  end: string;     // 終了時刻
  type?: string;   // シフト種別（"class" など）
}

/**
 * 連続したスタッフスロットをグループ化して、勤務時間帯を返す。
 * 30分刻みの細かいスロットを「9:00-12:00」のようなまとまった時間帯に統合する。
 * ClockWidget の円弧表示で使用される。
 *
 * @param scheduleColumns - スロット配列を持つオブジェクトの配列
 * @returns Array<{ startTime, endTime }> - グループ化された勤務時間帯の配列
 *
 * typeof は TypeScript の型演算子としても使える。
 * 「typeof staffSlots」は staffSlots 変数と同じ型を表す（ここでは TimeSlot[]）。
 */
export function groupConsecutiveSlots(
  scheduleColumns: Array<{ slots: TimeSlot[] }>
): Array<{ startTime: string; endTime: string }> {
  const result: Array<{ startTime: string; endTime: string }> = [];

  // 各列（= 各スタッフ）ごとに処理
  scheduleColumns.forEach((col) => {
    // 授業以外のスロットだけを抽出し、開始時刻順にソート
    const staffSlots = col.slots
      .filter((s) => s.type !== "class")
      .sort((a, b) => a.start.localeCompare(b.start));

    // 連続するスロットをグループにまとめる
    let currentGroup: typeof staffSlots = []; // typeof で staffSlots と同じ型を宣言
    staffSlots.forEach((slot, index) => {
      if (currentGroup.length === 0) {
        // グループが空なら新しいグループを開始
        currentGroup.push(slot);
      } else {
        const lastSlot = currentGroup.at(-1);
        if (lastSlot && lastSlot.end === slot.start) {
          // 前のスロットの終了時刻と今のスロットの開始時刻が一致 = 連続している
          currentGroup.push(slot);
        } else {
          // 連続が途切れたので、これまでのグループを結果に追加
          if (currentGroup.length > 0 && currentGroup[0] && lastSlot) {
            result.push({
              startTime: currentGroup[0].start,
              endTime: lastSlot.end,
            });
          }
          currentGroup = [slot]; // 新しいグループを開始
        }
      }

      // 最後の要素に到達したら、残りのグループを結果に追加
      if (index === staffSlots.length - 1 && currentGroup.length > 0) {
        const firstSlot = currentGroup[0];
        const lastSlot = currentGroup.at(-1);
        if (firstSlot && lastSlot) {
          result.push({
            startTime: firstSlot.start,
            endTime: lastSlot.end,
          });
        }
      }
    });
  });

  return result;
}
