import { StyleSheet } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { getPlatformShadow } from "@/common/common-utils/util-style/StyleGenerator";
import { TimeInputSectionStyles } from "./TimeInputSection.types";
import {
  shiftUIConstants,
  shiftUIStyles,
} from "../user-shift-utils/ui-constants";

export const styles = StyleSheet.create<TimeInputSectionStyles>({
  ...shiftUIStyles,
  container: {
    ...shiftUIStyles.container,
  },
  label: {
    ...shiftUIStyles.title,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    ...shiftUIStyles.label,
  },
  separator: {
    marginHorizontal: shiftUIConstants.spacing.sm,
    color: colors.text.secondary,
  },
  timeButton: {
    ...shiftUIStyles.input,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  timeButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    textAlign: "center",
  },
  pickerContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...getPlatformShadow(4),
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerCancelText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  pickerDoneText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  picker: {
    height: 216,
  },
});
