import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";
import { shadows } from "@/common/common-constants/ThemeConstants";

export const useTaskCardViewStyles = () => {
  return StyleSheet.create({
    container: {
      padding: 16,
    },
    row: {
      justifyContent: "space-between",
      marginBottom: 16,
    },
    card: {
      flex: 1,
      backgroundColor: "white",
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 4,
      ...shadows.card,
      minHeight: 280,
    },
    cardInactive: {
      backgroundColor: "#f5f5f5",
      opacity: 0.7,
    },
    cardHeader: {
      marginBottom: 12,
    },
    cardTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    titleWithIcon: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: 8,
    },
    taskIconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    titleContainer: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text.primary,
    },
    shortName: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 2,
      fontWeight: "600",
      backgroundColor: "#f0f0f0",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      alignSelf: "flex-start",
    },
    inactiveText: {
      color: colors.text.disabled,
    },
    moreButton: {
      padding: 4,
    },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
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
    inactiveBadge: {
      backgroundColor: "#f44336",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    badgeText: {
      color: "white",
      fontSize: 10,
      fontWeight: "bold",
    },
    cardDescription: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 18,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 8,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    infoText: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    timeRestriction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#fff3e0",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginBottom: 8,
    },
    timeRestrictionText: {
      fontSize: 12,
      color: "#e65100",
      fontWeight: "500",
    },
    tagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
      marginBottom: 8,
    },
    tag: {
      backgroundColor: "#e3f2fd",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    tagText: {
      fontSize: 10,
      color: colors.primary,
      fontWeight: "500",
    },
    validityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#fff3e0",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginBottom: 8,
    },
    validityText: {
      fontSize: 11,
      color: "#e65100",
      fontWeight: "500",
    },
    performanceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#f8f9fa",
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 6,
      marginBottom: 8,
    },
    performanceScore: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    performanceScoreLabel: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    performanceLevel: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    performanceLevelText: {
      fontSize: 10,
      color: "white",
      fontWeight: "bold",
    },
    performanceValue: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.text.primary,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "auto",
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: "#f0f0f0",
    },
    updatedText: {
      fontSize: 11,
      color: colors.text.disabled,
    },
    footerActions: {
      flexDirection: "row",
      gap: 8,
    },
    quickAction: {
      padding: 6,
      borderRadius: 6,
      backgroundColor: "#f5f5f5",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 80,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text.primary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: "center",
      lineHeight: 22,
    },
  });
};
