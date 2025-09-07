import { Shift } from "@/common/common-models/ModelIndex";

export interface MarkedDate {
  selected?: boolean;
  marked?: boolean;
  dotColor?: string;
  dotStyle?: any;
}

// ShiftCalendarProps は ShiftCalendar.types.ts に移動しました
// 以下はコンポーネント間で共有される型定義のみを保持します

export interface DayComponentProps {
  date?: {
    day: number;
    month: number;
    year: number;
    timestamp: number;
    dateString: string;
  };
  state?: "disabled" | "today" | "selected" | "" | "inactive";
  marking?: {
    selected?: boolean;
    marked?: boolean;
    dotColor?: string;
    dotStyle?: any;
    dots?: Array<{ key?: string; color: string }>;
  };
  onPress?: (date?: { dateString: string; day: number; month: number; year: number; timestamp: number; }) => void;
  responsiveSize?: any;
}

export interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  initialDate: Date;
}

export interface ShiftListProps {
  shifts: Shift[];
  selectedDate: string;
}
