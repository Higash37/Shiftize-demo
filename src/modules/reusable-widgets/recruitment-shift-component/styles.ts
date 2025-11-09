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
    maxWidth: 600,
    width: "95%",
    maxHeight: "85%",
    alignItems: "stretch",
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
  listContainer: {
    paddingBottom: 20,
    width: "100%",
  },
  shiftItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: "100%",
    ...shadows.card,
  },
  shiftItemApplied: {
    backgroundColor: colors.selected,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  shiftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  shiftTime: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: "500",
  },
  shiftSubject: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  shiftNotes: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  applicantsInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  applicantsCount: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  applicationStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  applicationStatusText: {
    fontSize: 14,
    color: colors.success,
    marginLeft: 8,
  },
  applyButtonContainer: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    ...shadows.button,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
  },

  // 新しい現代的なカードデザイン（横長）
  modernShiftCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 0,
    marginBottom: 12,
    width: "100%",
    overflow: "hidden",
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    maxHeight: 120,
  },
  appliedCard: {
    borderColor: colors.success,
    borderWidth: 2,
    backgroundColor: "#f8fffe",
  },
  masterCard: {
    borderColor: colors.primary,
    backgroundColor: "#fafbff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    marginRight: 4,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
  },
  openBadge: {
    backgroundColor: "#e8f5e8",
  },
  closedBadge: {
    backgroundColor: "#ffebee",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    padding: 12,
    paddingTop: 8,
    paddingBottom: 8,
    minHeight: 30,
  },
  subjectContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
    marginLeft: 8,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notesText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8,
    lineHeight: 20,
    flex: 1,
  },
  cardFooter: {
    padding: 12,
    paddingTop: 0,
  },
  applicantsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  applicantsText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
    marginLeft: 8,
  },
  appliedContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  appliedText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.success,
    marginLeft: 8,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
    marginLeft: 8,
  },
  masterActionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  masterActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    marginLeft: 8,
  },
});