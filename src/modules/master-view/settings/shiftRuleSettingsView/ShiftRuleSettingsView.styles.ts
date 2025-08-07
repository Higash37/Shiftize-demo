import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { typography } from "@/common/common-constants/TypographyConstants";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;
const isDesktop = width >= 1024;

export const shiftRuleSettingsViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    flex: 1,
    width: "100%",
  },
  content: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flex: 1,
  },
  card: {
    width: isDesktop ? "60%" : isTablet ? "80%" : "90%",
    maxWidth: isDesktop ? 1000 : isTablet ? 800 : undefined,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.large,
    padding: isDesktop
      ? layout.padding.xlarge
      : isTablet
      ? layout.padding.large
      : layout.padding.large,
    ...shadows.medium,
    alignSelf: "center",
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
  listItemRow: {
    flexDirection: isDesktop ? "row" : "column",
    justifyContent: "space-between",
    alignItems: isDesktop ? "center" : "center",
    paddingVertical: isDesktop ? layout.padding.medium : layout.padding.large,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: isDesktop ? 0 : layout.padding.medium,
  },
  listText: {
    fontSize: isDesktop
      ? typography.fontSize.medium
      : isTablet
      ? typography.fontSize.medium
      : typography.fontSize.medium,
    color: colors.text.primary,
    fontWeight: "500",
    flex: isDesktop ? 1 : undefined,
    textAlign: isDesktop ? "left" : "center",
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
    fontSize: isDesktop
      ? typography.fontSize.medium
      : typography.fontSize.medium,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: layout.padding.medium,
    justifyContent: isDesktop ? "flex-end" : "center",
    flex: isDesktop ? 0 : 0,
  },
  valueTouchable: {
    paddingHorizontal: layout.padding.medium,
    paddingVertical: layout.padding.small,
    borderRadius: layout.borderRadius.small,
    backgroundColor: colors.background,
    marginHorizontal: layout.padding.small,
    minWidth: isDesktop ? 80 : isTablet ? 70 : 80,
  },
  valueText: {
    fontSize: isDesktop
      ? typography.fontSize.medium
      : typography.fontSize.medium,
    color: colors.primary,
    fontWeight: "600",
    textAlign: "center",
  },
  switchButton: {
    padding: layout.padding.small,
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
});
