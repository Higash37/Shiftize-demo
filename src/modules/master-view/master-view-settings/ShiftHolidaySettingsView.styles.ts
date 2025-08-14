import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { typography } from "@/common/common-constants/TypographyConstants";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;
const isDesktop = width >= 1024;

export const shiftHolidaySettingsViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: layout.padding.xlarge,
    paddingHorizontal: layout.padding.medium,
  },
  containerTablet: {
    paddingHorizontal: layout.padding.large,
    maxWidth: 1000,
    alignSelf: "center",
    width: "100%",
  },
  containerDesktop: {
    paddingHorizontal: layout.padding.xlarge,
    maxWidth: 1400,
    alignSelf: "center",
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    width: "100%",
  },
  card: {
    width: isDesktop ? "60%" : isTablet ? "80%" : "90%",
    maxWidth: isDesktop ? 1100 : isTablet ? 850 : undefined,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.large,
    padding: isDesktop
      ? layout.padding.xlarge
      : isTablet
      ? layout.padding.large
      : layout.padding.large,
    ...shadows.medium,
    alignSelf: "center",
    marginBottom: layout.padding.large,
  },
  sectionTitle: {
    fontSize: isDesktop
      ? typography.fontSize.large
      : isTablet
      ? typography.fontSize.medium
      : typography.fontSize.medium,
    fontWeight: "700",
    marginBottom: layout.padding.large,
    color: colors.text.primary,
  },
  calendarContainer: {
    marginBottom: layout.padding.large,
    borderRadius: layout.borderRadius.medium,
    overflow: "hidden",
  },
  holidayList: {
    marginTop: layout.padding.large,
  },
  holidayItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: layout.padding.medium,
    paddingHorizontal: layout.padding.medium,
    backgroundColor: colors.background,
    borderRadius: layout.borderRadius.small,
    marginBottom: layout.padding.small,
    ...shadows.small,
  },
  holidayInfo: {
    flex: 1,
  },
  holidayDate: {
    fontSize: typography.fontSize.small,
    color: colors.text.secondary,
    marginBottom: layout.padding.small,
  },
  holidayName: {
    fontSize: typography.fontSize.medium,
    color: colors.text.primary,
    fontWeight: "500",
  },
  deleteButton: {
    padding: layout.padding.small,
    borderRadius: layout.borderRadius.small,
    backgroundColor: colors.error + "20",
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    alignItems: "center",
    marginTop: layout.padding.medium,
    minHeight: isDesktop ? 48 : isTablet ? 44 : 44,
  },
  addButtonText: {
    color: colors.text.white,
    fontWeight: "600",
    fontSize: typography.fontSize.medium,
  },
  bulkAddButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: layout.padding.small,
  },
  bulkAddButtonText: {
    color: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: layout.borderRadius.medium,
    padding: layout.padding.medium,
    alignItems: "center",
    marginTop: layout.padding.large,
    width: "100%",
    alignSelf: "center",
    minHeight: isDesktop ? 48 : isTablet ? 44 : 44,
  },
  saveButtonText: {
    color: colors.text.white,
    fontWeight: "600",
    fontSize: typography.fontSize.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.secondary,
    marginTop: layout.padding.medium,
  },
  emptyText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: layout.padding.large,
    fontStyle: "italic",
  },
});
