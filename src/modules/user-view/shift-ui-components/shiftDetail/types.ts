export interface TimeSlot {
  type: "user" | "class";
  startTime: string;
  endTime: string;
}

export interface ShiftDetailsViewProps {
  timeSlots: TimeSlot[];
}

export interface ShiftTimeSlotProps {
  type: "user" | "class";
  startTime: string;
  endTime: string;
}
