export type Holiday = {
  id: string;
  date: string;
  name: string;
  type: "national" | "custom";
};

export type SpecialDay = {
  id: string;
  date: string;
  name: string;
  type: "special" | "event";
  workingDay?: boolean;
};

export type ShiftHolidaySettings = {
  holidays: Holiday[];
  specialDays: SpecialDay[];
};

export interface ShiftHolidaySettingsViewProps {
  settings: ShiftHolidaySettings;
  loading: boolean;
  onChange: (settings: ShiftHolidaySettings) => void;
  onSave: () => void;
}
