import { StyleSheet, Dimensions } from "react-native";
import { shadows } from "@/common/common-constants/ThemeConstants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_TABLET = SCREEN_WIDTH > 768;
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;

const TaskListStyles = StyleSheet.create({
  taskCard: {
    marginBottom: 16,
    padding: IS_TABLET ? 24 : 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: IS_TABLET ? "80%" : "70%",
    alignSelf: "center",
    ...shadows.card,
  },
  taskText: {
    fontSize: IS_TABLET ? 18 : IS_SMALL_DEVICE ? 14 : 16,
    fontWeight: "bold",
    color: "#333",
  },
  listContainer: {
    paddingBottom: 80,
  },
  addButton: {
    position: "absolute",
    bottom: 30, // Adjusted to avoid footer overlap
    right: 20,
    backgroundColor: "#007BFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.floatingButton,
    zIndex: 1000, // Ensure button is above other elements
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: IS_TABLET ? "70%" : IS_SMALL_DEVICE ? "95%" : "40%", // スマートフォンの場合に幅を95%に拡大
    maxWidth: "95%", // 最大幅も95%に設定
    borderRadius: 16,
    padding: IS_TABLET ? 32 : IS_SMALL_DEVICE ? 20 : 24, // スマートフォンの場合にパディングを少し減らす
    alignSelf: "center",
    ...shadows.modal,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    width: "100%",
    backgroundColor: "#fff",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "bold",
  },
  picker: {
    width: "100%",
    height: 48,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  customInput: {
    width: "100%",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
});

export default TaskListStyles;
