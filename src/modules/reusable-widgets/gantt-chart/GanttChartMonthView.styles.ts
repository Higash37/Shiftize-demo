import { StyleSheet } from "react-native";
import { colors, shadows } from "@/common/common-constants/ThemeConstants";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addShiftButtonRow: {
    // +ボタンは非表示にするが、行自体は表示
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addShiftButton: {
    display: "none", // +ボタンのみ非表示
    backgroundColor: "rgba(10, 132, 255, 0.9)", // colors.primaryの90% opacity
    borderRadius: 20, // より丸みを帯びたデザイン
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.surface,
    width: 320,
    maxHeight: "100%", // 画面の80%以下に制限
    borderRadius: 16, // より丸みを帯びたデザイン
    padding: 8, // 12から8にさらに減らす
    ...shadows.modal,
    borderWidth: 0, // ボーダーを除去してクリーンに
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2, // 4から2に減らす
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4, // 8から4に減らす
    textAlign: "center",
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4, // 8から4に減らす
  },
  timeInputGroup: {
    flex: 1,
  },
  timeInputLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 6,
    fontSize: 14,
  },
  timeInputSeparator: {
    marginHorizontal: 8,
    fontSize: 16,
    color: colors.text.secondary,
  },
  formGroup: {
    marginBottom: 6,
  },
  formLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  pickerContainer: {
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    marginRight: 8,
    backgroundColor: colors.surfaceElevated,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontWeight: "bold",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
    height: 40,
    alignItems: "center",
  },
  headerRightButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    gap: 8,
  },
  headerButton: {
    backgroundColor: colors.primary,
    borderRadius: 8, // 角丸を少し大きく
    paddingHorizontal: 20, // 横幅を大きく
    paddingVertical: 10, // 縦幅も大きく
    marginLeft: 8, // 間隔も広げる
    height: 44, // ボタン自体の高さも大きく
    minWidth: 80, // 最小幅を確保
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  headerButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18, // 文字サイズも大きく
    letterSpacing: 0.5,
  },
  headerDateCell: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  headerGanttCell: {
    flexDirection: "row",
    position: "relative",
    borderRightWidth: 1,
    borderRightColor: colors.border,
    height: 40,
  },
  headerInfoCell: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  timeLabel: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "bold",
    color: colors.text.primary,
    paddingTop: 12,
  },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  monthNavButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  monthNavButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  monthButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  shiftRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 70,
    height: 70,
  },
  dateCell: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surface,
  },
  dateDayText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dateWeekText: {
    fontSize: 12,
  },
  ganttCell: {
    position: "relative",
    height: 65,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    overflow: "hidden",
  },
  ganttBgRow: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
  },
  ganttBgCell: {
    height: "100%",
    borderRightColor: colors.border,
  },
  classTimeCell: {
    backgroundColor: "rgba(180, 180, 180, 0.15)",
  },
  shiftBar: {
    position: "absolute",
    height: 65,
    top: 0,
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
    elevation: 3,
    borderWidth: 0,
  },
  shiftBarText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },
  shiftTimeText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  infoCell: {
    padding: 0,
    justifyContent: "flex-start",
    height: 65,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  infoContent: {
    marginBottom: 0,
    padding: 3,
    borderRadius: 10,
    marginHorizontal: 0,
    marginTop: 1,
    borderWidth: 1.2, // 外枠をしっかり
    borderColor: colors.success, // ステータス色を使う場合はJS側で上書き
    backgroundColor: colors.selected,
    // 下線は消す（borderBottomWidth, borderBottomColorはJS側で消す）
  },
  infoText: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 1,
  },
  infoTimeText: {
    fontSize: 11,
    color: colors.text.primary,
    marginBottom: 0,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  emptyCell: {
    height: 65,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    position: "relative",
  },
  emptyInfoCell: {
    height: 65,
    backgroundColor: colors.surface,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  input: {
    height: 40,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: colors.success,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: "center",
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  classBar: {
    position: "absolute",
    backgroundColor: "#b0b0b0",
    borderRadius: 6,
    opacity: 0.85,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
    zIndex: 3,
  },
  headerCostCellLeft: {
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 5,
  },
  costLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    textDecorationLine: "underline",
  },
  monthCostContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  monthCostContainerLeft: {
    position: "absolute",
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  monthPickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.selected,
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  pdfButtonText: {
    marginLeft: 4,
    color: colors.primary,
    fontWeight: "bold",
  },
});

export default styles;
