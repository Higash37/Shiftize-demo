import { ShiftStatus } from "../common-models/model-shift/shiftTypes";

export type ColorsType = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  text: {
    primary: string;
    secondary: string;
    white: string;
    disabled: string;
  };
  border: string;
  overlay: string;
  header: {
    background: string;
    tint: string;
    separator: string;
  };
  footer: {
    background: string;
    tint: string;
    separator: string;
  };
  error: string;
  success: string;
  warning: string;
  selected: string;
  shift: Record<ShiftStatus, string>;
  status: Record<ShiftStatus, string>;
};

const shiftStatusPalette: Record<ShiftStatus, string> = {
  draft: "#FFFFFF",
  pending: "#FF9F0A",
  approved: "#0A84FF",
  rejected: "#FF3B30",
  deleted: "#FFFFFF",
  completed: "#34C759",
  deletion_requested: "#FF9F0A",
  purged: "#FFFFFF",
  recruitment: "#9e9e9e",
};

export const colors: ColorsType = {
  primary: "#2196F3",
  secondary: "#757575",
  background: "rgba(255, 255, 255, 0.94)",
  surface: "#FFFFFF",
  surfaceElevated: "#F5F5F5",
  text: {
    primary: "#333333",
    secondary: "#757575",
    white: "#FFFFFF",
    disabled: "#BDBDBD",
  },
  border: "#E0E0E0",
  overlay: "rgba(255, 255, 255, 0.6)",
  header: {
    background: "rgba(255, 255, 255, 0.9)",
    tint: "#2196F3",
    separator: "#E0E0E0",
  },
  footer: {
    background: "rgba(255, 255, 255, 0.9)",
    tint: "#2196F3",
    separator: "#E0E0E0",
  },
  error: "#F44336",
  success: "#4CAF50",
  warning: "#FF9800",
  selected: "rgba(33, 150, 243, 0.08)",
  shift: shiftStatusPalette,
  status: shiftStatusPalette,
};
