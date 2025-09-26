import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { responsive, responsiveStyles } from "./utils/responsive";

const palette = {
  shadow: "rgba(0, 0, 0, 0.12)",
  progressTrack: "rgba(60, 60, 67, 0.16)",
  progressBefore: "rgba(60, 60, 67, 0.38)",
  sectionSurface: "rgba(255, 255, 255, 0.85)",
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
    paddingVertical: responsiveStyles.padding(40),
    paddingHorizontal: responsiveStyles.padding(20),
    alignItems: "center",
    maxWidth: responsiveStyles.maxWidth(),
    alignSelf: "center",
    width: "100%",
  },
  pageTitle: {
    fontSize: responsiveStyles.fontSize(32),
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: responsiveStyles.fontSize(18),
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 26,
    maxWidth: responsive({
      mobile: "100%",
      tablet: "600px",
      desktop: "800px",
      default: "100%",
    }) as string,
  },
  timelineSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  timelineItem: {
    marginBottom: 32,
    position: "relative",
  },
  phaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  phaseNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseNumberText: {
    color: colors.text.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  phaseInfo: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  phaseDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  phaseDurationText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  phaseContent: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  phaseDescription: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 22,
  },
  achievementsSection: {
    gap: 8,
  },
  achievementsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  achievementDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  achievementText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  challengesSection: {
    gap: 6,
  },
  challengesTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  challengesText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  timelineConnector: {
    position: "absolute",
    left: 21,
    top: "100%",
    width: 2,
    height: 24,
    backgroundColor: colors.border,
  },
  learningSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  skillsContainer: {
    gap: 20,
  },
  skillItem: {
    backgroundColor: palette.sectionSurface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  skillName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  skillGrowth: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  skillDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  progressBars: {
    gap: 12,
  },
  progressBarRow: {
    gap: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.progressTrack,
    overflow: "hidden",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressBarBefore: {
    backgroundColor: palette.progressBefore,
  },
  progressBarAfter: {
    backgroundColor: colors.primary,
  },
  insightsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  insightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    justifyContent: "center",
  },
  insightCard: {
    width: responsive({
      mobile: "100%",
      tablet: "45%",
      desktop: "30%",
      default: "100%",
    }) as string,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
  },
  insightDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    textAlign: "center",
  },
});

export default styles;
