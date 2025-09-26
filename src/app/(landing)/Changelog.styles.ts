import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";

const palette = {
  filterActiveBackground: "rgba(10, 132, 255, 0.12)",
  impactBackground: "rgba(52, 199, 89, 0.12)",
  shadowColor: "rgba(0, 0, 0, 0.12)",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 26,
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
    backgroundColor: colors.surface,
  },
  filterButtonActive: {
    borderWidth: 2,
    backgroundColor: palette.filterActiveBackground,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  changelogSection: {
    paddingHorizontal: 20,
  },
  changelogItem: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: palette.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  changelogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  versionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  version: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: colors.text.white,
    fontSize: 12,
    fontWeight: "600",
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  date: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  changelogTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  changelogDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  changesList: {
    marginBottom: 16,
  },
  changesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  changeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  changeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
    marginTop: 6,
  },
  changeText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  impactSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.impactBackground,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  impactText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: "500",
    flex: 1,
  },
  timelineConnector: {
    position: "absolute",
    left: -10,
    top: "100%",
    width: 2,
    height: 20,
    backgroundColor: colors.border,
  },
  futurePlansSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  futurePlanCard: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: palette.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  futurePlanTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginTop: 12,
    marginBottom: 12,
    textAlign: "center",
  },
  futurePlanText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
});

export default styles;
