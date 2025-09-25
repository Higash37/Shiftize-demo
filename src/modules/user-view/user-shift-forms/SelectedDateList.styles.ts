import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold" as const,
    marginBottom: 8,
    color: colors.text.primary,
  },
  calendar: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold" as const,
    marginBottom: 12,
    color: colors.primary,
  },
  item: {
    backgroundColor: colors.surfaceElevated,
    padding: 12,
    borderRadius: 12,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "500",
  },
  removeText: {
    color: colors.primary,
    fontWeight: "bold" as const,
  },
  noneText: {
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
