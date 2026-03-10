/**
 * @file MasterShiftCreate.styles.ts
 * @description MasterShiftCreate のスタイル定義。
 */
import { StyleSheet } from "react-native";
import type { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createMasterShiftCreateStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colorScheme.surface,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.xxl,
    },
    errorContainer: {
      backgroundColor: theme.colorScheme.error + "10",
      padding: theme.spacing.lg,
      borderRadius: theme.shape.small,
      marginBottom: theme.spacing.xl,
      borderLeftWidth: 4,
      borderLeftColor: theme.colorScheme.error,
    },
    errorText: {
      color: theme.colorScheme.error,
      textAlign: "center",
      ...theme.typography.bodyMedium,
      fontWeight: "500",
    },
    section: {
      marginBottom: theme.spacing.xxl,
    },
    sectionTitle: {
      ...theme.typography.titleMedium,
      fontWeight: "600",
      marginBottom: theme.spacing.lg,
      color: theme.colorScheme.primary,
    },
    datePickerButton: {
      flexDirection: "row",
      backgroundColor: theme.colorScheme.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.shape.medium,
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
    },
    dateText: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurface,
    },
    placeholderText: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurfaceVariant,
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    timeField: {
      flex: 1,
    },
    timeLabel: {
      ...theme.typography.bodyMedium,
      marginBottom: 5,
      color: theme.colorScheme.onSurface,
    },
    separator: {
      width: 30,
      alignItems: "center",
    },
    separatorText: {
      ...theme.typography.titleMedium,
      color: theme.colorScheme.onSurfaceVariant,
    },
    shiftTypeContainer: {
      flexDirection: "row",
    },
    shiftTypeButton: {
      flex: 1,
      padding: theme.spacing.md,
      borderRadius: theme.shape.extraSmall,
      backgroundColor: theme.colorScheme.surface,
      alignItems: "center",
      marginHorizontal: 5,
    },
    activeShiftTypeButton: {
      backgroundColor: theme.colorScheme.primary,
    },
    shiftTypeText: {
      color: theme.colorScheme.onSurfaceVariant,
    },
    activeShiftTypeText: {
      color: theme.colorScheme.onPrimary,
      fontWeight: "bold",
    },
    saveButton: {
      backgroundColor: theme.colorScheme.primary,
      padding: 15,
      borderRadius: theme.shape.extraSmall,
      alignItems: "center",
      marginVertical: 10,
    },
    saveButtonText: {
      color: theme.colorScheme.onPrimary,
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
    },
    deleteButton: {
      backgroundColor: theme.colorScheme.error + "1A",
      padding: 15,
      borderRadius: theme.shape.extraSmall,
      alignItems: "center",
      marginVertical: 10,
    },
    deleteButtonText: {
      color: theme.colorScheme.error,
      ...theme.typography.bodyLarge,
      fontWeight: "bold",
    },
    successMessage: {
      position: "absolute",
      top: 80,
      left: 0,
      right: 0,
      backgroundColor: theme.colorScheme.success + "CC",
      padding: 10,
      margin: 10,
      borderRadius: theme.shape.extraSmall,
      alignItems: "center",
    },
    successText: {
      color: theme.colorScheme.onPrimary,
      fontWeight: "bold",
    },
    userPickerButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colorScheme.surface,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      borderRadius: theme.shape.small,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    userPickerText: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurface,
    },
    placeholderTextDropdown: {
      color: theme.colorScheme.outline,
    },
    dropdownOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      justifyContent: "flex-start",
      paddingTop: 80,
      paddingHorizontal: theme.spacing.lg,
    },
    dropdownContainer: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.small,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      ...theme.elevation.level2.shadow,
    },
    dropdownList: {
      maxHeight: 400,
    },
    dropdownItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    dropdownUserInfo: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    dropdownItemText: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurface,
    },
    dropdownUserRole: {
      ...theme.typography.bodySmall,
      color: theme.colorScheme.onSurfaceVariant,
      marginTop: 2,
    },
    searchContainer: {
      marginBottom: theme.spacing.lg,
    },
    searchInput: {
      backgroundColor: theme.colorScheme.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.shape.medium,
      ...theme.typography.bodyLarge,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
    },
    userListContainer: {
      maxHeight: 240,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      borderRadius: theme.shape.medium,
      backgroundColor: theme.colorScheme.surface,
    },
    userItem: {
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colorScheme.outlineVariant,
    },
    selectedUserItem: {
      backgroundColor: theme.colorScheme.primary,
    },
    userItemText: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurface,
    },
    selectedUserItemText: {
      color: theme.colorScheme.onPrimary,
      fontWeight: "bold",
    },
    storeNameText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurfaceVariant,
      fontStyle: "italic",
    },
    noResultsText: {
      padding: 10,
      textAlign: "center",
      color: theme.colorScheme.onSurfaceVariant,
    },
    pickerContainer: {
      backgroundColor: theme.colorScheme.surface,
      borderRadius: theme.shape.medium,
      borderWidth: 1,
      borderColor: theme.colorScheme.outlineVariant,
      overflow: "hidden",
    },
    picker: {
      height: 56,
      width: "100%",
      border: "none",
      outline: "none",
      backgroundColor: "transparent",
    } as any,
    selectedDatesContainer: {
      marginTop: 10,
    },
    selectedDateCard: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colorScheme.primaryContainer,
      padding: 10,
      borderRadius: theme.shape.extraSmall,
      marginBottom: 10,
    },
    selectedDateText: {
      ...theme.typography.bodyMedium,
      color: theme.colorScheme.onSurface,
    },
    removeDateButton: {
      padding: 5,
      borderRadius: theme.shape.extraSmall,
      backgroundColor: theme.colorScheme.error + "1A",
    },
    removeDateText: {
      color: theme.colorScheme.error,
      fontWeight: "bold",
    },
    toggleButton: {
      backgroundColor: theme.colorScheme.surface,
      padding: theme.spacing.md,
      borderRadius: theme.shape.extraSmall,
      alignItems: "center",
      marginVertical: 10,
    },
    toggleButtonText: {
      ...theme.typography.bodyLarge,
      color: theme.colorScheme.onSurface,
    },
    classesContainer: {
      marginTop: 10,
      padding: 10,
      borderRadius: theme.shape.extraSmall,
      backgroundColor: theme.colorScheme.surface,
    },
    classTimeContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    addButton: {
      flexDirection: "row",
      backgroundColor: theme.colorScheme.primary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: theme.shape.medium,
      alignItems: "center",
      justifyContent: "center",
      marginTop: theme.spacing.lg,
      alignSelf: "flex-start",
      ...theme.elevation.level2.shadow,
    },
    addButtonText: {
      color: theme.colorScheme.onPrimary,
      fontWeight: "bold",
      ...theme.typography.bodyLarge,
      marginLeft: 6,
      letterSpacing: 1,
    },
    removeButton: {
      marginLeft: 10,
    },
    recruitmentItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.colorScheme.primary + "10",
      borderColor: theme.colorScheme.primary,
    },
    recruitmentText: {
      color: theme.colorScheme.primary,
      fontWeight: "600",
    },
  });
