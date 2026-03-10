/**
 * @file shift-time.utils.ts
 * @description シフト時間を授業時間とスタッフ時間に分割するユーティリティ。
 *
 * 【このファイルの位置づけ】
 *   user-view > user-shift-utils 配下のユーティリティ関数。
 *   シフト詳細画面やガントチャートで、シフトの内訳を可視化するために使われる。
 *
 * 主要関数:
 *   - splitShiftIntoTimeSlots(shift):
 *     シフト全体の時間帯を、授業時間(class)とそれ以外(user)に分割して
 *     TimeSlot[] として返す。授業は時間順にソートされ、間の空き時間は
 *     "user" タイプとして生成される。
 */
import type { ClassTimeSlot } from "@/common/common-models/ModelIndex";

interface TimeSlot {
  type: "user" | "class";
  /** 開始時刻 "HH:MM" 形式（inclusive: この時刻を含む） */
  startTime: string;
  /** 終了時刻 "HH:MM" 形式（exclusive: この時刻を含まない。次スロットの startTime と一致する） */
  endTime: string;
  typeId?: string | undefined;
  typeName?: string | undefined;
}

interface ShiftWithClasses {
  startTime: string;
  endTime: string;
  classes?: ClassTimeSlot[];
}

/**
 * シフト時間を授業/スタッフ時間に分割する。
 * 不正な時刻データの場合は空配列を返す。
 */
export const splitShiftIntoTimeSlots = (shift: ShiftWithClasses): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startTime = new Date(`2000-01-01T${shift.startTime}`);
  const endTime = new Date(`2000-01-01T${shift.endTime}`);

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return [];
  }

  let currentTime = startTime;

  // 授業時間を時間順にソート
  const classes =
    shift.classes?.sort((a: ClassTimeSlot, b: ClassTimeSlot) => {
      const timeA = new Date(`2000-01-01T${a.startTime}`);
      const timeB = new Date(`2000-01-01T${b.startTime}`);
      return timeA.getTime() - timeB.getTime();
    }) || [];

  classes.forEach((classTime: ClassTimeSlot) => {
    const classStart = new Date(`2000-01-01T${classTime.startTime}`);
    const classEnd = new Date(`2000-01-01T${classTime.endTime}`);

    // 授業開始前のスタッフ時間
    if (currentTime < classStart) {
      slots.push({
        type: "user",
        startTime: currentTime.toTimeString().slice(0, 5),
        endTime: classStart.toTimeString().slice(0, 5),
      });
    }

    // 授業時間
    slots.push({
      type: "class",
      startTime: classStart.toTimeString().slice(0, 5),
      endTime: classEnd.toTimeString().slice(0, 5),
      typeId: classTime.typeId,
      typeName: classTime.typeName,
    });

    currentTime = classEnd;
  });

  // 最後の授業後のスタッフ時間
  if (currentTime < endTime) {
    slots.push({
      type: "user",
      startTime: currentTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
    });
  }

  return slots;
};
