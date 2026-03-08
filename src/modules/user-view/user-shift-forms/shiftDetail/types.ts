export interface TimeSlot {
  type: "user" | "class";
  startTime: string;
  endTime: string;
  typeId?: string | undefined;
  typeName?: string | undefined;
}

export interface ShiftDetailsViewProps {
  timeSlots: TimeSlot[];
}

export interface ShiftTimeSlotProps {
  type: "user" | "class";
  startTime: string;
  endTime: string;
  typeId?: string | undefined;
  typeName?: string | undefined;
}
