import { ShiftItem, TaskItem } from "@/common/common-models/ModelIndex";

export const convertClassesToTasks = (shift: ShiftItem): Array<TaskItem> => {
  if (!shift.classes || shift.classes.length === 0) return [];

  return shift.classes.map((classTime, index) => ({
    id: `${shift.id}-class-${index}`,
    title: `授業 ${classTime.startTime}-${classTime.endTime}`,
    shortName: "授業",
    startTime: classTime.startTime,
    endTime: classTime.endTime,
    color: "#757575",
    icon: "book-outline",
    type: "custom",
  }));
};

export const calculateShiftPosition = (
  startTime: string,
  cellWidth: number,
  startHour: number = 9
) => {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const startOffsetMinutes = (startHours - startHour) * 60 + startMinutes;
  return (startOffsetMinutes / 30) * cellWidth;
};

export const calculateShiftWidth = (
  startTime: string,
  endTime: string,
  cellWidth: number
) => {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  const durationMinutes = endTotalMinutes - startTotalMinutes;
  
  return Math.max((durationMinutes / 30) * cellWidth, cellWidth);
};

export const getShiftOpacity = (status: string): number => {
  switch (status) {
    case "draft":
      return 0.5;
    case "pending":
      return 0.7;
    case "approved":
      return 1.0;
    case "rejected":
      return 0.3;
    default:
      return 0.8;
  }
};

export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${startTime.substring(0, 5)}-${endTime.substring(0, 5)}`;
};