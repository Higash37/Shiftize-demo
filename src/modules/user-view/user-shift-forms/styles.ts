import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: colors.text.primary,
  },
  calendar: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateItem: {
    padding: 12,
    backgroundColor: colors.surface,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
  },
  removeButton: {
    color: "#ff6b6b",
    fontWeight: "bold",
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
  },
  picker: {
    height: 150,
  },
});
