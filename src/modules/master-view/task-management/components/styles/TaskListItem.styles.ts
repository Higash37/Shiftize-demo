import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";
import { shadows } from "@/common/common-constants/ThemeConstants";

export const useTaskListItemStyles = () => {
  return StyleSheet.create({
    container: {
      backgroundColor: "white",
      borderRadius: 8,
      padding: 16,
      marginVertical: 4,
      ...shadows.listItem,
    },
    inactiveContainer: {
      backgroundColor: "#f5f5f5",
      opacity: 0.7,
    },
    header: {
      marginBottom: 12,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text.primary,
      flex: 1,
      marginRight: 8,
    },
    inactiveText: {
      color: colors.text.disabled,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    },
    priorityText: {
      color: "white",
      fontSize: 12,
      fontWeight: "bold",
    },
    moreButton: {
      padding: 4,
    },
    description: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 12,
    },
    typeBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    typeBadgeText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    tagBadge: {
      backgroundColor: "#e3f2fd",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    tagBadgeText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "600",
    },
    detailsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      marginBottom: 8,
    },
    detailItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    detailText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    validityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: 8,
      backgroundColor: "#fff3e0",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    validityText: {
      fontSize: 12,
      color: "#e65100",
      fontWeight: "500",
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
    },
    inactiveStatusText: {
      fontSize: 12,
      color: "#f44336",
      fontWeight: "500",
    },
  });
};
