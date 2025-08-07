import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";

export const useTaskManagementIntegratedStyles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f5f5f5",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 16,
      color: colors.text.secondary,
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
    headerActions: {
      flexDirection: "row",
      gap: 8,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 4,
    },
    addButtonText: {
      color: "white",
      fontWeight: "600",
    },
    viewSelector: {
      flexDirection: "row",
      backgroundColor: "white",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#e0e0e0",
      gap: 8,
    },
    viewButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: "#f5f5f5",
      gap: 4,
    },
    viewButtonActive: {
      backgroundColor: colors.primary,
    },
    viewButtonText: {
      fontSize: 14,
      color: colors.text.secondary,
      fontWeight: "500",
    },
    viewButtonTextActive: {
      color: "white",
      fontWeight: "600",
    },
    filtersContainer: {
      backgroundColor: "white",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#e0e0e0",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: colors.text.primary,
    },
    clearButton: {
      padding: 4,
    },
    filterRow: {
      flexDirection: "row",
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: "#f5f5f5",
      borderWidth: 1,
      borderColor: "#e0e0e0",
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    filterChipTextActive: {
      color: "white",
      fontWeight: "600",
    },
    content: {
      flex: 1,
    },
    comingSoonContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 80,
    },
    comingSoonText: {
      fontSize: 18,
      color: colors.text.secondary,
      marginTop: 16,
      textAlign: "center",
    },
  });
};
