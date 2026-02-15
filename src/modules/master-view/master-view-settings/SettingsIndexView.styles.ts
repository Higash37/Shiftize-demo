import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

/**
 * SettingsIndexView MD3スタイルファクトリ
 */
export const createSettingsIndexViewStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
      paddingTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
    },
    containerTablet: {
      paddingHorizontal: theme.spacing.xxl,
      maxWidth: 1000,
      alignSelf: "center",
      width: "100%",
    },
    containerDesktop: {
      paddingHorizontal: theme.spacing.xxxl,
      maxWidth: 1400,
      alignSelf: "center",
      width: "100%",
    },
    title: {
      ...theme.typography.headlineSmall,
      color: theme.colorScheme.onSurface,
      marginBottom: theme.spacing.xl,
      alignSelf: "center",
      letterSpacing: 0.5,
    },
    listContainer: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      alignSelf: "center",
      width: "90%",
      maxWidth: 600,
      paddingVertical: theme.spacing.xs,
      ...theme.elevation.level2.shadow,
    },
    listContainerTablet: {
      width: "80%",
      maxWidth: 700,
    },
    listContainerDesktop: {
      width: "60%",
      maxWidth: 800,
    },
    listItem: {
      flexDirection: "row",
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xxl,
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: 52,
    },
    listItemTablet: {
      minHeight: 56,
    },
    listItemDesktop: {
      paddingVertical: theme.spacing.xxl,
      minHeight: 60,
    },
    listText: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurface,
      fontWeight: "500",
      flex: 1,
    },
    listTextDesktop: {
      ...theme.typography.titleMedium,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colorScheme.outlineVariant,
      marginLeft: theme.spacing.xxl,
    },
    chevronText: {
      ...theme.typography.titleMedium,
      color: theme.colorScheme.outlineVariant,
    },
  });
