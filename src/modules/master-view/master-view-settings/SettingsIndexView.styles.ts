import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { typography } from "@/common/common-constants/TypographyConstants";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;
const isDesktop = width >= 1024;

export const settingsIndexViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: layout.padding.xlarge,
    paddingHorizontal: layout.padding.medium,
  },
  containerTablet: {
    paddingHorizontal: layout.padding.large,
    width: "100%",
  },
  containerDesktop: {
    paddingHorizontal: layout.padding.xlarge,
    width: "100%",
  },
  title: {
    fontSize: isDesktop
      ? typography.fontSize.xlarge
      : isTablet
      ? typography.fontSize.large
      : typography.fontSize.large,
    fontWeight: "700",
    marginBottom: layout.padding.xlarge,
    alignSelf: "center",
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  listContainer: {
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.large,
    alignSelf: "center", // 常に中央寄せ
    width: isDesktop ? "60%" : isTablet ? "80%" : "90%", // スマホ90%, タブレット80%, PC60%
    maxWidth: isDesktop ? 800 : isTablet ? 700 : 600, // 最大幅も調整
    paddingVertical: layout.padding.small,
    ...shadows.medium,
  },
  listItem: {
    flexDirection: "row",
    paddingVertical: isDesktop
      ? layout.padding.large
      : isTablet
      ? layout.padding.medium
      : layout.padding.medium,
    paddingHorizontal: layout.padding.large,
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: isDesktop ? 60 : isTablet ? 56 : 52,
  },
  disabledItem: {
    opacity: 0.5,
  },
  listItemHover: {
    backgroundColor: colors.background,
  },
  listText: {
    fontSize: isDesktop
      ? typography.fontSize.large
      : isTablet
      ? typography.fontSize.medium
      : typography.fontSize.medium,
    color: colors.text.primary,
    fontWeight: "500",
    flex: 1,
  },
  disabledText: {
    color: colors.text.secondary,
  },
  previewBadge: {
    fontSize: typography.fontSize.small,
    color: "#007AFF",
    backgroundColor: "#007AFF" + "15",
    paddingHorizontal: layout.padding.small,
    paddingVertical: layout.padding.small / 2,
    borderRadius: layout.borderRadius.small,
    fontWeight: "600",
    overflow: "hidden",
  },
  comingSoonBadge: {
    fontSize: typography.fontSize.small,
    color: "#FF9500",
    backgroundColor: "#FF9500" + "15",
    paddingHorizontal: layout.padding.small,
    paddingVertical: layout.padding.small / 2,
    borderRadius: layout.borderRadius.small,
    fontWeight: "600",
    overflow: "hidden",
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: layout.padding.large,
  },
});
