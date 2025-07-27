import { StyleSheet } from "react-native";
import { colors, typography, shadows } from "@/common/common-constants/ThemeConstants";

export const masterDashboardViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.medium,
    textAlign: "center",
    padding: 16,
  },
  stats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  linksContainer: {
    width: "100%",
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  value: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  label: {
    fontSize: typography.fontSize.medium,
    color: colors.text.secondary,
  },
  link: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  taskLink: {
    backgroundColor: "#4caf50",
  },
  linkText: {
    color: colors.text.white,
    fontSize: typography.fontSize.medium,
    fontWeight: "600",
  },
});
