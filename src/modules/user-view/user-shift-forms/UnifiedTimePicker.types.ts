/**
 * @file UnifiedTimePicker.types.ts
 * @description UnifiedTimePicker のProps型定義。
 */
export interface UnifiedTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}
