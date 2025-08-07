interface TimeSlot {
  type: "user" | "class";
  startTime: string;
  endTime: string;
}

// シフト時間を分割する関数
export const splitShiftIntoTimeSlots = (shift: any): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startTime = new Date(`2000-01-01T${shift.startTime}`);
  const endTime = new Date(`2000-01-01T${shift.endTime}`);
  let currentTime = startTime;

  // 授業時間を時間順にソート
  const classes =
    shift.classes?.sort((a: any, b: any) => {
      const timeA = new Date(`2000-01-01T${a.startTime}`);
      const timeB = new Date(`2000-01-01T${b.startTime}`);
      return timeA.getTime() - timeB.getTime();
    }) || [];

  classes.forEach((classTime: any) => {
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
