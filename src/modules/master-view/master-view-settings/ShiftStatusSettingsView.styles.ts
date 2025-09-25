import { StyleSheet } from "react-native";
import { colors, shadows } from "@/common/common-constants/ThemeConstants";

export const shiftStatusSettingsViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 32,
  },
  scrollContent: {
    paddingBottom: 16,
    width: "100%",
  },
  statusItem: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 0,
    ...shadows.none,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  colorButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  colorButtonText: {
    color: colors.text.white,
    fontSize: 14,
  },
});
