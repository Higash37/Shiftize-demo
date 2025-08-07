import { Shift as CommonShift } from "@/common/common-models/ModelIndex";

export interface ShiftAdapterProps {
  shift: CommonShift;
  isOpen: boolean;
}

export interface ShiftItemProps {
  shift: CommonShift;
  isExpanded: boolean;
  onToggle: () => void;
}
