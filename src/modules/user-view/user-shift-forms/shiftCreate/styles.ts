import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { BREAKPOINTS } from "@/common/common-constants/BoundaryConstants";

// レスポンシブデザイン用の定数
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_SMALL_DEVICE = SCREEN_WIDTH < BREAKPOINTS.SMALL_DEVICE_MAX_WIDTH_EXCLUSIVE;
const IS_TABLET = SCREEN_WIDTH >= BREAKPOINTS.TABLET_MIN_WIDTH_INCLUSIVE && SCREEN_WIDTH < BREAKPOINTS.TABLET_MAX_WIDTH_EXCLUSIVE;

export const shiftCreateFormStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: IS_SMALL_DEVICE ? 12 : 16,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: IS_SMALL_DEVICE ? 16 : 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.text.primary,
  },
  dateSelectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  dateSelectText: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    color: colors.text.primary,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeSelectContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    marginBottom: 4,
    color: colors.text.secondary,
  },
  timeSeparator: {
    marginHorizontal: 12,
    fontSize: IS_SMALL_DEVICE ? 16 : 18,
    color: colors.text.secondary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: colors.text.white,
    marginLeft: 4,
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
  },
  classesList: {
    marginTop: 8,
  },
  classItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  classTitle: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  removeButton: {
    padding: 4,
  },
  classTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  noClassContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  noClassText: {
    color: colors.text.secondary,
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: colors.error + "20",
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: IS_SMALL_DEVICE ? 12 : 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.text.white,
    fontSize: IS_SMALL_DEVICE ? 16 : 18,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: colors.surface,
    padding: IS_SMALL_DEVICE ? 12 : 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.error,
    minHeight: 48,
    justifyContent: "center",
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: IS_SMALL_DEVICE ? 16 : 18,
    fontWeight: "bold",
  },
  successContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(76, 175, 80, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  successText: {
    color: colors.text.white,
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  // 店舗選択関連のスタイル
  storeSelectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  storeSelectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  storeSelectButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  storeSelectText: {
    fontSize: 14,
    color: colors.text.primary,
    textAlign: "center",
  },
  storeSelectTextSelected: {
    color: colors.text.white,
    fontWeight: "bold",
  },
});
