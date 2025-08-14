import { StyleSheet } from "react-native";
import { colors } from "@/common/common-theme/ThemeColors";
import { ShiftListStyles } from "./ShiftList.types";
import { ShiftStatus } from "@/common/common-models/ModelIndex";

export const getStatusColor = (status: ShiftStatus) => {
  switch (status) {
    case "draft":
      return colors.status[status];
    case "pending":
      return colors.status[status];
    case "approved":
      return colors.status[status];
    case "rejected":
      return colors.status[status];
    case "deletion_requested":
      return colors.status[status];
    case "deleted":
      return colors.status[status];
    default:
      return colors.text.primary;
  }
};

export const styles = StyleSheet.create<ShiftListStyles>({
  container: {
    padding: 16,
  },
  shiftItem: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 6,
    marginBottom: 8,
    borderWidth: 2,
  },
  shiftInfo: {
    flex: 1,
  },
  dateTime: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  shiftType: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  rightContainer: {
    alignItems: "flex-end",
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsButtonText: {
    fontSize: 14,
    marginRight: 4,
    color: colors.primary,
  },
  detailsContainer: {
    marginTop: 8,
    padding: 4,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  timelineContainer: {
    marginBottom: 16,
  },
  timeSlot: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  classTimeSlot: {
    backgroundColor: colors.primary,
  },
  timeSlotTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  changesContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  changesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  changesText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
