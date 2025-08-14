import { StyleSheet, ViewStyle, Platform } from "react-native";
import { shadows } from "@/common/common-constants/ShadowConstants";

export const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%" as ViewStyle["width"],
    maxWidth: 500,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center" as const,
    ...shadows.modal,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    marginBottom: 15,
    color: "#333",
  },
  modalButton: {
    backgroundColor: "#007bff",
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    width: "100%" as ViewStyle["width"],
    alignItems: "center" as const,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  taskRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    width: "100%" as ViewStyle["width"],
    marginVertical: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  taskTitle: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  taskText: {
    fontSize: 20,
    color: "#333",
    textAlign: "center" as const,
    flex: 1,
  },

  countControls: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  countButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    marginHorizontal: 2,
  },
  countText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  valueTouchable: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginLeft: 10,
  },
  valueText: {
    fontSize: 16,
    color: "#333",
  },
  timeControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
});
