import { StyleSheet, Dimensions } from "react-native";
import { Theme } from "@/common/common-theme";
import { shadows } from "@/common/common-constants/ThemeConstants";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;
const isDesktop = width >= 1024;

export const settingsBackupViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingTop: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
  },
  containerTablet: {
    paddingHorizontal: Theme.spacing.lg,
    maxWidth: 1000,
    alignSelf: "center",
    width: "100%",
  },
  containerDesktop: {
    paddingHorizontal: Theme.spacing.xl,
    maxWidth: 1400,
    alignSelf: "center",
    width: "100%",
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  card: {
    width: isDesktop ? "60%" : isTablet ? "80%" : "90%",
    maxWidth: isDesktop ? 1000 : isTablet ? 800 : undefined,
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    alignSelf: "center",
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: isDesktop ? 20 : isTablet ? 18 : 16,
    fontWeight: "700",
    marginBottom: Theme.spacing.md,
    color: Theme.colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.lg,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  dangerButton: {
    borderColor: "#FF3B30",
    backgroundColor: "#FF3B30" + "10",
  },
  buttonIcon: {
    width: 40,
    alignItems: "center",
    marginRight: Theme.spacing.md,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  buttonDescription: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
  },
  dangerText: {
    color: "#FF3B30",
  },
  infoCard: {
    backgroundColor: "#FF9500" + "10",
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: "#FF9500" + "30",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF9500",
    marginLeft: Theme.spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: Theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
});
