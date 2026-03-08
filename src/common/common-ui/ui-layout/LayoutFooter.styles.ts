import { StyleSheet, Platform, Dimensions } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";
import { BREAKPOINTS } from "@/common/common-constants/BoundaryConstants";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < BREAKPOINTS.SMALL_DEVICE_MAX_WIDTH_EXCLUSIVE;

/**
 * LayoutFooter MD3スタイルファクトリ
 */
export const createFooterStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    footer: {
      flexDirection: "row",
      backgroundColor: theme.colorScheme.surfaceContainer,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colorScheme.outlineVariant,
      width: "100%",
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      justifyContent: "space-around",
      alignItems: "flex-end",
      paddingHorizontal: theme.spacing.md,
      paddingBottom: 3,
      paddingTop: 3,
      ...(Platform.OS === "web" &&
        ({
          position: "relative" as any,
          bottom: 0,
          left: 0,
          right: 0,
          backdropFilter: "blur(18px)",
        } as any)),
    },
    tab: {
      flex: 1,
      alignItems: "center",
      paddingTop: 2,
      paddingBottom: 3,
      minWidth: 0,
      maxWidth: "100%",
      justifyContent: "flex-end",
    },
    createTab: {
      marginTop: IS_SMALL_DEVICE ? -15 : -20,
    },
    disabledTab: {
      opacity: 0.5,
    },
    label: {
      ...theme.typography.labelSmall,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: 1,
    },
    activeLabel: {
      color: theme.colorScheme.primary,
    },
    createLabel: {
      color: theme.colorScheme.primary,
    },
    disabledLabel: {
      color: theme.colorScheme.onSurfaceVariant,
    },
    addButtonContainer: {
      width: IS_SMALL_DEVICE ? 48 : 56,
      height: IS_SMALL_DEVICE ? 48 : 56,
      borderRadius: IS_SMALL_DEVICE ? 24 : 28,
      backgroundColor: theme.colorScheme.primary,
      justifyContent: "center",
      alignItems: "center",
      ...theme.elevation.level3.shadow,
    },
  });
