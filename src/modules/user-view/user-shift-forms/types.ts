/**
 * User shift forms types
 */

export interface TimeSlot {
  start: string;
  end: string;
}

export interface ShiftFormData {
  date: string;
  timeSlots: TimeSlot[];
  memo?: string;
}

export interface DateSelectorProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
  currentMonth: string;
}

export interface TimeInputSectionProps {
  value: TimeSlot[];
  onChange: (timeSlots: TimeSlot[]) => void;
  timeOptions: string[];
}

export interface MultiDatePickerProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
  setSelectedDates?: (dates: string[]) => void;
  minDate?: string;
  maxDate?: string;
}

export interface SelectedDateListProps {
  selectedDates: string[];
  onRemoveDate: (date: string) => void;
  onRemove?: (date: string) => void;
}

export interface SelectedDateListStyles {
  container: any;
  label: any;
  calendar: any;
  title: any;
  noneText: any;
  item: any;
  removeText: any;
  picker: any;
}

export interface ShiftDateSelectorStyles {
  container: any;
  label: any;
  calendar: any;
  picker: any;
}

export interface MultiDatePickerStyles {
  container: any;
  label: any;
  calendar: any;
}