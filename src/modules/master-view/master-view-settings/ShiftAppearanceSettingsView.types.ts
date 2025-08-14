export type ShiftAppSettings = {
  darkMode: boolean;
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  showWeekNumbers: boolean;
  calendarView: "month" | "week" | "day";
  language: "ja" | "en";
  primaryColor?: string;
  accentColor?: string;
};

export interface ShiftAppearanceSettingsViewProps {
  settings: ShiftAppSettings;
  loading: boolean;
  onChange: (settings: ShiftAppSettings) => void;
  onSave: () => void;
}
