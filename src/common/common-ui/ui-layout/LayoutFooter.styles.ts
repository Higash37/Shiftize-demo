import { StyleSheet, Platform, Dimensions } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;

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
      alignItems: "center",
      paddingHorizontal: theme.spacing.md,
      padding: theme.spacing.xs,
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
      paddingVertical: IS_SMALL_DEVICE ? 6 : 8,
      minWidth: 0,
      maxWidth: "100%",
      justifyContent: "center",
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
      marginTop: IS_SMALL_DEVICE ? 2 : 4,
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
