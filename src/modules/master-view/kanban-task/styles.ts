import { StyleSheet, Dimensions } from "react-native";
import { IS_SMALL_DEVICE } from "../../../common/common-utils/util-style/responsive";
import { shadows } from "@/common/common-constants/ThemeConstants";

const screenWidth = Dimensions.get("window").width;
const columnWidth = (screenWidth - 60) / 3; // 3カラム + マージン

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: IS_SMALL_DEVICE ? 18 : 20,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  kanbanBoard: {
    flex: 1,
    paddingHorizontal: 16,
  },
  boardContent: {
    paddingVertical: 16,
  },
  column: {
    width: columnWidth,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    ...shadows.card,
  },
  columnHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  columnTitle: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: "bold",
    color: "#fff",
  },
  taskCount: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    textAlign: "center",
  },
  columnContent: {
    flex: 1,
    maxHeight: 500, // スクロール可能な最大高さ
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  emptyColumn: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    color: "#999",
    fontStyle: "italic",
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    ...shadows.listItem,
  },
  taskTitle: {
    fontSize: IS_SMALL_DEVICE ? 13 : 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: IS_SMALL_DEVICE ? 11 : 13,
    color: "#666",
    lineHeight: 16,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskCreator: {
    fontSize: IS_SMALL_DEVICE ? 10 : 12,
    color: "#999",
  },
  taskPriority: {
    fontSize: IS_SMALL_DEVICE ? 10 : 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: "500",
  },
  priorityHigh: {
    backgroundColor: "#ffebee",
    color: "#c62828",
  },
  priorityMedium: {
    backgroundColor: "#fff3e0",
    color: "#ef6c00",
  },
  priorityLow: {
    backgroundColor: "#e8f5e8",
    color: "#2e7d32",
  },
  taskActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  dueDate: {
    fontSize: IS_SMALL_DEVICE ? 10 : 12,
    color: "#666",
    marginLeft: 4,
  },
  overdue: {
    color: "#d32f2f",
  },
  publicBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#4caf50",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  publicBadgeText: {
    fontSize: 8,
    color: "#fff",
    fontWeight: "bold",
  },
  // モーダル関連のスタイル
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: IS_SMALL_DEVICE ? 16 : 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalCancelButton: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    color: "#666",
  },
  modalSaveButton: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  priorityContainer: {
    flexDirection: "row",
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  prioritySelected: {
    backgroundColor: "#f0f8ff",
  },
  priorityOptionText: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    fontWeight: "500",
    color: "#666",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  datePickerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: IS_SMALL_DEVICE ? 14 : 16,
    color: "#333",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchDescription: {
    fontSize: IS_SMALL_DEVICE ? 12 : 14,
    color: "#666",
    marginTop: 2,
  },
});
