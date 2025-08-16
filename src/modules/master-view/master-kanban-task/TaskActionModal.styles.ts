import { StyleSheet } from "react-native";
import { shadows } from "@/common/common-constants/ThemeConstants";

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "95%",
    height: "85%",
    ...shadows.modal,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
  },
  leftPanel: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  rightPanel: {
    flex: 1,
    paddingLeft: 16,
  },
  scrollContent: {
    flex: 1,
  },
  taskInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  assigneeInfo: {
    gap: 4,
    marginBottom: 8,
  },
  assigneeText: {
    fontSize: 14,
    color: "#666",
  },
  lastUpdateText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  metaText: {
    fontSize: 13,
    color: "#666",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  rulesSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  descriptionInput: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
  },
  descriptionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  memoSection: {
    flex: 1,
    padding: 16,
  },
  memoList: {
    flex: 1,
    marginBottom: 12,
  },
  emptyMemoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyMemoText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  emptyMemoSubText: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 4,
  },
  memoItem: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  memoAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  memoAvatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  memoContent: {
    flex: 1,
  },
  memoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  memoAuthor: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  memoTime: {
    fontSize: 11,
    color: "#999",
  },
  memoText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  memoInput: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
  },
  memoInputAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#8e8e93",
    justifyContent: "center",
    alignItems: "center",
  },
  memoInputAvatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  memoInputContent: {
    flex: 1,
  },
  memoTextInput: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    minHeight: 36,
    maxHeight: 80,
  },
  memoInputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  memoCharCount: {
    fontSize: 11,
    color: "#999",
  },
  sendButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
});