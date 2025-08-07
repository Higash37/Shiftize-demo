import { StyleSheet } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { ShiftDetailsStyles } from "./ShiftDetails.types";

export const styles = StyleSheet.create<ShiftDetailsStyles>({
  container: {
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    marginBottom: 8,
  },
  nickname: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  date: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  timeSlots: {
    gap: 8,
  },
  timeSlot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  classTimeSlot: {
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  timeSlotLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    width: 60,
  },
  classLabel: {
    color: colors.primary,
  },
  timeText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  classTime: {
    color: colors.primary,
    fontWeight: "bold",
  },
});
