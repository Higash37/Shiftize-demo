import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    minWidth: 320,
    maxWidth: 400,
    width: "90%",
    alignItems: "center",
    ...shadows.modal,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: colors.primary,
  },
  shiftInfo: {
    backgroundColor: colors.selected,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
  },
  shiftInfoLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  shiftInfoText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  shiftInfoSubject: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  timeSelectionContainer: {
    marginBottom: 20,
    width: "100%",
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  timeSeparator: {
    paddingHorizontal: 12,
    paddingTop: 20,
  },
  timeSeparatorText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  notesContainer: {
    marginBottom: 20,
    width: "100%",
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text.primary,
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    ...shadows.button,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});