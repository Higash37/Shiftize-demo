import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";
import { shadows } from "@/common/common-constants/ThemeConstants";

export const useTaskFiltersStyles = () => {
  return StyleSheet.create({
    container: {
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
    filterSection: {
      marginBottom: 12,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 8,
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
    statusFilterContainer: {
      flexDirection: "row",
      backgroundColor: "#f5f5f5",
      borderRadius: 8,
      padding: 2,
    },
    statusFilter: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 6,
    },
    statusFilterActive: {
      backgroundColor: "white",
      ...shadows.small,
    },
    statusFilterText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    statusFilterTextActive: {
      color: colors.text.primary,
      fontWeight: "600",
    },
  });
};
