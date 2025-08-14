import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { typography } from "@/common/common-constants/TypographyConstants";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;
const isDesktop = width >= 1024;

export const shiftAppearanceSettingsViewStyles = StyleSheet.create({
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
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: isDesktop ? layout.padding.medium : layout.padding.large,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: isDesktop ? 60 : isTablet ? 56 : 52,
  },
  listText: {
    fontSize: isDesktop
      ? typography.fontSize.medium
      : typography.fontSize.medium,
    color: colors.text.primary,
    fontWeight: "500",
    flex: 1,
  },
  valueButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: layout.padding.small,
    paddingHorizontal: layout.padding.medium,
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.small,
    minWidth: 80,
  },
  valueText: {
    fontSize: typography.fontSize.medium,
    color: colors.text.secondary,
    marginRight: layout.padding.small,
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
