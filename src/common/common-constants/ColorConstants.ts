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
};

export const colors: ColorsType = {
  primary: "#0A84FF", // iOS systemBlue accent
  secondary: "#5E5CE6", // systemIndigo
  background: "rgba(255, 255, 255, 0.94)", // shared translucent background
  surface: "#FFFFFF", // systemBackground
  surfaceElevated: "rgba(255, 255, 255, 0.82)", // frosted surfaces
  text: {
    primary: "#1C1C1E", // label
    secondary: "#6E6E73", // secondaryLabel
    white: "#FFFFFF",
    disabled: "#AEAEB2", // tertiaryLabel
  },
  border: "rgba(60, 60, 67, 0.18)", // separator on light backgrounds
  overlay: "rgba(255, 255, 255, 0.6)", // blur overlay tint
  header: {
    background: "rgba(255, 255, 255, 0.9)",
    tint: "#0A84FF",
    separator: "rgba(60, 60, 67, 0.29)",
  },
  footer: {
    background: "rgba(255, 255, 255, 0.9)",
    tint: "#0A84FF",
    separator: "rgba(60, 60, 67, 0.18)",
  },
  error: "#FF3B30",
  success: "#34C759",
  warning: "#FF9F0A",
  selected: "rgba(10, 132, 255, 0.12)",
  shift: shiftStatusPalette,
  status: shiftStatusPalette,
};
