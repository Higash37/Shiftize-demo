export type ShiftRuleSettings = {
  maxWorkHours: number;
  minBreakMinutes: number;
  maxConsecutiveDays: number;
  weekStartDay: number;
  shiftTimeUnit: number;
  allowOvertime: boolean;
  maxOvertimeHours: number;
  minShiftHours: number;
  maxShiftGap: number;
};

export interface ShiftRuleSettingsViewProps {
  settings: ShiftRuleSettings;
  loading: boolean;
  onChange: (settings: ShiftRuleSettings) => void;
  onSave: () => void;
  picker:
    | null
    | "maxWorkHours"
    | "minBreakMinutes"
    | "maxConsecutiveDays"
    | "weekStartDay"
    | "shiftTimeUnit"
    | "maxOvertimeHours"
    | "minShiftHours";
  setPicker: (
    picker:
      | null
      | "maxWorkHours"
      | "minBreakMinutes"
      | "maxConsecutiveDays"
      | "weekStartDay"
      | "shiftTimeUnit"
      | "maxOvertimeHours"
      | "minShiftHours"
  ) => void;
}
