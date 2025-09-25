import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";
import { shadows } from "@/common/common-constants/ThemeConstants";

export const useExtendedShiftReportStyles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: "white",
      borderBottomWidth: 1,
      borderBottomColor: "#e0e0e0",
    },
    closeButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text.primary,
    },
    submitButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
    },
    submitButtonDisabled: {
      backgroundColor: colors.text.disabled,
    },
    submitButtonText: {
      color: "white",
      fontWeight: "600",
    },
    shiftInfo: {
      backgroundColor: colors.selected,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#e0e0e0",
    },
    shiftInfoText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text.primary,
      textAlign: "center",
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    section: {
      marginVertical: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text.primary,
      marginBottom: 12,
    },
    noTasksContainer: {
      alignItems: "center",
      paddingVertical: 40,
      backgroundColor: "white",
      borderRadius: 8,
    },
    noTasksText: {
      fontSize: 16,
      color: colors.text.secondary,
      marginTop: 12,
    },
    taskItem: {
      backgroundColor: "white",
      borderRadius: 8,
      padding: 16,
      marginBottom: 8,
      borderWidth: 2,
      borderColor: "transparent",
    },
    taskItemSelected: {
      borderColor: colors.primary,
      ...shadows.listItem,
    },
    taskHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    taskInfo: {
      flex: 1,
      marginRight: 8,
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text.primary,
      marginBottom: 4,
    },
    taskDescription: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 18,
    },
    taskBadges: {
      alignItems: "flex-end",
      gap: 4,
      marginRight: 8,
    },
    typeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    badgeText: {
      color: "white",
      fontSize: 10,
      fontWeight: "bold",
    },
    timeRestriction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: 8,
      backgroundColor: "#fff3e0",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    timeRestrictionText: {
      fontSize: 12,
      color: "#e65100",
      fontWeight: "500",
    },
    baseInfo: {
      marginBottom: 8,
    },
    baseInfoText: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    executionInputs: {
      backgroundColor: "#f8f9fa",
      padding: 12,
      borderRadius: 6,
      marginTop: 8,
    },
    inputRow: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 12,
    },
    inputGroup: {
      flex: 1,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 8,
    },
    counterContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    counterButton: {
      backgroundColor: colors.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    counterValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text.primary,
      minWidth: 40,
      textAlign: "center",
    },
    notesInput: {
      borderWidth: 1,
      borderColor: "#e0e0e0",
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      backgroundColor: "white",
      textAlignVertical: "top",
    },
    commentsInput: {
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "#e0e0e0",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      textAlignVertical: "top",
      minHeight: 100,
    },
  });
};
