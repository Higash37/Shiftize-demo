import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { TimeSelectStyles } from "./types";
import {
  shiftUIConstants,
  shiftUIStyles,
} from "../user-shift-utils/ui-constants";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;
const IS_TABLET = SCREEN_WIDTH > 768;

export const styles = StyleSheet.create<TimeSelectStyles>({
  ...shiftUIStyles,
  container: {
    ...shiftUIStyles.container,
    marginBottom: shiftUIConstants.spacing.md,
    padding: IS_SMALL_DEVICE
      ? shiftUIConstants.spacing.sm
      : shiftUIConstants.spacing.md,
  },
  timeContainer: {
    flexDirection: "row",
    gap: IS_SMALL_DEVICE
      ? shiftUIConstants.spacing.sm
      : shiftUIConstants.spacing.md,
  },
  timeSelect: {
    flex: 1,
  },
  label: {
    ...shiftUIStyles.label,
    fontSize: shiftUIConstants.fontSize.md,
  },
  button: {
    ...shiftUIStyles.input,
    padding: IS_SMALL_DEVICE
      ? shiftUIConstants.spacing.sm
      : shiftUIConstants.spacing.md,
  },
  buttonText: {
    fontSize: shiftUIConstants.fontSize.md,
    color: colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: IS_SMALL_DEVICE ? "90%" : "80%",
    maxHeight: IS_SMALL_DEVICE ? "90%" : "80%",
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: IS_SMALL_DEVICE ? 12 : 16,
  },
  optionsContainer: {
    maxHeight: IS_SMALL_DEVICE ? 250 : 300,
  },
  scrollContainer: {
    maxHeight: IS_SMALL_DEVICE ? 250 : 300,
  },
  optionItem: {
    padding: IS_SMALL_DEVICE ? 10 : 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: shiftUIConstants.fontSize.md,
    color: colors.text.primary,
  },
  selectedOptionText: {
    color: colors.text.white,
  },
});
