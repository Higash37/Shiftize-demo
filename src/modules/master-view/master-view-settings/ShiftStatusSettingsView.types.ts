import { ShiftStatusConfig } from "@/common/common-models/ModelIndex";

export interface ShiftStatusSettingsViewProps {
  statusConfigs: ShiftStatusConfig[];
  selectedStatus: string | null;
  isColorPickerVisible: boolean;
  onColorChange: (status: string, color: string) => void;
  onOpenColorPicker: (status: string) => void;
  onCloseColorPicker: () => void;
}
