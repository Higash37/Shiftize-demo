import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";

export const useTaskManagementStyles = () => {
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
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text.primary,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addButtonText: {
      color: "white",
      fontWeight: "600",
      marginLeft: 4,
    },
    taskList: {
      flex: 1,
      paddingHorizontal: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 50,
    },
    loadingText: {
      fontSize: 16,
      color: colors.text.secondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 50,
    },
    emptyText: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: "center",
      marginTop: 16,
      marginBottom: 24,
    },
    emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    emptyButtonText: {
      color: "white",
      fontWeight: "600",
    },
  });
};
